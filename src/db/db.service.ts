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
    EnvironmentInfoSetOutput,
    EnvironmentInfoSetAndSidOutput,
    ChickenFlockInfoOutput,
    HouseOutput,
    LastImageForEachCameraOutput,
    LatestUrl,
    LoginUserInfo,
    SensorOutput,
    UserDataOutput,
    CameraOutput,
    ChickenRecord,
    FoodRecord,
    VacRecord,
    WaterRecord,
    TemperatureTimestamp,
    HumidityTimestamp,
    AmmoniaTimestamp,
    WindspeedTimestamp,
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
            .dbPoolQuery(`INSERT INTO "User" ("username", "hashedPwd", "isCurrentUser", "firstName", "lastName", "lineID", "role", "imageUrl", "hid") 
                VALUES ('${createUserInput.username}', '${createUserInput.hashedPwd}', '${createUserInput.isCurrentUser}',
                '${createUserInput.firstName}', '${createUserInput.lastName}', '${createUserInput.lineID}', '${createUserInput.role}',
                 '${createUserInput.imageUrl}', '${createUserInput.hid}');`);

    createHouse = (hno: number, length: number, width: number, scale: number) =>
        this.dbPoolQuery(`INSERT INTO "House" 
                 (hno, length, width, scale) 
                 VALUES (${hno}, ${length}, ${width}, ${scale});`);

    createDailyRecord = (date: string, hid: number) =>
        this.dbPoolQuery(`INSERT INTO "DailyRecord" (date, hid) 
                VALUES (TO_DATE('${date}', 'DD-MM-YYYY'), '${hid}');`);

    createChickenFlock = (createChickenInput: CreateChickenFlockInput) =>
        this.dbPoolQuery(`INSERT INTO "Chicken" 
                        ("dateIn", "dateOut", "generation", "type", "amountIn", "gender", "hid") 
                        VALUES (TO_DATE('${createChickenInput.dateIn}', 'DD-MM-YYYY'), TO_DATE('${createChickenInput.dateOut}', 'DD-MM-YYYY'),
                          '${createChickenInput.generation}', '${createChickenInput.type}', ${createChickenInput.amountIn}, '${createChickenInput.gender}','${createChickenInput.hid}');`);

    createSensor = (input: CreateSensorInput) =>
        this
            .dbPoolQuery(`INSERT INTO "Sensor" ("sid", "xPosSen", "yPosSen", "hid") 
                        VALUES ('${input.sid}','${input.xPosSen}', '${input.yPosSen}', '${input.hid}');`);

    createEnvData = (environmentInput: CreateEnvDataInput) =>
        this
            .dbPoolQuery(`INSERT INTO "Environment" (timestamp, windspeed, ammonia, temperature, humidity, sid) 
                            VALUES (TO_TIMESTAMP(${environmentInput.timestamp}), ${environmentInput.windspeed},
                            '${environmentInput.ammonia}', '${environmentInput.temperature}', '${environmentInput.humidity}',
                            '${environmentInput.sid}');`);

    createCamera = (input: CreateCameraInput) =>
        this
            .dbPoolQuery(`INSERT INTO "Camera" ("cid", "cno", "xPosCam", "yPosCam", "hid") 
                                              VALUES ('${input.cid}', '${input.cno}', '${input.xPosCam}', '${input.yPosCam}', '${input.hid}');`);

    createImage = (imageInput: CreateCamImgInput) =>
        this
            .dbPoolQuery(`INSERT INTO "Image" ("timestamp", "url", "amountDead", "cid")  
                        VALUES (TO_TIMESTAMP(${imageInput.timestamp}), '${imageInput.url}',
                        '${imageInput.amountDead}', '${imageInput.cid}');`);

    createDailyDataRecord = (dailyRecordInput: CreateDailyDataRecordInput) =>
        this
            .dbPoolQuery(`INSERT INTO "DailyDataRecord" ("timestamp", "date", "hid") 
        VALUES (TO_TIMESTAMP(${dailyRecordInput.timestamp}), TO_DATE('${dailyRecordInput.date}', 'DD-MM-YYYY'), '${dailyRecordInput.hid}');`);

    createChickenRecord = (chickenRecordInput: CreateChickenRecordInput) =>
        this
            .dbPoolQuery(`INSERT INTO "ChickenRecord" ("chicTime", "period", "amountDead", "amountZleg", "amountDwaft", "amountSick", "date", "hid") 
                        VALUES (TO_TIMESTAMP(${chickenRecordInput.chicTime}), '${chickenRecordInput.period}', '${chickenRecordInput.amountDead}',
                        '${chickenRecordInput.amountZleg}', '${chickenRecordInput.amountDwaft}', '${chickenRecordInput.amountSick}',
                        TO_DATE('${chickenRecordInput.date}', 'DD-MM-YYYY'), '${chickenRecordInput.hid}');`);

    createFoodRecord = (foodRecordInput: CreateFoodRecordInput) =>
        this
            .dbPoolQuery(`INSERT INTO "FoodRecord" ("foodSilo", "foodIn", "foodRemain", "foodConsumed", "timestamp", "date", "hid") 
                                        VALUES ('${foodRecordInput.foodSilo}','${foodRecordInput.foodIn}', '${foodRecordInput.foodRemain}',
                                        '${foodRecordInput.foodConsumed}', TO_TIMESTAMP(${foodRecordInput.timestamp}),
                                        TO_DATE('${foodRecordInput.date}', 'DD-MM-YYYY'), '${foodRecordInput.hid}');`);

    createVacRecord = (vacRecordInput: CreateVacRecordInput) =>
        this
            .dbPoolQuery(`INSERT INTO "VacRecord" ("vacType", "vacConc", "timestamp", "date", "hid") 
                    VALUES ('${vacRecordInput.vacType}', '${vacRecordInput.vacConc}',
                    TO_TIMESTAMP('${vacRecordInput.timestamp}'), TO_DATE('${vacRecordInput.date}', 'DD-MM-YYYY'), '${vacRecordInput.hid}');`);

    createWaterRecord = (waterRecordInput: CreateWaterRecordInput) =>
        this
            .dbPoolQuery(`INSERT INTO "WaterRecord" ("waterMeter1", "waterMeter2", "waterConsumed", "timestamp", "date", "hid") 
                    VALUES ('${waterRecordInput.waterMeter1}', '${waterRecordInput.waterMeter2}', '${waterRecordInput.waterConsumed}',
                    TO_TIMESTAMP('${waterRecordInput.timestamp}'), TO_DATE('${waterRecordInput.date}', 'DD-MM-YYYY'), '${waterRecordInput.hid}');`);

    createCollectedDeadChickenTime = (timestamp: string, cid: string) =>
        this
            .dbPoolQuery(`INSERT INTO "CollectedDeadChickenTime" ("timestamp", "cid") 
                    VALUES (TO_TIMESTAMP('${timestamp}'), '${cid}');`);

    //////////////////////////////////////////////////////////////////////////////
    //table User

    getUserByUsername = async (username: string): Promise<UserDataOutput> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT * FROM "User" 
            WHERE username = '${username}';`,
        );
        return queryArr.rows[0];
    };

    getUserByUid = async (uid: number): Promise<UserDataOutput> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT * FROM "User" 
            WHERE uid = '${uid}'`,
        );
        return queryArr.rows[0];
    };

    getLoginUserInfoByUid = async (uid: number): Promise<LoginUserInfo> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT "H"."hno", "U"."imageUrl", "U"."role" 
            FROM "User" "U" 
            LEFT JOIN "House" "H" ON "U"."hid" = "H"."hid" 
            WHERE "U"."uid" = ${uid}`,
        );
        return queryArr.rows[0];
    };

    isUsernameExist = async (username: string): Promise<Boolean> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT COUNT(1) 
            FROM "User" 
            WHERE username = '${username}';`,
        );
        return queryArr.rows[0]['count'] == 0 ? false : true;
    };

    updateLineID = async (uid: number, newLineID: string) => {
        await this.dbPoolQuery(
            `UPDATE "User" 
            SET "lineID" = '${newLineID}' 
            WHERE "uid" = '${uid}';`,
        );
    };

    //////////////////////////////////////////////////////////////////////////////
    //table House

    getHidByHno = async (hno: number): Promise<number> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT "H"."hno" 
            FROM "House" "H" 
            WHERE "H"."hid" = '${hno}';`,
        );
        return queryArr.rows[0];
    };

    getHouseInfoByHno = async (hno: number): Promise<HouseOutput> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT hid, length, width, scale FROM "House" 
            WHERE hno = '${hno}';`,
        );
        return queryArr.rows[0];
    };

    //////////////////////////////////////////////////////////////////////////////
    //table DailyRecord

    getDailyRecord = async (hid: number) => {
        const queryArr = await this.dbPoolQuery(
            `SELECT date
            FROM "DailyRecord" 
            WHERE "hid" = '${hid}';`,
        );
        return queryArr.rows;
    };

    deleteDailyRecord = async (hid: number, date: string) => {
        await this.dbPoolQuery(
            `DELETE FROM "DailyRecord" 
            WHERE hid = '${hid}' AND date = TO_DATE('${date}', 'DD-MM-YYYY');`,
        );
    };

    isDailyRecordTupleExist = async (
        date: string,
        hid: number,
    ): Promise<Boolean> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT COUNT(1) 
            FROM "DailyRecord" 
            WHERE date = TO_DATE('${date}', 'DD-MM-YYYY') AND hid = '${hid}';`,
        );
        return queryArr.rows[0]['count'] == 0 ? false : true;
    };

    //////////////////////////////////////////////////////////////////////////////
    //table Chicken

    getChickenFlockInfoByHid = async (
        hid: number,
    ): Promise<Array<ChickenFlockInfoOutput>> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT * 
            FROM "Chicken" 
            WHERE "hid" = '${hid}'`,
        );
        return queryArr.rows;
    };

    getChickenFlockInfoByHidAndGeneration = async (
        hid: number,
        generation: string,
    ): Promise<ChickenFlockInfoOutput> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT * 
            FROM "Chicken" 
            WHERE "hid" = '${hid}' AND "generation" = '${generation}';`,
        );
        return queryArr.rows[0];
    };

    //////////////////////////////////////////////////////////////////////////////
    //table Sensor

    getSidByHidAndPosition = async (
        hid: number,
        xPosSen: number,
        yPosSen: number,
    ): Promise<string> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT "sid" 
            FROM "Sensor" 
            WHERE "hid" = '${hid}' AND "xPosSen" = '${xPosSen}' AND "yPosSen" = '${yPosSen}';`,
        );
        return queryArr.rows[0];
    };

    getAllSensorInfoByHid = async (
        hid: number,
    ): Promise<Array<SensorOutput>> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT "sid", "xPosSen", "yPosSen" 
            FROM "Sensor" 
            WHERE "hid" = '${hid}';`,
        );
        return queryArr.rows;
    };

    getHidBySid = async (sid: string): Promise<string> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT "S"."hid" 
            FROM "Sensor" "S" 
            WHERE "S"."sid" = '${sid}';`,
        );
        return queryArr.rows[0];
    };

    //////////////////////////////////////////////////////////////////////////////
    //table Environment

    createEnvQueryString = (environmentInput: CreateEnvDataInput) =>
        `INSERT INTO "Environment" (timestamp, windspeed, ammonia, temperature, humidity, sid) 
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

    getEnvironmentByHidAndDate = async (
        hid: number,
        date: string,
    ): Promise<Array<EnvironmentInfoSetAndSidOutput>> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT "E"."sid", "E"."timestamp", "E"."windspeed", "E"."ammonia", "E"."temperature", "E"."humidity"
            FROM "Environment" "E"
            LEFT JOIN "Sensor" "S" ON "E"."sid" = "S"."sid"
            WHERE "S"."hid" = '${hid}'
                AND "E"."timestamp" BETWEEN TO_TIMESTAMP('${date} 00:00:00','DD-MM-YYYY HH24:MI:SS') 
                AND TO_TIMESTAMP('${date} 23:59:59','DD-MM-YYYY HH24:MI:SS')`,
        );
        return queryArr.rows;
    };

    getLatestEnivonmentForEachSensorInHid = async (
        hid: number,
    ): Promise<Array<EnvironmentInfoSetAndSidOutput>> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT "E"."sid", "E"."timestamp", "E"."windspeed", "E"."ammonia", "E"."temperature", "E"."humidity" 
            FROM "Environment" "E" 
            LEFT JOIN "Sensor" "S" ON "E"."sid" = "S"."sid" 
            WHERE "S"."hid" = ${hid} AND "E"."timestamp" = 
                (SELECT MAX(timestamp) FROM "Environment"
                WHERE "sid" = "S"."sid");`,
        );
        return queryArr.rows;
    };

    getLatestEnvironmentBySid = async (
        sid: string,
    ): Promise<EnvironmentInfoSetOutput> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT "E"."timestamp", "E"."windspeed", "E"."ammonia", "E"."temperature", "E"."humidity" 
            FROM "Environment" "E" 
            WHERE "E"."sid" = '${sid}' 
                AND "E"."timestamp" = 
                (SELECT MAX(timestamp) 
                    FROM "Environment" "E2"  
                    WHERE "E2"."sid" = '${sid}')`,
        );
        return queryArr.rows[0];
    };

    getEnvironmentBetweenTimestampBySid = async (
        sid,
        tsStart,
        tsEnd,
    ): Promise<Array<EnvironmentInfoSetOutput>> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT "timestamp", "windspeed", "ammonia", "temperature", "humidity" 
            FROM "Environment" 
            WHERE "sid" = '${sid}' 
                AND timestamp BETWEEN TO_TIMESTAMP('${tsStart}') 
                AND TO_TIMESTAMP('${tsEnd}');`,
        );
        return queryArr.rows;
    };

    //////////////////////////////////////////////////////////////////////////////
    //table Camera

    getCameraInfo = async (cid: string): Promise<CameraOutput> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT * 
            FROM "Camera" 
            WHERE "cid" = '${cid}';`,
        );
        return queryArr.rows[0];
    };

    getHidByCid = async (cid: string): Promise<string> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT "C"."hid" 
            FROM "Camera" "C" 
            WHERE "C"."cid" = '${cid}';`,
        );
        return queryArr.rows[0];
    };

    //////////////////////////////////////////////////////////////////////////////
    //table Image

    getLatestUrl = async (cid: string): Promise<LatestUrl> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT "I"."url" 
            FROM "Image" "I" 
            WHERE "I"."cid" = '${cid}' 
                AND "I"."timestamp" = 
                    (SELECT MAX(timestamp) 
                    FROM "Image" "I2"  
                    WHERE "I2"."cid" = '${cid}');`,
        );
        return queryArr.rows[0];
    };

    getLastImageForEachCameraByHid = async (
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

    getLatestAmountDeadChickenByCid = async (cid: string): Promise<number> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT "I"."amountDead" 
            FROM "Image" "I" 
            WHERE "I"."cid" = '${cid}' 
                AND "I"."timestamp" = 
                    (SELECT MAX(timestamp) 
                        FROM "Image" "I2"  
                        WHERE "I2"."cid" = '${cid}')`,
        );
        return queryArr.rows[0];
    };

    //////////////////////////////////////////////////////////////////////////////
    //table ChickenRecord

    getLatestChickenRecordByHidAndDate = async (
        hid: number,
        date: string,
    ): Promise<ChickenRecord> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT DISTINCT ON ("period") * 
            FROM "ChickenRecord"
            WHERE hid = ${hid} AND date = TO_DATE('${date}', 'DD-MM-YYYY')
            ORDER BY "period", "chicTime" DESC;`,
        );
        return queryArr.rows[0];
    };

    //////////////////////////////////////////////////////////////////////////////
    //table DailyDataRecord

    isDailyDataRecordTupleExist = async (
        timestamp: string,
        date: string,
        hid: number,
    ): Promise<Boolean> => {
        const queryArr = await this
            .dbPoolQuery(`SELECT COUNT(1) FROM "DailyDataRecord" 
                WHERE timestamp = TO_TIMESTAMP('${timestamp}') AND date = TO_DATE('${date}', 'DD-MM-YYYY') AND hid = '${hid}';`);
        return queryArr.rows[0]['count'] == 0 ? false : true;
    };

    //////////////////////////////////////////////////////////////////////////////
    //table FoodRecord

    getLatestFoodRecordByHidAndDate = async (
        hid: number,
        date: string,
    ): Promise<FoodRecord> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT DISTINCT ON ("foodSilo") * 
            FROM "FoodRecord"
            WHERE hid = ${hid} AND date = TO_DATE('${date}', 'DD-MM-YYYY')
            ORDER BY "foodSilo", "timestamp" DESC;`,
        );
        return queryArr.rows;
    };

    //////////////////////////////////////////////////////////////////////////////
    //table VacRecord

    getLatestVacRecordByHidAndDate = async (
        hid: number,
        date: string,
    ): Promise<VacRecord> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT * 
            FROM "VacRecord"
            WHERE hid = ${hid} AND date = TO_DATE('${date}', 'DD-MM-YYYY')
            ORDER BY timestamp DESC LIMIT 1;`,
        );
        return queryArr.rows[0];
    };
    //////////////////////////////////////////////////////////////////////////////
    //table WaterRecord

    getLatestWaterRecordByHidAndDate = async (
        hid: number,
        date: string,
    ): Promise<WaterRecord> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT * 
            FROM "WaterRecord"
            WHERE hid = ${hid} AND date = TO_DATE('${date}', 'DD-MM-YYYY')
            ORDER BY timestamp DESC LIMIT 1;`,
        );
        return queryArr.rows[0];
    };
    //////////////////////////////////////////////////////////////////////////////
    //Temperature

    getLatestTemperatureBySid = async (
        sid: string,
    ): Promise<TemperatureTimestamp> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT "timestamp" "temperature"
            FROM "Environment" 
            WHERE "sid" = '${sid}' 
            ORDER BY timestamp DESC LIMIT 1;`,
        );
        return queryArr.rows[0];
    };

    getLast24HrsTemperatureBySid = async (
        sid: string,
    ): Promise<Array<TemperatureTimestamp>> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT "timestamp" "temperature" 
            FROM "Environment" 
            WHERE "sid" = '${sid}' 
            AND "timestamp" >= NOW() - INTERVAL '1' DAY;`,
        );
        return queryArr.rows;
    };

    getTemperatureBetweenTimestampBySid = async (
        sid: string,
        tsStart: string,
        tsEnd: string,
    ): Promise<Array<TemperatureTimestamp>> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT "timestamp", "temperature" 
            FROM "Environment" 
            WHERE "sid" = '${sid}' 
                AND timestamp BETWEEN TO_TIMESTAMP('${tsStart}') 
                AND TO_TIMESTAMP('${tsEnd}');`,
        );
        return queryArr.rows;
    };

    getLastNTemperatureBySid = async (
        sid: string,
        number: number,
    ): Promise<Array<TemperatureTimestamp>> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT "timestamp", "temperature" 
            FROM "Environment" 
            WHERE "sid" = '${sid}' 
            ORDER BY timestamp DESC LIMIT '${number}';`,
        );
        return queryArr.rows;
    };

    getMaxAndMinTemperatureBetweenDateBySid = async (
        sid: string,
        dateStart: string,
        dateEnd: string,
    ) => {
        const queryArr = await this.dbPoolQuery(
            `SELECT MAX("temperature"), MIN("temperature") 
            FROM "Environment" 
            WHERE "sid" = '${sid}' 
                AND timestamp BETWEEN TO_TIMESTAMP('${dateStart} 00:00:00','DD-MM-YYYY HH24:MI:SS') 
                AND TO_TIMESTAMP('${dateEnd} 23:59:59','DD-MM-YYYY HH24:MI:SS');`,
        );
        return queryArr.rows[0];
    };

    //////////////////////////////////////////////////////////////////////////////
    //Humidity

    getLatestHumidityBySid = async (
        sid: string,
    ): Promise<TemperatureTimestamp> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT "timestamp", "humidity" 
            FROM "Environment" 
            WHERE "sid" = '${sid}' 
            ORDER BY timestamp DESC LIMIT 1;`,
        );
        return queryArr.rows[0];
    };

    getLast24HrsHumidityBySid = async (
        sid: string,
    ): Promise<Array<HumidityTimestamp>> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT "timestamp", "humidity" 
            FROM "Environment" 
            WHERE "sid" = '${sid}' 
                AND "timestamp" >= NOW() - INTERVAL '1' DAY;`,
        );
        return queryArr.rows;
    };

    getHumidityBetweenTimestampBySid = async (
        sid: string,
        tsStart: string,
        tsEnd: string,
    ): Promise<Array<HumidityTimestamp>> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT "timestamp", "humidity" 
            FROM "Environment" 
            WHERE "sid" = '${sid}' 
                AND timestamp BETWEEN TO_TIMESTAMP('${tsStart}') 
                AND TO_TIMESTAMP('${tsEnd}');`,
        );
        return queryArr.rows;
    };

    getLastNHumidityBySid = async (
        sid: string,
        number: number,
    ): Promise<Array<HumidityTimestamp>> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT "timestamp", "humidity" 
            FROM "Environment" 
            WHERE "sid" = '${sid}' 
            ORDER BY timestamp DESC LIMIT '${number}';`,
        );
        return queryArr.rows;
    };

    //////////////////////////////////////////////////////////////////////////////
    //Ammonia

    getLatestAmmoniaBySid = async (sid: string): Promise<AmmoniaTimestamp> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT "ammonia" 
            FROM "Environment" 
            WHERE "sid" = '${sid}' 
            ORDER BY timestamp DESC LIMIT 1;`,
        );
        return queryArr.rows[0];
    };

    getLast24HrsAmmoniaBySid = async (
        sid: string,
    ): Promise<Array<AmmoniaTimestamp>> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT "ammonia" 
            FROM "Environment" 
            WHERE "sid" = '${sid}' 
                AND "timestamp" >= NOW() - INTERVAL '1' DAY;`,
        );
        return queryArr.rows;
    };

    getAmmoniaBetweenTimestampBySid = async (
        sid: string,
        tsStart: string,
        tsEnd: string,
    ): Promise<Array<AmmoniaTimestamp>> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT "timestamp", "ammonia" 
            FROM "Environment" 
            WHERE "sid" = '${sid}' 
                AND timestamp BETWEEN TO_TIMESTAMP('${tsStart}') 
                AND TO_TIMESTAMP('${tsEnd}');`,
        );
        return queryArr.rows;
    };

    getLastNAmmoniaBySid = async (
        sid: string,
        number: number,
    ): Promise<Array<AmmoniaTimestamp>> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT "timestamp", "ammonia" 
            FROM "Environment" 
            WHERE "sid" = '${sid}' 
            ORDER BY timestamp DESC LIMIT '${number}';`,
        );
        return queryArr.rows;
    };

    //////////////////////////////////////////////////////////////////////////////
    //Windspeed

    getLatestWindspeedBySid = async (
        sid: string,
    ): Promise<WindspeedTimestamp> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT "windspeed" 
            FROM "Environment" 
            WHERE "sid" = '${sid}' 
            ORDER BY timestamp DESC LIMIT 1;`,
        );
        return queryArr.rows[0];
    };

    getLast24HrsWindspeedBySid = async (
        sid: string,
    ): Promise<Array<WindspeedTimestamp>> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT "windspeed" 
            FROM "Environment" 
            WHERE "sid" = '${sid}' 
                AND "timestamp" >= NOW() - INTERVAL '1' DAY;`,
        );
        return queryArr.rows;
    };

    getWindspeedBetweenTimestampBySid = async (
        sid: string,
        tsStart: string,
        tsEnd: string,
    ): Promise<Array<WindspeedTimestamp>> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT "timestamp", "windspeed" 
            FROM "Environment" 
            WHERE "sid" = '${sid}' 
                AND timestamp BETWEEN TO_TIMESTAMP('${tsStart}') 
                AND TO_TIMESTAMP('${tsEnd}');`,
        );
        return queryArr.rows;
    };

    getLastNWindspeedityBySid = async (
        sid: string,
        number: number,
    ): Promise<Array<WindspeedTimestamp>> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT "timestamp", "windspeed" 
            FROM "Environment" 
            WHERE "sid" = '${sid}' 
            ORDER BY timestamp DESC LIMIT '${number}';`,
        );
        return queryArr.rows;
    };
}
