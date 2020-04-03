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
    EnvironmentBetweenTimestampOutput,
    EnvironmentOutput,
    GetChickenFlockInfoOutput,
    GetEnvironmentBySidOutput,
    LastImageForEachCameraOutput,
    LatestUrl,
    LoginUserInfo,
    UpdateFoodRecordInput,
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
    //////////////////////////////////////////////////////////////////////////////
    //create Function

    createUser = (createUserInput: CreateUserInput) =>
        this
            .dbPoolQuery(`INSERT INTO "User" ("username", "hashedPwd", "isCurrentUser", "firstName", "lastName", "lineID", "role", "imageUrl", "hid") \
                VALUES ('${createUserInput.username}', '${createUserInput.hashedPwd}', '${createUserInput.isCurrentUser}',
                '${createUserInput.firstName}', '${createUserInput.lastName}', '${createUserInput.lineID}', '${createUserInput.role}',
                 '${createUserInput.imageUrl}', '${createUserInput.hid}');`);

    createHouse = (hno: number, length: number, width: number, scale: number) =>
        this.dbPoolQuery(`INSERT INTO "House" \
                 (hno, length, width, scale) \
                 VALUES (${hno}, ${length}, ${width}, ${scale});`);

    createDailyRecord = (date: string, hid: number) =>
        this.dbPoolQuery(`INSERT INTO "DailyRecord" (date, hid) \
                VALUES (TO_DATE('${date}', 'DD-MM-YYYY'), '${hid}');`);

    createChickenFlock = (createChickenInput: CreateChickenFlockInput) =>
        this.dbPoolQuery(`INSERT INTO "Chicken" \
                        ("dateIn", "dateOut", "generation", "type", "amountIn", "gender", "hid") \
                        VALUES (TO_DATE('${createChickenInput.dateIn}', 'DD-MM-YYYY'), TO_DATE('${createChickenInput.dateOut}', 'DD-MM-YYYY'),
                          '${createChickenInput.generation}', '${createChickenInput.type}', ${createChickenInput.amountIn}, '${createChickenInput.gender}','${createChickenInput.hid}');`);

    createSensor = (input: CreateSensorInput) =>
        this
            .dbPoolQuery(`INSERT INTO "Sensor" ("sid", "xPosSen", "yPosSen", "hid") \
                        VALUES ('${input.sid}','${input.xPosSen}', '${input.yPosSen}', '${input.hid}');`);

    createEnvData = (environmentInput: CreateEnvDataInput) =>
        this
            .dbPoolQuery(`INSERT INTO "Environment" (timestamp, windspeed, ammonia, temperature, humidity, sid) \
                            VALUES (TO_TIMESTAMP(${environmentInput.timestamp}), ${environmentInput.windspeed},
                            '${environmentInput.ammonia}', '${environmentInput.temperature}', '${environmentInput.humidity}',
                            '${environmentInput.sid}');`);

    createCamera = (input: CreateCameraInput) =>
        this
            .dbPoolQuery(`INSERT INTO "Camera" ("cid", "cno", "xPosCam", "yPosCam", "hid") \
                                              VALUES ('${input.cid}', '${input.cno}', '${input.xPosCam}', '${input.yPosCam}', '${input.hid}');`);

    createImage = (imageInput: CreateCamImgInput) =>
        this
            .dbPoolQuery(`INSERT INTO "Image" ("timestamp", "url", "amountDead", "cid")  \
                        VALUES (TO_TIMESTAMP(${imageInput.timestamp}), '${imageInput.url}',
                        '${imageInput.amountDead}', '${imageInput.cid}');`);

    createDailyDataRecord = (dailyRecordInput: CreateDailyDataRecordInput) =>
        this
            .dbPoolQuery(`INSERT INTO "DailyDataRecord" ("timestamp", "date", "hid") \
        VALUES (TO_TIMESTAMP(${dailyRecordInput.timestamp}), TO_DATE('${dailyRecordInput.date}', 'DD-MM-YYYY'), '${dailyRecordInput.hid}');`);

    createChickenRecord = (chickenRecordInput: CreateChickenRecordInput) =>
        this
            .dbPoolQuery(`INSERT INTO "ChickenRecord" ("chicTime", "period", "amountDead", "amountZleg", "amountDwaft", "amountSick", "date", "hid") \
                        VALUES (TO_TIMESTAMP(${chickenRecordInput.chicTime}), '${chickenRecordInput.period}', '${chickenRecordInput.amountDead}',
                        '${chickenRecordInput.amountZleg}', '${chickenRecordInput.amountDwaft}', '${chickenRecordInput.amountSick}',
                        TO_DATE('${chickenRecordInput.date}', 'DD-MM-YYYY'), '${chickenRecordInput.hid}');`);

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

    createCollectedDeadChickenTime = (timestamp: string, cid: string) =>
        this
            .dbPoolQuery(`INSERT INTO "CollectedDeadChickenTime" ("timestamp", "cid") \
                    VALUES (TO_TIMESTAMP('${timestamp}'), '${cid}';`);

    //////////////////////////////////////////////////////////////////////////////
    //table User

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

    isUsernameExist = async (username: string): Promise<Boolean> => {
        const queryArr = await this.dbPoolQuery(`SELECT COUNT(1) FROM "User" \
                        WHERE username = '${username}';`);
        return queryArr.rows[0]['count'] == 0 ? false : true;
    };

    updateLineID = (uid: number, newLineID: string) =>
        this.dbPoolQuery(`UPDATE "User" \
                SET "lineID" = '${newLineID}' \
                WHERE "uid" = '${uid}';`);

    //////////////////////////////////////////////////////////////////////////////
    //table House

    getHid = async (hno: number) => {
        //this function return Dictionary containing hid
        const queryArr = await this.dbPoolQuery(
            `SELECT "H"."hno" \
            FROM "House" "H" \
            WHERE "H"."hid" = '${hno}';`,
        );
        return queryArr.rows[0];
    };

    getHouseInfo = (hno: number) =>
        this.dbPoolQuery(`SELECT hid, length, width, scale FROM "House" \
        WHERE hno = '${hno}';`);

    //////////////////////////////////////////////////////////////////////////////
    //table DailyRecord

    getDailyRecord = hid =>
        this.dbPoolQuery(`SELECT date FROM "DailyRecord" \
                WHERE hid = '${hid}';`);

    deleteDailyRecord = (date, hid) =>
        this.dbPoolQuery(`DELETE FROM "DailyRecord" \
                WHERE hid = '${hid}' AND date = TO_DATE('${date}', 'DD-MM-YYYY');`);

    isDailyRecordTupleExist = async (
        date: string,
        hid: number,
    ): Promise<Boolean> => {
        const queryArr = await this
            .dbPoolQuery(`SELECT COUNT(1) FROM "DailyRecord" \
                    WHERE date = TO_DATE('${date}', 'DD-MM-YYYY') AND hid = '${hid}';`);
        return queryArr.rows[0]['count'] == 0 ? false : true;
    };

    //////////////////////////////////////////////////////////////////////////////
    //table Chicken

    getChickenFlockInfo = async (
        hid: number,
    ): Promise<GetChickenFlockInfoOutput> => {
        const queryArr = await this.dbPoolQuery(`SELECT * FROM "Chicken" \
                    WHERE hid = ${hid}`);
        return queryArr.rows[0];
    };

    getChickenInfo = (hid: number, gen: string) =>
        this
            .dbPoolQuery(`SELECT "date_in", "amount_in", "type", "gender" FROM "Chicken" \
        WHERE "hid" = '${hid}' AND "gen" = '${gen}';`);

    //////////////////////////////////////////////////////////////////////////////
    //table Sensor

    getSidByHidAndPosition = async (
        hid: number,
        xPosSen: number,
        yPosSen: number,
    ) => {
        const queryArr = await this.dbPoolQuery(`SELECT "sid" FROM "Sensor" \
            WHERE "hid" = '${hid}' AND "xPosSen" = '${xPosSen}' AND "yPosSen" = '${yPosSen}';`);
        return queryArr.rows[0];
    };

    getAllSensorInfoByHid = async (hid: number) => {
        const queryArr = await this
            .dbPoolQuery(`SELECT "sid", "xPosSen", "yPosSen" FROM "Sensor" \
            WHERE "hid" = '${hid}';`);
        return queryArr.rows;
    };

    //////////////////////////////////////////////////////////////////////////////
    //table Environment

    createEnvQueryString = (environmentInput: CreateEnvDataInput) =>
        `INSERT INTO "Environment" (timestamp, windspeed, ammonia, temperature, humidity, sid) \
                            VALUES (TO_TIMESTAMP(${environmentInput.timestamp}), ${environmentInput.windspeed},
                            '${environmentInput.ammonia}', '${environmentInput.temperature}', '${environmentInput.humidity}',
                            '${environmentInput.sid}');`;

    createEnvFromList = async (
        environmentInputList: Array<CreateEnvDataInput>,
    ) => {
        let envInputList = environmentInputList;
        console.log(envInputList);
        let queryString = '';
        for (let ele in envInputList) {
            console.log(ele);
            let tmp = this.createEnvQueryString(envInputList[ele]);
            queryString = queryString + tmp;
        }
        return this.dbPoolQuery(queryString);
    };

    //this one need to fix
    getEnvDataByDate = async (hid: number, date: string) => {
        const queryArr = await this.dbPoolQuery(
            `SELECT * FROM "Environment" WHERE hid = ${hid}
            AND timestamp BETWEEN TO_TIMESTAMP('${date} 00:00:00','DD-MM-YYYY HH24:MI:SS') 
            AND TO_TIMESTAMP('${date} 23:59:59','DD-MM-YYYY HH24:MI:SS')`,
        );
        return queryArr.rows;
    };

    //this one need to fix
    getLatestEnvironment = async (
        hid: number,
        sid: string,
    ): Promise<EnvironmentOutput> => {
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
        return queryArr.rows[0];
    };

    //this one need to fix
    getLatestEnvironmentBySid = async (
        sid: string,
        hid: number,
    ): Promise<GetEnvironmentBySidOutput> => {
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
        return { sid: sid, hid: hid, environment: queryArr.rows[0] };
    };

    //this one need to fix
    getEnvironmentBetweenTimestampBySid = async (
        sid,
        hid,
        tsStart,
        tsEnd,
    ): Promise<EnvironmentBetweenTimestampOutput> => {
        const queryArr = await this
            .dbPoolQuery(`SELECT "timestamp", "windspeed", "ammonia", "temperature", "humidity" FROM "Environment" \
            WHERE sid = '${sid}' \
            AND timestamp BETWEEN TO_TIMESTAMP('${tsStart}') \
            AND TO_TIMESTAMP('${tsEnd}');`);
        return { sid: sid, hid: hid, environmentSet: queryArr.rows };
    };

    //////////////////////////////////////////////////////////////////////////////
    //table Camera

    getCameraInfo = cid =>
        this.dbPoolQuery(`SELECT * FROM "Camera" WHERE cid = ${cid};`);

    //////////////////////////////////////////////////////////////////////////////
    //table Image

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
        return queryArr.rows[0];
    };

    getLastImageForEachCameraInHid = async (
        hid: number,
    ): Promise<Array<LastImageForEachCameraOutput>> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT "C"."cid", "C"."xPosCam", "C"."yPosCam", "I"."url", "I"."amountDead"
            FROM "Camera" "C" JOIN "Image" "I" ON "C"."cid" = "I"."cid"
            WHERE "C"."hid" = ${hid} AND "I"."timestamp" = (
                SELECT MAX(timestamp) FROM "Image"
                WHERE "cid" = "C"."cid" AND "amountDead" IS NOT NULL);`,
        );
        return queryArr.rows;
    };

    getLatestAmountDeadChickenByCid = async (cid: string, hid: number) => {
        const queryArr = await this.dbPoolQuery(
            `SELECT "I"."amountDead" \
            FROM "Image" "I" \
            WHERE "I"."hid" = '${hid}' \
                AND "I"."cid" = '${cid}' \
                AND "I"."timestamp" = \
                    (SELECT MAX(timestamp) \
                        FROM "Image" "I2"  \
                        WHERE "I2"."hid" = '${hid}' AND "I2"."cid" = '${cid}')`,
        );
        return queryArr.rows[0];
    };

    //////////////////////////////////////////////////////////////////////////////
    //table ChickenRecord

    getLatestChickenRecordByHidAndDate = async (hid: number, date: string) => {
        const queryArr = await this
            .dbPoolQuery(`SELECT DISTINCT ON ("period") * FROM "ChickenRecord"
        WHERE hid = ${hid} AND date = TO_DATE('${date}', 'DD-MM-YYYY')
        ORDER BY "period", "chicTime" DESC;`);
        return queryArr.rows;
    };

    //////////////////////////////////////////////////////////////////////////////
    //table DailyDataRecord

    isDailyDataRecordTupleExist = async (
        timestamp: string,
        date: string,
        hid: number,
    ): Promise<Boolean> => {
        const queryArr = await this
            .dbPoolQuery(`SELECT COUNT(1) FROM "DailyDataRecord" \
                WHERE timestamp = TO_TIMESTAMP('${timestamp}') AND date = TO_DATE('${date}', 'DD-MM-YYYY') AND hid = '${hid}';`);
        return queryArr.rows[0]['count'] == 0 ? false : true;
    };

    //////////////////////////////////////////////////////////////////////////////
    //table FoodRecord

    getLatestFoodRecordByHidAndDate = async (hid: number, date: string) => {
        const queryArr = await this
            .dbPoolQuery(`SELECT DISTINCT ON ("foodSilo") * FROM "FoodRecord"
        WHERE hid = ${hid} AND date = TO_DATE('${date}', 'DD-MM-YYYY')
        ORDER BY "foodSilo", "timestamp" DESC;`);
        return queryArr.rows;
    };

    //////////////////////////////////////////////////////////////////////////////
    //table VacRecord

    getLatestVacRecordByHidAndDate = async (hid: number, date: string) => {
        const queryArr = await this.dbPoolQuery(`SELECT  * FROM "VacRecord"
                        WHERE hid = ${hid} AND date = TO_DATE('${date}', 'DD-MM-YYYY')
                        ORDER BY timestamp DESC LIMIT 1;`);
        return queryArr.rows[0];
    };
    //////////////////////////////////////////////////////////////////////////////
    //table WaterRecord

    getLatestWaterRecordByHidAndDate = async (hid: number, date: string) => {
        const queryArr = await this.dbPoolQuery(`SELECT  * FROM "WaterRecord"
                                    WHERE hid = ${hid} AND date = TO_DATE('${date}', 'DD-MM-YYYY')
                                    ORDER BY timestamp DESC LIMIT 1;`);
        return queryArr.rows[0];
    };
    //////////////////////////////////////////////////////////////////////////////
    //Temperature

    getLast24HrsTemperatureBySid = async (sid: string) => {
        const queryArr = await this
            .dbPoolQuery(`SELECT "temperature" FROM "Environment" \
        WHERE "sid" = '${sid}' \
        AND "timestamp" >= NOW() - INTERVAL '1' DAY;`);
        return queryArr.rows;
    };

    getLatestTemperatureBySid = async (sid: string) => {
        const queryArr = await this
            .dbPoolQuery(`SELECT "temperature" FROM "Environment" \
        WHERE "sid" = '${sid}' ORDER BY timestamp DESC LIMIT 1;`);
        return queryArr.rows[0];
    };

    getTemperatureBetweenTimestampBySid = async (
        sid: string,
        tsStart: string,
        tsEnd: string,
    ) => {
        const queryArr = await this
            .dbPoolQuery(`SELECT "timestamp", "temperature" FROM "Environment" \
        WHERE "sid" = '${sid}' \
        AND timestamp BETWEEN TO_TIMESTAMP('${tsStart}') \
        AND TO_TIMESTAMP('${tsEnd}');`);
        return queryArr.rows;
    };

    getLastNTemperatureBySid = async (sid: string, number: number) => {
        const queryArr = await this
            .dbPoolQuery(`SELECT "timestamp", "temperature" FROM "Environment" \
        WHERE "sid" = '${sid}' \
        ORDER BY timestamp DESC LIMIT '${number}';`);
        return queryArr.rows;
    };

    getMaxAndMinTemperatureBetweenDateBySid = async (
        sid: string,
        dateStart: string,
        dateEnd: string,
    ) => {
        const queryArr = await this
            .dbPoolQuery(`SELECT MAX("temperature"), MIN("temperature") FROM "Environment" \
        WHERE "sid" = '${sid}' \
        AND timestamp BETWEEN TO_TIMESTAMP('${dateStart} 00:00:00','DD-MM-YYYY HH24:MI:SS') \
        AND TO_TIMESTAMP('${dateEnd} 23:59:59','DD-MM-YYYY HH24:MI:SS');`);
        return queryArr.rows[0];
    };

    //////////////////////////////////////////////////////////////////////////////
    //Humidity

    getLast24HrsHumidityBySid = async (sid: string) => {
        const queryArr = await this
            .dbPoolQuery(`SELECT "humidity" FROM "Environment" \
        WHERE "sid" = '${sid}' \
        AND "timestamp" >= NOW() - INTERVAL '1' DAY;`);
        return queryArr.rows;
    };

    getLatestHumidityBySid = async (sid: string) => {
        const queryArr = await this
            .dbPoolQuery(`SELECT "humidity" FROM "Environment" \
        WHERE "sid" = '${sid}' ORDER BY timestamp DESC LIMIT 1;`);
        return queryArr.rows[0];
    };

    getHumidityBetweenTimestampBySid = async (
        sid: string,
        tsStart: string,
        tsEnd: string,
    ) => {
        const queryArr = await this
            .dbPoolQuery(`SELECT "timestamp", "humidity" FROM "Environment" \
        WHERE "sid" = '${sid}' \
        AND timestamp BETWEEN TO_TIMESTAMP('${tsStart}') \
        AND TO_TIMESTAMP('${tsEnd}');`);
        return queryArr.rows;
    };

    getLastNHumidityBySid = async (sid: string, number: number) => {
        const queryArr = await this
            .dbPoolQuery(`SELECT "timestamp", "humidity" FROM "Environment" \
        WHERE "sid" = '${sid}' \
        ORDER BY timestamp DESC LIMIT '${number}';`);
        return queryArr.rows;
    };

    //////////////////////////////////////////////////////////////////////////////
    //Ammonia

    getLast24HrsAmmoniaBySid = async (sid: string) => {
        const queryArr = await this
            .dbPoolQuery(`SELECT "ammonia" FROM "Environment" \
        WHERE "sid" = '${sid}' \
        AND "timestamp" >= NOW() - INTERVAL '1' DAY;`);
        return queryArr.rows;
    };

    getLatestAmmoniaBySid = async (sid: string) => {
        const queryArr = await this
            .dbPoolQuery(`SELECT "ammonia" FROM "Environment" \
        WHERE "sid" = '${sid}' ORDER BY timestamp DESC LIMIT 1;`);
        return queryArr.rows[0];
    };

    getAmmoniaBetweenTimestampBySid = async (
        sid: string,
        tsStart: string,
        tsEnd: string,
    ) => {
        const queryArr = await this
            .dbPoolQuery(`SELECT "timestamp", "ammonia" FROM "Environment" \
        WHERE "sid" = '${sid}' \
        AND timestamp BETWEEN TO_TIMESTAMP('${tsStart}') \
        AND TO_TIMESTAMP('${tsEnd}');`);
        return queryArr.rows;
    };

    getLastNAmmoniaBySid = async (sid: string, number: number) => {
        const queryArr = await this
            .dbPoolQuery(`SELECT "timestamp", "ammonia" FROM "Environment" \
        WHERE "sid" = '${sid}' \
        ORDER BY timestamp DESC LIMIT '${number}';`);
        return queryArr.rows;
    };

    //////////////////////////////////////////////////////////////////////////////
    //Windspeed

    getLast24HrsWindspeedBySid = async (sid: string) => {
        const queryArr = await this
            .dbPoolQuery(`SELECT "windspeed" FROM "Environment" \
        WHERE "sid" = '${sid}' \
        AND "timestamp" >= NOW() - INTERVAL '1' DAY;`);
        return queryArr.rows;
    };

    getLatestWindspeedBySid = async (sid: string) => {
        const queryArr = await this
            .dbPoolQuery(`SELECT "windspeed" FROM "Environment" \
        WHERE "sid" = '${sid}' ORDER BY timestamp DESC LIMIT 1;`);
        return queryArr.rows[0];
    };

    getWindspeedBetweenTimestampBySid = async (
        sid: string,
        tsStart: string,
        tsEnd: string,
    ) => {
        const queryArr = await this
            .dbPoolQuery(`SELECT "timestamp", "windspeed" FROM "Environment" \
        WHERE "sid" = '${sid}' \
        AND timestamp BETWEEN TO_TIMESTAMP('${tsStart}') \
        AND TO_TIMESTAMP('${tsEnd}');`);
        return queryArr.rows;
    };

    getLastNWindspeedityBySid = async (sid: string, number: number) => {
        const queryArr = await this
            .dbPoolQuery(`SELECT "timestamp", "windspeed" FROM "Environment" \
        WHERE "sid" = '${sid}' \
        ORDER BY timestamp DESC LIMIT '${number}';`);
        return queryArr.rows;
    };
}
