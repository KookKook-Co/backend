import {
    ChickenObj,
    ChickenRecordObj,
    DailyDataRecordInput,
    EnvironmentInput,
    FoodRecordObj,
    ImageInput,
    UserData,
    VacRecordInput,
    WaterRecordInput,
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

    createUser = (userData: UserData) =>
        this
            .dbPoolQuery(`INSERT INTO "User" ("username", "hashedPwd", "isCurrentUser", "firstName", "lastName", "role", "imgUrl", "hid") \
                VALUES ('${userData.username}', '${userData.hashedPwd}', '${userData.isCurrentUser}',
                '${userData.firstName}', '${userData.lastName}', '${userData.role}',
                 '${userData.imgUrl}', '${userData.hid}');`);
    getUserUid = (fname, lname) =>
        this.dbPoolQuery(`SELECT uid FROM "_User" \
                WHERE fname = '${fname}' AND lname = '${lname}';`);

    getUserPwd = (fname, lname) =>
        this.dbPoolQuery(`SELECT pwd FROM "_User" \
                WHERE fname = '${fname}' AND lname = '${lname}';`);

    deleteUser = (fname, lname) =>
        this.dbPoolQuery(`DELETE FROM "_User" \
                WHERE fname = '${fname}' AND lname = '${lname}';`);

    updateUserPwd = (fname, lname, newPwd) =>
        this.dbPoolQuery(`UPDATE "_User" \
                SET pwd = '${newPwd}' \
                WHERE fname = '${fname}' AND lname = '${lname}';`);

    createHouse = (house_id, length, width, scale) =>
        this.dbPoolQuery(`INSERT INTO "House" \
        (hid, length, width, scale) \
        VALUES (${house_id}, ${length}, ${width}, ${scale});`);
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

    createChicken = (chicObj: ChickenObj) =>
        this.dbPoolQuery(`INSERT INTO "Chicken" \
                ("dateIn", "dateOut", "generation", "type", "amountIn", "gender", "hid") \
                VALUES (TO_DATE('${chicObj.dateIn}', 'DD-MM-YYYY'), TO_DATE('${chicObj.dateOut}', 'DD-MM-YYYY'),
                  '${chicObj.generation}', '${chicObj.type}', ${chicObj.amountIn}, '${chicObj.gender}','${chicObj.hid}');`);

    getChickenInfo = (hid, gen) =>
        this
            .dbPoolQuery(`SELECT date_in, amount_in, type, gender FROM "Chicken" \
        WHERE hid = '${hid}' AND gen = '${gen}';`);

    createResponsibleWithID = (hid, uid) =>
        this.dbPoolQuery(`INSERT INTO "HasUser" (hid, uid) \
                    VALUES ('${hid}', '${uid}');`);

    createSensor = (
        sid: number,
        xPosSen: number,
        yPosSen: number,
        hid: number,
    ) =>
        this
            .dbPoolQuery(`INSERT INTO "Sensor" ("sid", "xPosSen", "yPosSen", "hid") \
                        VALUES ('${sid}','${xPosSen}', '${yPosSen}', '${hid}');`);
    getSensorInfo = sid =>
        this.dbPoolQuery(`SELECT hid, sen_x, sen_y FROM "Sensor" \
        WHERE sid = '${sid}';`);

    createEnvData = (environmentInput: EnvironmentInput) =>
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

    createCamera = (
        cid: number,
        xPosCam: number,
        yPosCam: number,
        hid: number,
    ) =>
        this
            .dbPoolQuery(`INSERT INTO "Camera" ("cid", "xPosCam", "yPosCam", "hid") \
                          VALUES ('${cid}', '${xPosCam}', '${yPosCam}', '${hid}');`);
    getCameraInfo = cid =>
        this.dbPoolQuery(`SELECT * FROM "Camera" WHERE cid = ${cid};`);
    createImage = (imageInput: ImageInput) =>
        this
            .dbPoolQuery(`INSERT INTO "Image" ("timestamp", "url", "cid", "hid")  \
                            VALUES (TO_TIMESTAMP(${imageInput.timestamp}), '${imageInput.url}',
                            '${imageInput.cid}', '${imageInput.hid}');`);

    createChickenRecord = (chickenRecordObj: ChickenRecordObj) =>
        this
            .dbPoolQuery(`INSERT INTO "ChickenRecord" ("chicTime","amountDead", "amountZleg", "amountDwaft", "amountSick", "date", "hid") \
                        VALUES (TO_TIMESTAMP(${chickenRecordObj.chicTime}), '${chickenRecordObj.amountDead}',
                        '${chickenRecordObj.amountZleg}', '${chickenRecordObj.amountDwaft}', '${chickenRecordObj.amountSick}',
                        TO_DATE('${chickenRecordObj.date}', 'DD-MM-YYYY'), '${chickenRecordObj.hid}');`);

    createDailyDataRecord = (dailyRecordInput: DailyDataRecordInput) =>
        this
            .dbPoolQuery(`INSERT INTO "DailyDataRecord" ("timestamp", "date", "hid") \
            VALUES (TO_TIMESTAMP(${dailyRecordInput.timestamp}), TO_DATE('${dailyRecordInput.date}', 'DD-MM-YYYY'), '${dailyRecordInput.hid}');`);

    createFoodRecord = (foodRecordObj: FoodRecordObj) =>
        this
            .dbPoolQuery(`INSERT INTO "FoodRecord" ("foodSilo", "foodIn", "foodRemain", "foodConsumed", "timestamp", "date", "hid") \
                        VALUES ('${foodRecordObj.foodSilo}','${foodRecordObj.foodIn}', '${foodRecordObj.foodRemain}',
                        '${foodRecordObj.foodConsumed}', TO_TIMESTAMP(${foodRecordObj.timestamp}),
                        TO_DATE('${foodRecordObj.date}', 'DD-MM-YYYY'), '${foodRecordObj.hid}');`);

    createVacRecord = (vacRecordInput: VacRecordInput) =>
        this
            .dbPoolQuery(`INSERT INTO "VacRecord" ("vacType", "vacConc", "timestamp", "date", "hid") \
                        VALUES ('${vacRecordInput.vacType}', '${vacRecordInput.vacConc}',
                        TO_TIMESTAMP('${vacRecordInput.timestamp}'), TO_DATE('${vacRecordInput.date}', 'DD-MM-YYYY'), '${vacRecordInput.hid}');`);

    createWaterRecord = (waterRecordInput: WaterRecordInput) =>
        this
            .dbPoolQuery(`INSERT INTO "WaterRecord" ("waterMeter1", "waterMeter2", "waterConsumed", "timestamp", "date", "hid") \
                        VALUES ('${waterRecordInput.waterMeter1}', '${waterRecordInput.waterMeter2}', '${waterRecordInput.waterConsumed}',
                        TO_TIMESTAMP('${waterRecordInput.timestamp}'), TO_DATE('${waterRecordInput.date}', 'DD-MM-YYYY'), '${waterRecordInput.hid}');`);
}
