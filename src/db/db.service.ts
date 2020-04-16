import {
    AmmoniaTimestamp,
    CameraOutput,
    ChickenFlockInfoOutput,
    ChickenRecord,
    CreateCamImgInput,
    CreateCameraInput,
    CreateChickenFlockInput,
    CreateChickenRecordInput,
    CreateDailyDataRecordInput,
    CreateEnvDataInput,
    CreateFoodRecordInput,
    CreateMedicineRecordInput,
    CreateSensorInput,
    CreateUserInput,
    CreateWaterRecordInput,
    DailySetRecordInput,
    DeadChickenReport,
    EnvironmentInfoSetAndSidOutput,
    EnvironmentInfoSetOutput,
    EnvironmentalDataReport,
    FoodConsumptionReport,
    HouseOutput,
    HumidityTimestamp,
    LastImageForEachCameraOutput,
    LatestUrl,
    LoginUserInfo,
    MaxAndMin,
    MaxAndMinAmmonia,
    MaxAndMinHumidity,
    MaxAndMinTemperature,
    MaxAndMinWindSpeed,
    MedicineConsumptionReport,
    SensorOutput,
    TemperatureTimestamp,
    UserDataOutput,
    UserInput,
    WaterConsumptionReport,
    WindspeedTimestamp,
} from './db.interfaces';
import {
    DailyInfo,
    EnvType,
    EnvironmentalData,
    FoodInput,
    MedicineInput,
    WaterInput,
} from '../event/event.interfaces';

import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { poolQuery } from './utils';

@Injectable()
export class DbService {
    constructor(private readonly configService: ConfigService) {}

    private pool = new Pool({
        connectionString:
            process.env.DB_URI2 || this.configService.get<string>('DB_URI2'),
    });

    private poolInit = new Pool({
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
                        ("generation", "dateIn", "dateOut", "type", "amountIn", "gender", "hid") 
                        VALUES ('${createChickenInput.generation}', TO_DATE('${createChickenInput.dateIn}', 'DD-MM-YYYY'), TO_DATE('${createChickenInput.dateOut}', 'DD-MM-YYYY'),
                        '${createChickenInput.type}', ${createChickenInput.amountIn}, '${createChickenInput.gender}','${createChickenInput.hid}');`);

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

    createMedicineRecord = (medicineRecordInput: CreateMedicineRecordInput) =>
        this
            .dbPoolQuery(`INSERT INTO "MedicineRecord" ("medicineType", "medicineConc", "timestamp", "date", "hid") 
                    VALUES ('${medicineRecordInput.medicineType}', '${medicineRecordInput.medicineConc}',
                    TO_TIMESTAMP('${medicineRecordInput.timestamp}'), TO_DATE('${medicineRecordInput.date}', 'DD-MM-YYYY'), '${medicineRecordInput.hid}');`);

    createWaterRecord = (waterRecordInput: CreateWaterRecordInput) =>
        this
            .dbPoolQuery(`INSERT INTO "WaterRecord" ("waterMeter1", "waterMeter2", "waterConsumed", "timestamp", "date", "hid") 
                    VALUES ('${waterRecordInput.waterMeter1}', '${waterRecordInput.waterMeter2}', '${waterRecordInput.waterConsumed}',
                    TO_TIMESTAMP('${waterRecordInput.timestamp}'), TO_DATE('${waterRecordInput.date}', 'DD-MM-YYYY'), '${waterRecordInput.hid}');`);

    createCollectedDeadChickenTime = (timestamp: string, cid: string) =>
        this
            .dbPoolQuery(`INSERT INTO "CollectedDeadChickenTime" ("timestamp", "cid") 
                    VALUES (TO_TIMESTAMP('${timestamp}'), '${cid}');`);

    // !!! Bug
    // createDailyDataRecordSet = async (
    //     dailyDataRecordSet: DailySetRecordInput,
    // ) => {
    //     let foodInput = dailyDataRecordSet.dailyInfo.food;
    //     for (let ele in foodInput) {
    //         let tmp = foodInput[ele];
    //         tmp['hid'] = dailyDataRecordSet.hid;
    //         tmp['date'] = dailyDataRecordSet.date;
    //         tmp['timestamp'] = dailyDataRecordSet.timestamp;
    //         foodInput[ele] = tmp;
    //     }
    //     let waterInput = dailyDataRecordSet.dailyInfo.water;
    //     waterInput['timestamp'] = dailyDataRecordSet.timestamp;
    //     waterInput['date'] = dailyDataRecordSet.date;
    //     waterInput['hid'] = dailyDataRecordSet.hid;

    //     let medicineInput = dailyDataRecordSet.dailyInfo.medicine;
    //     medicineInput['timestamp'] = dailyDataRecordSet.timestamp;
    //     medicineInput['date'] = dailyDataRecordSet.date;
    //     medicineInput['hid'] = dailyDataRecordSet.hid;
    //     // for (let ele in foodInput) {
    //     //     await this.createFoodRecord(
    //     //         foodInput[ele] as CreateFoodRecordInput,
    //     //     );
    //     // }
    //     await this.createWaterRecord(waterInput as CreateWaterRecordInput);
    //     // await this.createMedicineRecord(
    //     //     medicineInput as CreateMedicineRecordInput,
    //     // );
    // };
    createDailyDataRecordSet = async (
        dailyDataRecordSet: DailySetRecordInput,
    ) => {
        const { dailyInfo, ...dailyRecordInput } = dailyDataRecordSet;
        await this.createDailyDataRecord(dailyRecordInput);

        let foodInput = dailyDataRecordSet.dailyInfo.food;
        for (let ele in foodInput) {
            let tmp = foodInput[ele];
            tmp['timestamp'] = dailyDataRecordSet.timestamp;
            tmp['date'] = dailyDataRecordSet.date;
            tmp['hid'] = dailyDataRecordSet.hid;
            foodInput[ele] = tmp;
        }
        let waterInput = dailyDataRecordSet.dailyInfo.water;
        waterInput['timestamp'] = dailyDataRecordSet.timestamp;
        waterInput['date'] = dailyDataRecordSet.date;
        waterInput['hid'] = dailyDataRecordSet.hid;

        let medicineInput = dailyDataRecordSet.dailyInfo.medicine;
        for (let ele in medicineInput) {
            let tmp = medicineInput[ele];
            tmp['timestamp'] = dailyDataRecordSet.timestamp;
            tmp['date'] = dailyDataRecordSet.date;
            tmp['hid'] = dailyDataRecordSet.hid;
            medicineInput[ele] = tmp;
        }
        for (let ele in foodInput) {
            await this.createFoodRecord(
                foodInput[ele] as CreateFoodRecordInput,
            );
        }
        await this.createWaterRecord(waterInput as CreateWaterRecordInput);
        for (let ele in medicineInput) {
            await this.createMedicineRecord(
                medicineInput[ele] as CreateMedicineRecordInput,
            );
        }
    };

    //////////////////////////////////////////////////////////////////////////////
    //Report

    getEnvironmentalDataReport = async (
        hid: number,
        generation: string,
    ): Promise<string> => {
        let tmp_generation = generation.replace('/', '_');
        let filename = `EnvironmentalDataReport_Hid${hid}_Generation${tmp_generation}.csv`;
        let list_record = await this.dbPoolQuery(
            `SELECT "C"."hid", "C"."generation", "E"."timestamp","S"."sid", "E"."windspeed", "E"."ammonia", "E"."temperature", "E"."humidity"
            FROM "Environment" "E"
            JOIN "Sensor" "S" ON "S"."sid" = "E"."sid"
            JOIN "Chicken" "C" ON "C"."hid" = "S"."hid"
            WHERE "C"."hid" = '${hid}' AND "C"."generation" = '${generation}'`,
        );
        list_record = list_record.rows;
        let header = [
            { id: 'hid', title: 'hid' },
            { id: 'generation', title: 'generation' },
            { id: 'timestamp', title: 'timestamp' },
            { id: 'sid', title: 'sid' },
            { id: 'windspeed', title: 'windspeed' },
            { id: 'ammonia', title: 'ammonia' },
            { id: 'temperature', title: 'temperature' },
            { id: 'humidity', title: 'humidity' },
        ];
        await this.exportCSV(header, list_record, filename);
        return filename;
    };

    getFoodConsumptionReport = async (
        hid: number,
        generation: string,
    ): Promise<string> => {
        let tmp_generation = generation.replace('/', '_');
        let filename = `FoodConsumptionReport_Hid${hid}_Generation${tmp_generation}.csv`;
        let list_record = await this.dbPoolQuery(
            `SELECT "C"."hid", "C"."generation", "F"."timestamp", "F"."foodSilo", "F"."foodIn", "F"."foodRemain", "F"."foodConsumed"
            FROM "FoodRecord" "F"
            JOIN "Chicken" "C" ON "C"."hid" = "F"."hid"
            WHERE "C"."hid" = '${hid}' AND "C"."generation" = '${generation}';`,
        );
        list_record = list_record.rows;
        let header = [
            { id: 'hid', title: 'hid' },
            { id: 'generation', title: 'generation' },
            { id: 'timestamp', title: 'timestamp' },
            { id: 'foodSilo', title: 'foodSilo' },
            { id: 'foodIn', title: 'foodIn' },
            { id: 'foodRemain', title: 'foodRemain' },
            { id: 'foodConsumed', title: 'foodConsumed' },
        ];
        await this.exportCSV(header, list_record, filename);
        return filename;
    };

    getWaterConsumptionReport = async (
        hid: number,
        generation: string,
    ): Promise<string> => {
        let tmp_generation = generation.replace('/', '_');
        let filename = `WaterConsumptionReport_Hid${hid}_Generation${tmp_generation}.csv`;
        let list_record = await this.dbPoolQuery(
            `SELECT "C"."hid", "C"."generation", "W"."timestamp", "W"."waterMeter1", "W"."waterMeter2", "W"."waterConsumed"
            FROM "WaterRecord" "W"
            JOIN "Chicken" "C" ON "C"."hid" = "W"."hid"
            WHERE "C"."hid" = '${hid}' AND "C"."generation" = '${generation}';`,
        );
        list_record = list_record.rows;
        let header = [
            { id: 'hid', title: 'hid' },
            { id: 'generation', title: 'generation' },
            { id: 'timestamp', title: 'timestamp' },
            { id: 'waterMeter1', title: 'waterMeter1' },
            { id: 'waterMeter2', title: 'waterMeter2' },
            { id: 'waterConsumed', title: 'waterConsumed' },
        ];
        await this.exportCSV(header, list_record, filename);
        return filename;
    };

    getMedicineConsumptionReport = async (
        hid: number,
        generation: string,
    ): Promise<string> => {
        let tmp_generation = generation.replace('/', '_');
        let filename = `MedicineConsumptionReport_Hid${hid}_Generation${tmp_generation}.csv`;
        let list_record = await this.dbPoolQuery(
            `SELECT "C"."hid", "C"."generation", "M"."timestamp", "M"."medicineType", "M"."medicineConc"
            FROM "MedicineRecord" "M"
            JOIN "Chicken" "C" ON "C"."hid" = "M"."hid"
            WHERE "C"."hid" = '${hid}' AND "C"."generation" = '${generation}';`,
        );
        list_record = list_record.rows;
        let header = [
            { id: 'hid', title: 'hid' },
            { id: 'generation', title: 'generation' },
            { id: 'timestamp', title: 'timestamp' },
            { id: 'medicineType', title: 'medicineType' },
            { id: 'medicineConc', title: 'medicineConc' },
        ];
        await this.exportCSV(header, list_record, filename);
        return filename;
    };

    getDeadChickenReport = async (
        hid: number,
        generation: string,
    ): Promise<string> => {
        let tmp_generation = generation.replace('/', '_');
        let filename = `DeadChickenReport_Hid${hid}_Generation${tmp_generation}.csv`;
        let list_record = await this.dbPoolQuery(
            `SELECT "C"."hid", "C"."generation", "R"."date", "R"."chicTime", "R"."period",
            "R"."amountDead", "R"."amountZleg", "R"."amountDwaft", "R"."amountSick"
            FROM "ChickenRecord" "R"
            JOIN (
            SELECT "hid", "date", MAX("chicTime") AS "recentChicTime", "period"
            FROM "ChickenRecord"
            GROUP BY "hid", "date", "period") "M" 
            ON "R"."hid" = "M"."hid" AND "R"."date" = "M"."date" AND "R"."chicTime" = "M"."recentChicTime"
            JOIN "Chicken" "C" ON "C"."hid" = "R"."hid" AND "C"."hid" = '${hid}' AND "C"."generation" = '${generation}';`,
        );
        list_record = list_record.rows;
        let header = [
            { id: 'hid', title: 'hid' },
            { id: 'generation', title: 'generation' },
            { id: 'date', title: 'date' },
            { id: 'chicTime', title: 'chicTime' },
            { id: 'period', title: 'period' },
            { id: 'amountDead', title: 'amountDead' },
            { id: 'amountZleg', title: 'amountZleg' },
            { id: 'amountDwarf', title: 'amountDwarf' },
            { id: 'amountSick', title: 'amountSick' },
        ];
        await this.exportCSV(header, list_record, filename);
        return filename;
    };

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
    updateUserInfo = async (uid: number, updateUserInfo: UserInput) => {
        await this.dbPoolQuery(
            `UPDATE "User" 
            SET 
            "username" = '${updateUserInfo.username}',
            "hashedPwd"= '${updateUserInfo.hashedPwd}',
            "isCurrentUser"= '${updateUserInfo.isCurrentUser}',
            "firstName"= '${updateUserInfo.firstName}',
            "lastName"= '${updateUserInfo.lastName}',
            "lineID"= '${updateUserInfo.lineID}',
            "role"= '${updateUserInfo.role}',
            "imageUrl"= '${updateUserInfo.imageUrl}',
            "hid"= '${updateUserInfo.hid}'
            WHERE "uid" = '${uid}';`,
        );
    };
    getAllUsersIDByHid = async (hid: number): Promise<number[]> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT "uid"
            FROM "User" 
            WHERE "hid" = ${hid}`,
        );
        return queryArr.rows.map(each => each.uid);
    };

    // Ask Frontend about this Info
    // getAllUsersInfoByHid = async (hid: number): Promise<UserDataOutput[]> => {
    //     const queryArr = await this.dbPoolQuery(
    //         `SELECT "uid", "username", "isCurrentUser"
    //         FROM "User"
    //         WHERE "hid" = ${hid}`,
    //     );
    //     return queryArr.rows;
    // };

    deleteUserByUid = async (uid: number) => {
        await this.dbPoolQuery(
            `DELETE FROM "User" 
            WHERE "uid" = '${uid}';`,
        );
    };
    deleteUserByUsername = async (username: string) => {
        await this.dbPoolQuery(
            `DELETE FROM "User" 
            WHERE "username" = '${username}';`,
        );
    };

    //////////////////////////////////////////////////////////////////////////////
    //table House

    getHidByHno = async (hno: number): Promise<number> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT "H"."hid" 
            FROM "House" "H" 
            WHERE "H"."hno" = '${hno}';`,
        );
        return queryArr.rows[0].hid;
    };

    getHouseInfoByHno = async (hno: number): Promise<HouseOutput> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT hid, length, width, scale FROM "House" 
            WHERE hno = '${hno}';`,
        );
        return queryArr.rows[0];
    };

    getAllHno = async (): Promise<number[]> => {
        const queryArr = await this.dbPoolQuery(`SELECT "hno" FROM "House";`);
        return queryArr.rows.map(each => each.hno);
    };

    //////////////////////////////////////////////////////////////////////////////
    //table DailyRecord

    getDailyRecordByHid = async (hid: number) => {
        const queryArr = await this.dbPoolQuery(
            `SELECT "date"
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
    ): Promise<ChickenFlockInfoOutput[]> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT "dateIn", "dateOut", "generation", "type", "amountIn", "gender" 
            FROM "Chicken" 
            WHERE "hid" = '${hid}'
            ORDER BY "dateIn"`,
        );
        return queryArr.rows;
    };

    getLatestChickenFlockInfoByHid = async (
        hid: number,
    ): Promise<ChickenFlockInfoOutput> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT * FROM "Chicken" 
            WHERE "hid" = '${hid}'
            ORDER BY "dateIn" DESC LIMIT 1;`,
        );
        return queryArr.rows[0];
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

    updateDateOutChickenFlockByHidAndGeneration = async (
        hid,
        generation,
        newDateOut,
    ) => {
        await this.dbPoolQuery(
            `UPDATE "Chicken" 
            SET "dateOut" = TO_DATE('${newDateOut}','DD_MM_YYYY') 
            WHERE "hid" = '${hid}' AND "generation" = '${generation}';`,
        );
    };
    deleteChickenFlockByHidAndGeneration = async (hid, generation) => {
        await this.dbPoolQuery(
            `DELETE FROM "Chicken" 
            WHERE hid = '${hid}' AND generation = '${generation}';`,
        );
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

    getAllSensorInfoByHid = async (hid: number): Promise<SensorOutput[]> => {
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

    createEnvFromList = async (environmentInputList: CreateEnvDataInput[]) => {
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
    ): Promise<EnvironmentInfoSetAndSidOutput[]> => {
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
    ): Promise<EnvironmentInfoSetAndSidOutput[]> => {
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
    ): Promise<EnvironmentInfoSetOutput[]> => {
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

    getLatestUrlByCid = async (cid: string): Promise<LatestUrl> => {
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
    ): Promise<LastImageForEachCameraOutput[]> => {
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
    ): Promise<Array<ChickenRecord>> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT DISTINCT ON ("period") * 
            FROM "ChickenRecord"
            WHERE "hid" = ${hid} AND "date" = TO_DATE('${date}', 'DD-MM-YYYY')
            ORDER BY "period", "chicTime" DESC;`,
        );
        return queryArr.rows;
    };
    getLatestChickenRecordByHidAndDateAndPeriod = async (
        hid: number,
        date: string,
        period: string,
    ): Promise<ChickenRecord> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT * FROM "ChickenRecord"
            WHERE "hid" = ${hid} AND "date" = TO_DATE('${date}', 'DD-MM-YYYY') AND
            "period" = '${period}'
            ORDER BY "chicTime" DESC LIMIT 1;`,
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
    getAllDataRecordByHidAndDate = async (
        hid: number,
        date: string,
    ): Promise<DailyInfo> => {
        let foodRecord = await this.getLatestFoodRecordByHidAndDate(hid, date);
        let medicineRecord = await this.getLatestMedicineRecordByHidAndDate(
            hid,
            date,
        );
        let waterRecord = await this.getLatestWaterRecordByHidAndDate(
            hid,
            date,
        );
        if (
            typeof medicineRecord === 'undefined' &&
            typeof waterRecord === 'undefined' &&
            foodRecord &&
            foodRecord.length == 0
        ) {
            return null;
        } else {
            return {
                food: foodRecord,
                medicine: medicineRecord,
                water: waterRecord,
            };
        }
    };

    //////////////////////////////////////////////////////////////////////////////
    //table FoodRecord

    getLatestFoodRecordByHidAndDate = async (
        hid: number,
        date: string,
    ): Promise<Array<FoodInput>> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT DISTINCT ON ("foodSilo") "foodSilo", "foodIn", "foodRemain"
            FROM "FoodRecord"
            WHERE hid = ${hid} AND date = TO_DATE('${date}', 'DD-MM-YYYY')
            ORDER BY "foodSilo", "timestamp" DESC;`,
        );
        return queryArr.rows;
    };

    //////////////////////////////////////////////////////////////////////////////
    //table MedicineRecord

    getLatestMedicineRecordByHidAndDate = async (
        hid: number,
        date: string,
    ): Promise<MedicineInput[]> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT "medicineType", "medicineConc" 
            FROM "MedicineRecord"
            WHERE hid = ${hid} AND date = TO_DATE('${date}', 'DD-MM-YYYY')
            ORDER BY timestamp DESC;`,
        );
        return queryArr.rows;
    };
    //////////////////////////////////////////////////////////////////////////////
    //table WaterRecord

    getLatestWaterRecordByHidAndDate = async (
        hid: number,
        date: string,
    ): Promise<WaterInput> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT "waterMeter1", "waterMeter2"
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
            `SELECT "timestamp", "temperature"
            FROM "Environment" 
            WHERE "sid" = '${sid}' 
            ORDER BY timestamp DESC LIMIT 1;`,
        );
        return queryArr.rows[0];
    };

    getLast24HrsTemperatureBySid = async (
        sid: string,
    ): Promise<TemperatureTimestamp[]> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT "timestamp", "temperature" 
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
    ): Promise<TemperatureTimestamp[]> => {
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
    ): Promise<TemperatureTimestamp[]> => {
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
    ): Promise<MaxAndMinTemperature[]> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT "date", "maxTemperature", "minTemperature" FROM (
                SELECT "sid", DATE("timestamp") "date",
                MAX("temperature") as "maxTemperature", MIN("temperature") AS "minTemperature"
                FROM "Environment"
                GROUP BY "sid", DATE("timestamp") 
                ) AS "tmp" WHERE "tmp"."sid" = '${sid}' AND "date" BETWEEN 
                TO_DATE('${dateStart}', 'DD-MM-YYYY') AND TO_DATE('${dateEnd}', 'DD-MM-YYYY');`,
        );
        return queryArr.rows;
    };

    getMaxAndMinBetweenDateBySidandEnvType = async (
        envType: EnvType,
        sid: string,
        dateStart: string,
        dateEnd: string,
    ): Promise<MaxAndMin[]> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT "date", "max", "min" FROM (
        SELECT "sid", DATE("timestamp") "date",
        MAX(${envType}) as "max", MIN(${envType}) AS "min"
        FROM "Environment"
        GROUP BY "sid", DATE("timestamp")
        ) AS "tmp" WHERE "tmp"."sid" = '${sid}' AND "date" BETWEEN
        TO_DATE('${dateStart}', 'DD-MM-YYYY') AND TO_DATE('${dateEnd}', 'DD-MM-YYYY');`,
        );
        return queryArr.rows;
    };

    //////////////////////////////////////////////////////////////////////////////
    //Humidity

    getLatestHumidityBySid = async (
        sid: string,
    ): Promise<HumidityTimestamp> => {
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
    ): Promise<HumidityTimestamp[]> => {
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
    ): Promise<HumidityTimestamp[]> => {
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
    ): Promise<HumidityTimestamp[]> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT "timestamp", "humidity" 
            FROM "Environment" 
            WHERE "sid" = '${sid}' 
            ORDER BY timestamp DESC LIMIT '${number}';`,
        );
        return queryArr.rows;
    };

    getMaxAndMinHumidityBetweenDateBySid = async (
        sid: string,
        dateStart: string,
        dateEnd: string,
    ): Promise<MaxAndMinHumidity[]> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT "date", "maxHumidity", "minHumidity" FROM (
                SELECT "sid", DATE("timestamp") "date",
                MAX("humidity") as "maxHumidity", MIN("humidity") AS "minHumidity"
                FROM "Environment"
                GROUP BY "sid", DATE("timestamp") 
                ) AS "tmp" WHERE "tmp"."sid" = '${sid}' AND "date" BETWEEN 
                TO_DATE('${dateStart}', 'DD-MM-YYYY') AND TO_DATE('${dateEnd}', 'DD-MM-YYYY');`,
        );
        return queryArr.rows;
    };

    //////////////////////////////////////////////////////////////////////////////
    //Ammonia

    getLatestAmmoniaBySid = async (sid: string): Promise<AmmoniaTimestamp> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT "timestamp", "ammonia" 
            FROM "Environment" 
            WHERE "sid" = '${sid}' 
            ORDER BY timestamp DESC LIMIT 1;`,
        );
        return queryArr.rows[0];
    };

    getLast24HrsAmmoniaBySid = async (
        sid: string,
    ): Promise<AmmoniaTimestamp[]> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT "timestamp", "ammonia" 
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
    ): Promise<AmmoniaTimestamp[]> => {
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
    ): Promise<AmmoniaTimestamp[]> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT "timestamp", "ammonia" 
            FROM "Environment" 
            WHERE "sid" = '${sid}' 
            ORDER BY timestamp DESC LIMIT '${number}';`,
        );
        return queryArr.rows;
    };

    getMaxAndMinAmmoniaBetweenDateBySid = async (
        sid: string,
        dateStart: string,
        dateEnd: string,
    ): Promise<MaxAndMinAmmonia[]> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT "date", "maxAmmonia", "minAmmonia" FROM (
                SELECT "sid", DATE("timestamp") "date",
                MAX("ammonia") as "maxAmmonia", MIN("ammonia") AS "minAmmonia"
                FROM "Environment"
                GROUP BY "sid", DATE("timestamp") 
                ) AS "tmp" WHERE "tmp"."sid" = '${sid}' AND "date" BETWEEN 
                TO_DATE('${dateStart}', 'DD-MM-YYYY') AND TO_DATE('${dateEnd}', 'DD-MM-YYYY');`,
        );
        return queryArr.rows;
    };

    //////////////////////////////////////////////////////////////////////////////
    //Windspeed

    getLatestWindspeedBySid = async (
        sid: string,
    ): Promise<WindspeedTimestamp> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT "timestamp", "windspeed" 
            FROM "Environment" 
            WHERE "sid" = '${sid}' 
            ORDER BY timestamp DESC LIMIT 1;`,
        );
        return queryArr.rows[0];
    };

    getLast24HrsWindspeedBySid = async (
        sid: string,
    ): Promise<WindspeedTimestamp[]> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT "timestamp", "windspeed" 
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
    ): Promise<WindspeedTimestamp[]> => {
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
    ): Promise<WindspeedTimestamp[]> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT "timestamp", "windspeed" 
            FROM "Environment" 
            WHERE "sid" = '${sid}' 
            ORDER BY timestamp DESC LIMIT '${number}';`,
        );
        return queryArr.rows;
    };
    getMaxAndMinWindSpeedBetweenDateBySid = async (
        sid: string,
        dateStart: string,
        dateEnd: string,
    ): Promise<MaxAndMinWindSpeed[]> => {
        const queryArr = await this.dbPoolQuery(
            `SELECT "date", "maxWindSpeed", "minWindSpeed" FROM (
                SELECT "sid", DATE("timestamp") "date",
                MAX("windspeed") as "maxWindSpeed", MIN("windspeed") AS "minWindSpeed"
                FROM "Environment"
                GROUP BY "sid", DATE("timestamp") 
                ) AS "tmp" WHERE "tmp"."sid" = '${sid}' AND "date" BETWEEN 
                TO_DATE('${dateStart}', 'DD-MM-YYYY') AND TO_DATE('${dateEnd}', 'DD-MM-YYYY');`,
        );
        return queryArr.rows;
    };
    exportCSV = async (header, list_record, filename) => {
        const createCsvWriter = require('csv-writer').createObjectCsvWriter;
        const csvWriter = createCsvWriter({
            header: header,
            path: `csv/${filename}`,
        });
        csvWriter.writeRecords(list_record);
    };
}
