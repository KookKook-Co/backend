import {
    CreateCamImgInput,
    CreateCameraInput,
    CreateChickenFlockInput,
    CreateChickenRecordInput,
    CreateDailyDataRecordInput,
    CreateEnvDataInput,
    CreateFoodRecordInput,
    CreateSensorInput,
    CreateUserInput,
    CreateVacRecordInput,
    CreateWaterRecordInput,
    LatestEnvironmentOutput,
    LatestUrl,
    LoginUserInfo,
    UserDataOutput,
} from './db.interfaces';

import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { poolQuery } from './utils';

@Injectable()
export class DbService {
    constructor(private readonly configService: ConfigService) {}

    private pool = new Pool({
        connectionString:
            process.env.DB_URI || this.configService.get<string>('DB_URI'),
    });

    private dbPoolQuery = query_list => poolQuery(this.pool, query_list);

    createUser = (createUserInput: CreateUserInput) =>
        this
            .dbPoolQuery(`INSERT INTO "User" ("username", "hashedPwd", "isCurrentUser", "firstName", "lastName", "role", "imageUrl", "hid") \
                VALUES ('${createUserInput.username}', '${createUserInput.hashedPwd}', '${createUserInput.isCurrentUser}',
                '${createUserInput.firstName}', '${createUserInput.lastName}', '${createUserInput.role}',
                 '${createUserInput.imageUrl}', '${createUserInput.hid}');`);

    getUserUid = (fname, lname) =>
        this.dbPoolQuery(`SELECT uid FROM "User" \
                WHERE fname = '${fname}' AND lname = '${lname}';`);

    getUserByUsername = (username: string) =>
        this.dbPoolQuery(`SELECT * FROM "User" \
                WHERE username = '${username}';`);

    getUser = async (uid: number): Promise<UserDataOutput> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT * FROM "User" WHERE uid = '${uid}'`,
        );
        return queryArr.rows[0];
    };

    getLoginUserInfo = async (uid: string): Promise<LoginUserInfo> => {
        const queryArr = await this
            .dbPoolQuery(`SELECT "H"."hno", "U"."imageUrl", "U"."role" FROM "User" "U" \
            LEFT JOIN "House" "H" \
            ON "U"."hid" = "H"."hid" \
            WHERE "U"."uid" = ${uid}`);
        return queryArr.rows[0];
    };

    getHid = async (hno: number) => {
        //this function return Dictionary containing hid
        const queryArr = await this.dbPoolQuery(
            `SELECT "H"."hno" \
            FROM "House" "H" \
            WHERE "H"."hid" = '${hno}';`,
        );
        const queryObj = queryArr.rows[0];
        return queryObj;
    };

    getLatestEnvironment = async (
        hid: number,
        sid: number,
    ): Promise<LatestEnvironmentOutput> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT "E"."windspeed", "E"."ammonia", "E"."temperature", "E"."humidity" \
            FROM "Environment" "E" \
            WHERE "E"."hid" = '${hid}' \
                AND "E"."sid" = '${sid}' \
                AND "E"."timestamp" = \
                    (SELECT MAX(timestamp) \
                    FROM "Environment" "E2"  \
                    WHERE "E2"."hid" = '${hid}' AND "E2"."sid" = '${sid}')`,
        );
        const queryObj = queryArr.rows[0];
        return queryObj;
    };

    getLastestUrl = async (hid: number, cid: number): Promise<LatestUrl> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT "I"."url" \
            FROM "Image" "I" \
            WHERE "I"."hid" = '${hid}' AND "I"."cid" = '${cid}' \
                AND "I"."timestamp" = \
                    (SELECT MAX(timestamp) \
                    FROM "Image" "I2"  \
                    WHERE "I2"."hid" = '${hid}' AND "I2"."cid" = '${cid}');`,
        );
        const queryObj = queryArr.rows[0];
        return queryObj;
    };

    deleteUser = (fname, lname) =>
        this.dbPoolQuery(`DELETE FROM "_User" \
                WHERE fname = '${fname}' AND lname = '${lname}';`);

    updateUserPwd = (fname, lname, newPwd) =>
        this.dbPoolQuery(`UPDATE "_User" \
                SET pwd = '${newPwd}' \
                WHERE fname = '${fname}' AND lname = '${lname}';`);

    createHouse = (hno, length, width, scale) =>
        this.dbPoolQuery(`INSERT INTO "House" \
        (hno, length, width, scale) \
        VALUES (${hno}, ${length}, ${width}, ${scale});`);

    getHouseInfo = house_id =>
        this.dbPoolQuery(`SELECT length, width, scale FROM "House" \
        WHERE hid = '${house_id}';`);

    createDailyRecord = (date, hid) =>
        this.dbPoolQuery(`INSERT INTO "DailyRecord" (date, hid) \
                VALUES (TO_DATE('${date}', 'DD-MM-YYYY'), '${hid}');`);

    getDailyRecord = hid =>
        this.dbPoolQuery(`SELECT date FROM "DailyRecord" \
                WHERE hid = '${hid}';`);

    deleteDailyRecord = (date, hid) =>
        this.dbPoolQuery(`DELETE FROM "DailyRecord" \
                WHERE hid = '${hid}' AND date = TO_DATE('${date}', 'DD-MM-YYYY');`);

    createChickenFlock = (createChickenInput: CreateChickenFlockInput) =>
        this.dbPoolQuery(`INSERT INTO "Chicken" \
                ("dateIn", "dateOut", "generation", "type", "amountIn", "gender", "hid") \
                VALUES (TO_DATE('${createChickenInput.dateIn}', 'DD-MM-YYYY'), TO_DATE('${createChickenInput.dateOut}', 'DD-MM-YYYY'),
                  '${createChickenInput.generation}', '${createChickenInput.type}', ${createChickenInput.amountIn}, '${createChickenInput.gender}','${createChickenInput.hid}');`);

    getChickenInfo = (hid, gen) =>
        this
            .dbPoolQuery(`SELECT date_in, amount_in, type, gender FROM "Chicken" \
        WHERE hid = '${hid}' AND gen = '${gen}';`);

    createResponsibleWithID = (hid, uid) =>
        this.dbPoolQuery(`INSERT INTO "HasUser" (hid, uid) \
                    VALUES ('${hid}', '${uid}');`);

    createSensor = (input: CreateSensorInput) =>
        this
            .dbPoolQuery(`INSERT INTO "Sensor" ("sid", "xPosSen", "yPosSen", "hid") \
                        VALUES ('${input.sid}','${input.xPosSen}', '${input.yPosSen}', '${input.hid}');`);

    getSensorInfo = sid =>
        this.dbPoolQuery(`SELECT hid, sen_x, sen_y FROM "Sensor" \
        WHERE sid = '${sid}';`);

    createEnvData = (environmentInput: CreateEnvDataInput) =>
        this
            .dbPoolQuery(`INSERT INTO "Environment" (timestamp, windspeed, ammonia, temperature, humidity, sid, hid) \
                            VALUES (TO_TIMESTAMP(${environmentInput.timestamp}), ${environmentInput.windspeed},
                            '${environmentInput.ammonia}', '${environmentInput.temperature}', '${environmentInput.humidity}',
                            '${environmentInput.sid}', '${environmentInput.hid}');`);
    getLatestEnvData = hid =>
        this.dbPoolQuery(`SELECT * FROM "Environment"
                        WHERE hid = ${hid} ORDER BY timestamp DESC LIMIT 1;`);

    getEnvDataByDate = (hid, date) =>
        this.dbPoolQuery(`SELECT * FROM "Environment" WHERE hid = ${hid}
        AND timestamp BETWEEN TO_TIMESTAMP('${date} 00:00:00','DD-MM-YYYY HH24:MI:SS') 
        AND TO_TIMESTAMP('${date} 23:59:59','DD-MM-YYYY HH24:MI:SS')`);

    createCamera = (input: CreateCameraInput) =>
        this
            .dbPoolQuery(`INSERT INTO "Camera" ("cid", "xPosCam", "yPosCam", "hid") \
                          VALUES ('${input.cid}', '${input.xPosCam}', '${input.yPosCam}', '${input.hid}');`);
    getCameraInfo = cid =>
        this.dbPoolQuery(`SELECT * FROM "Camera" WHERE cid = ${cid};`);
    createImage = (imageInput: CreateCamImgInput) =>
        this
            .dbPoolQuery(`INSERT INTO "Image" ("timestamp", "url", "cid", "hid")  \
                            VALUES (TO_TIMESTAMP(${imageInput.timestamp}), '${imageInput.url}',
                            '${imageInput.cid}', '${imageInput.hid}');`);

    createChickenRecord = (chickenRecordInput: CreateChickenRecordInput) =>
        this
            .dbPoolQuery(`INSERT INTO "ChickenRecord" ("chicTime","amountDead", "amountZleg", "amountDwaft", "amountSick", "date", "hid") \
                        VALUES (TO_TIMESTAMP(${chickenRecordInput.chicTime}), '${chickenRecordInput.amountDead}',
                        '${chickenRecordInput.amountZleg}', '${chickenRecordInput.amountDwaft}', '${chickenRecordInput.amountSick}',
                        TO_DATE('${chickenRecordInput.date}', 'DD-MM-YYYY'), '${chickenRecordInput.hid}');`);

    createDailyDataRecord = (dailyRecordInput: CreateDailyDataRecordInput) =>
        this
            .dbPoolQuery(`INSERT INTO "DailyDataRecord" ("timestamp", "date", "hid") \
            VALUES (TO_TIMESTAMP(${dailyRecordInput.timestamp}), TO_DATE('${dailyRecordInput.date}', 'DD-MM-YYYY'), '${dailyRecordInput.hid}');`);

    createFoodRecord = (foodRecordInput: CreateFoodRecordInput) =>
        this
            .dbPoolQuery(`INSERT INTO "FoodRecord" ("foodSilo", "foodIn", "foodRemain", "foodConsumed", "timestamp", "date", "hid") \
                        VALUES ('${foodRecordInput.foodSilo}','${foodRecordInput.foodIn}', '${foodRecordInput.foodRemain}',
                        '${foodRecordInput.foodConsumed}', TO_TIMESTAMP(${foodRecordInput.timestamp}),
                        TO_DATE('${foodRecordInput.date}', 'DD-MM-YYYY'), '${foodRecordInput.hid}');`);

    createVacRecord = (vacRecordInput: CreateVacRecordInput) =>
        this
            .dbPoolQuery(`INSERT INTO "VacRecord" ("vacType", "vacConc", "timestamp", "date", "hid") \
                        VALUES ('${vacRecordInput.vacType}', '${vacRecordInput.vacConc}',
                        TO_TIMESTAMP('${vacRecordInput.timestamp}'), TO_DATE('${vacRecordInput.date}', 'DD-MM-YYYY'), '${vacRecordInput.hid}');`);

    createWaterRecord = (waterRecordInput: CreateWaterRecordInput) =>
        this
            .dbPoolQuery(`INSERT INTO "WaterRecord" ("waterMeter1", "waterMeter2", "waterConsumed", "timestamp", "date", "hid") \
                        VALUES ('${waterRecordInput.waterMeter1}', '${waterRecordInput.waterMeter2}', '${waterRecordInput.waterConsumed}',
                        TO_TIMESTAMP('${waterRecordInput.timestamp}'), TO_DATE('${waterRecordInput.date}', 'DD-MM-YYYY'), '${waterRecordInput.hid}');`);
}
