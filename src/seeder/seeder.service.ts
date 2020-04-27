import {
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
} from '../db/db.interfaces';
import {
    addConstraint,
    addIndexBtree,
    addMultiConstraint,
    addUniqueIndexBtree,
    createTable,
    dropTable,
} from './utils';

import { ConfigService } from '@nestjs/config';
import { DbService } from '../db/db.service';
import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { Role } from '../users/users.interfaces';
import { poolQuery } from '../db/utils';

@Injectable()
export class SeederService {
    constructor(
        private readonly configService: ConfigService,
        private readonly dbService: DbService,
    ) {}

    private pool = new Pool({
        connectionString:
            process.env.QUERY_DB_URI ||
            this.configService.get<string>('QUERY_DB_URI'),
    });

    private poolInit = new Pool({
        connectionString:
            process.env.DB_URI || this.configService.get<string>('DB_URI'),
    });

    seedNewDatabase = async () => {
        await poolQuery(this.poolInit, `CREATE DATABASE "chicken_farm";`);
    };
    seedNewDatabaseUser = async () => {
        await poolQuery(
            this.poolInit,
            `CREATE USER user1 WITH PASSWORD 'password';
        GRANT ALL PRIVILEGES ON DATABASE "chicken_farm" to "user1";`,
        );
    };
    dropDatabase = async () => {
        await poolQuery(
            this.poolInit,
            `DROP DATABASE IF EXISTS "chicken_farm"`,
        );
    };
    dropDatabaseUser = async () => {
        await poolQuery(this.poolInit, `DROP USER IF EXISTS "user1"`);
    };
    seedTableConstraint = async () => {
        const query_list = [];
        query_list.push(
            createTable(
                'House',
                '"hid" SERIAL, \
                "hno" INT, \
                "length" DOUBLE PRECISION, \
                "width" DOUBLE PRECISION, \
                "scale" DOUBLE PRECISION, \
                PRIMARY KEY (hid)',
            ),
        );

        query_list.push(
            createTable(
                'User',
                '"uid" SERIAL, \
                "username" VARCHAR(50) UNIQUE, \
                "hashedPwd" VARCHAR, \
                "isCurrentUser" BOOLEAN, \
                "firstName" VARCHAR(50), \
                "lastName" VARCHAR(50), \
                "lineID" VARCHAR(50), \
                "role" VARCHAR(50), \
                "imageUrl" VARCHAR, \
                "hid" INT, \
                PRIMARY KEY (uid)',
            ),
        );

        query_list.push(
            createTable(
                'Chicken',
                '"generation" VARCHAR(50), \
                "dateIn" DATE, \
                "dateOut" DATE, \
                "type" VARCHAR(20), \
                "amountIn" INT, \
                "gender" VARCHAR(10), \
                "hid" INT NOT NULL, \
                PRIMARY KEY ("generation", "hid")',
            ),
        );

        query_list.push(
            createTable(
                'DailyRecord',
                '"date" DATE, \
                "hid" INT NOT NULL, \
                PRIMARY KEY (date, hid)',
            ),
        );

        query_list.push(
            createTable(
                'ChickenRecord',
                '"chicTime" TIMESTAMP, \
                "period" VARCHAR(10), \
                "amountDead" INT, \
                "amountZleg" INT, \
                "amountDwaft" INT, \
                "amountSick" INT, \
                "date" DATE, \
                "hid" INT NOT NULL, \
                PRIMARY KEY ("chicTime", date, hid)',
            ),
        );

        query_list.push(
            createTable(
                'DailyDataRecord',
                '"timestamp" TIMESTAMP, \
                "date" DATE, \
                "hid" INT NOT NULL, \
                PRIMARY KEY (timestamp, date, hid)',
            ),
        );

        query_list.push(
            createTable(
                'FoodRecord',
                '"foodSilo" INT, \
                "foodIn" DOUBLE PRECISION, \
                "foodRemain" DOUBLE PRECISION, \
                "foodConsumed" DOUBLE PRECISION, \
                "timestamp" TIMESTAMP, \
                "date" DATE, \
                "hid" INT NOT NULL, \
                PRIMARY KEY ("foodSilo", timestamp, date, hid)',
            ),
        );

        query_list.push(
            createTable(
                'WaterRecord',
                '"waterMeter1" INT, \
                "waterMeter2" INT, \
                "waterConsumed" INT, \
                "timestamp" TIMESTAMP, \
                "date" DATE, \
                "hid" INT NOT NULL, \
                PRIMARY KEY ("waterMeter1", "waterMeter2", timestamp, date, hid)',
            ),
        );

        query_list.push(
            createTable(
                'MedicineRecord',
                '"medicineType" VARCHAR(50), \
                "medicineConc" DOUBLE PRECISION, \
                "timestamp" TIMESTAMP, \
                "date" DATE, \
                "hid" INT NOT NULL, \
                PRIMARY KEY ("medicineType", "timestamp", "date", "hid")',
            ),
        );

        query_list.push(
            createTable(
                'Camera',
                '"cid" VARCHAR, \
                "cno" INT, \
                "xPosCam" INT, \
                "yPosCam" INT, \
                "hid" INT NOT NULL, \
                PRIMARY KEY (cid)',
            ),
        );

        query_list.push(
            createTable(
                'Image',
                '"timestamp" TIMESTAMP, \
                "url" VARCHAR, \
                "amountDead" INT, \
                "cid" VARCHAR NOT NULL, \
                PRIMARY KEY (timestamp, cid)',
            ),
        );
        query_list.push(
            createTable(
                'CollectedDeadChickenTime',
                '"timestamp" TIMESTAMP, \
                "cid" VARCHAR NOT NULL, \
                PRIMARY KEY (timestamp, cid)',
            ),
        );

        query_list.push(
            createTable(
                'Sensor',
                '"sid" VARCHAR, \
                "xPosSen" INT, \
                "yPosSen" INT, \
                "hid" INT NOT NULL, \
                PRIMARY KEY (sid)',
            ),
        );

        query_list.push(
            createTable(
                'Environment',
                '"timestamp" TIMESTAMP, \
                "windspeed" DOUBLE PRECISION, \
                "ammonia" DOUBLE PRECISION, \
                "temperature" DOUBLE PRECISION, \
                "humidity" DOUBLE PRECISION, \
                "sid" VARCHAR NOT NULL, \
                PRIMARY KEY (timestamp, sid)',
            ),
        );
        query_list.push(
            addConstraint(
                'User',
                'hid',
                'House',
                'hid',
                'hid_constraint',
                'ON UPDATE NO ACTION ON DELETE NO ACTION',
            ),
        );
        query_list.push(
            addConstraint('Chicken', 'hid', 'House', 'hid', 'hid_constraint'),
        );

        query_list.push(
            addConstraint(
                'DailyRecord',
                'hid',
                'House',
                'hid',
                'hid_constraint',
            ),
        );

        query_list.push(
            addConstraint(
                'CollectedDeadChickenTime',
                'cid',
                'Camera',
                'cid',
                'cid_constraint',
            ),
        );

        query_list.push(
            addMultiConstraint(
                'DailyDataRecord',
                'hid, date',
                'DailyRecord',
                'hid, date',
                'hid_timestamp_constraint',
            ),
        );

        query_list.push(
            addMultiConstraint(
                'FoodRecord',
                'timestamp, date, hid',
                'DailyDataRecord',
                'timestamp, date, hid',
                'ts_date_hid_constraint',
            ),
        );

        query_list.push(
            addMultiConstraint(
                'ChickenRecord',
                'date, hid',
                'DailyRecord',
                'date, hid',
                'date_hid_constraint',
            ),
        );
        query_list.push(
            addMultiConstraint(
                'WaterRecord',
                'timestamp, date, hid',
                'DailyDataRecord',
                'timestamp, date, hid',
                'ts_date_hid_constraint',
            ),
        );
        query_list.push(
            addMultiConstraint(
                'MedicineRecord',
                'timestamp, date, hid',
                'DailyDataRecord',
                'timestamp, date, hid',
                'ts_date_hid_constraint',
            ),
        );
        query_list.push(
            addConstraint('Camera', 'hid', 'House', 'hid', 'hid_constraint'),
        );
        query_list.push(
            addConstraint('Image', 'cid', 'Camera', 'cid', 'cid_constraint'),
        );
        query_list.push(
            addConstraint('Sensor', 'hid', 'House', 'hid', 'hid_constraint'),
        );
        query_list.push(
            addConstraint(
                'Environment',
                'sid',
                'Sensor',
                'sid',
                'sid_constraint',
            ),
        );
        await poolQuery(this.pool, query_list.join(''));
    };

    seedIndexTable = async () => {
        let query_list = [];
        query_list.push(addUniqueIndexBtree('HouseIndex', 'House', 'hid'));
        query_list.push(addUniqueIndexBtree('UserIndex', 'User', 'uid'));
        query_list.push(
            addIndexBtree('DailyRecordIndex', 'DailyRecord', 'hid, date'),
        );
        query_list.push(
            addIndexBtree(
                'DailyDataRecordIndex',
                'DailyDataRecord',
                'date, timestamp',
            ),
        );
        query_list.push(
            addIndexBtree('ChickenIndex', 'Chicken', 'hid, generation'),
        );
        query_list.push(addUniqueIndexBtree('SensorIndex', 'Sensor', 'sid'));
        query_list.push(addUniqueIndexBtree('CameraIndex', 'Camera', 'cid'));
        query_list.push(
            addIndexBtree(
                'WaterRecordIndex',
                'WaterRecord',
                'hid, date, timestamp',
            ),
        );
        query_list.push(
            addIndexBtree(
                'MedicineRecordIndex',
                'MedicineRecord',
                'hid, date, timestamp',
            ),
        );
        query_list.push(addIndexBtree('ImageIndex', 'Image', 'cid, timestamp'));
        query_list.push(
            addIndexBtree(
                'CollectedDeadChickenTimeIndex',
                'CollectedDeadChickenTime',
                'cid, timestamp',
            ),
        );
        query_list.push(
            addIndexBtree(
                'FoodRecordIndex',
                'FoodRecord',
                'hid, "foodSilo", date, timestamp',
            ),
        );
        query_list.push(
            addIndexBtree('EnvironmentIndex', 'Environment', 'sid, timestamp'),
        );
        query_list.push(
            addIndexBtree(
                'ChickenRecordIndex',
                'ChickenRecord',
                'hid, date, "chicTime"',
            ),
        );

        await poolQuery(this.pool, query_list.join(''));
    };

    seedSampleData = async () => {
        await this.dbService.createHouse(1, 10, 10, 10);
        await this.dbService.createHouse(2, 10, 10, 10);
        let UserDataInput: CreateUserInput = {
            username: 'owner',
            hashedPwd:
                '$2b$04$vpJ4H0yfvyN68IsbAS4e2eQ3A/wPJvK2bWqpq6CDhhHX9Y63IhHyG',
            isCurrentUser: true,
            firstName: 'worker1',
            lastName: 'lastname1',
            lineID: 'line1',
            role: Role.OWNER,
            imageUrl: 'https://i.imgur.com/M9CxSGh.jpg',
            hid: 1,
        };
        let UserDataInput2: CreateUserInput = {
            username: 'worker',
            hashedPwd:
                '$2b$04$C4GP5tj3zJCpgOHOBHmbfe1ahTVhvhfch6uwJ1Gv7vSUE3nJfJuyS',
            isCurrentUser: true,
            firstName: 'worker2',
            lastName: 'lastname2',
            lineID: 'line2',
            role: Role.WORKER,
            imageUrl: 'https://i.imgur.com/asFo8tE.jpg',
            hid: 2,
        };
        await this.dbService.createUser(UserDataInput);
        await this.dbService.createUser(UserDataInput2);
        await this.dbService.createDailyRecord('12-03-2020', 1);
        await this.dbService.createDailyRecord('12-03-2020', 2);
        await this.dbService.createDailyRecord('13-03-2020', 1);
        await this.dbService.createDailyRecord('13-03-2020', 2);
        let chickenInput: CreateChickenFlockInput = {
            generation: '2020/1',
            dateIn: '12-03-2020',
            dateOut: '12-04-2020',
            type: 'Sally',
            amountIn: 40000,
            gender: 'MALE',
            hid: 1,
        };
        let chickenInput2: CreateChickenFlockInput = {
            generation: '2020/1',
            dateIn: '12-03-2020',
            dateOut: '12-04-2020',
            type: 'Sally',
            amountIn: 40000,
            gender: 'FEMALE',
            hid: 2,
        };
        const sensor1: CreateSensorInput = {
            sid: '1',
            hid: 1,
            xPosSen: 1,
            yPosSen: 1,
        };

        const sensor2: CreateSensorInput = {
            sid: '2',
            hid: 1,
            xPosSen: 1,
            yPosSen: 2,
        };

        const sensor3: CreateSensorInput = {
            sid: '3',
            hid: 1,
            xPosSen: 1,
            yPosSen: 3,
        };

        const sensor4: CreateSensorInput = {
            sid: '4',
            hid: 1,
            xPosSen: 2,
            yPosSen: 1,
        };

        const sensor5: CreateSensorInput = {
            sid: '5',
            hid: 1,
            xPosSen: 2,
            yPosSen: 2,
        };
        const sensor6: CreateSensorInput = {
            sid: '6',
            hid: 1,
            xPosSen: 2,
            yPosSen: 3,
        };
        const sensor7: CreateSensorInput = {
            sid: '7',
            hid: 2,
            xPosSen: 1,
            yPosSen: 1,
        };
        const sensor8: CreateSensorInput = {
            sid: '8',
            hid: 2,
            xPosSen: 1,
            yPosSen: 2,
        };
        const sensor9: CreateSensorInput = {
            sid: '9',
            hid: 1,
            xPosSen: 1,
            yPosSen: 3,
        };

        let no = 1;
        for (let i = 1; i <= 13; i++) {
            for (let j = 1; j <= 24; j++) {
                const cameraInput: CreateCameraInput = {
                    cid: `${no}`,
                    cno: no,
                    hid: 1,
                    xPosCam: i,
                    yPosCam: j,
                };
                await this.dbService.createCamera(cameraInput);
                no++;
            }
        }
        await this.dbService.createChickenFlock(chickenInput);
        await this.dbService.createChickenFlock(chickenInput2);
        await this.dbService.createSensor(sensor1);
        await this.dbService.createSensor(sensor2);
        await this.dbService.createSensor(sensor3);
        await this.dbService.createSensor(sensor4);
        await this.dbService.createSensor(sensor5);
        await this.dbService.createSensor(sensor6);
        await this.dbService.createSensor(sensor7);
        await this.dbService.createSensor(sensor8);
        await this.dbService.createSensor(sensor9);
        let chickenRecordInput: CreateChickenRecordInput = {
            chicTime: '1584011015',
            period: 'MORNING',
            amountDead: 10,
            amountZleg: 5,
            amountDwaft: 2,
            amountSick: 9,
            date: '12-03-2020',
            hid: 1,
        };
        await this.dbService.createChickenRecord(chickenRecordInput);

        let chickenRecordInput2: CreateChickenRecordInput = {
            chicTime: '1584011015',
            period: 'MORNING',
            amountDead: 40,
            amountZleg: 4,
            amountDwaft: 3,
            amountSick: 2,
            date: '12-03-2020',
            hid: 2,
        };
        await this.dbService.createChickenRecord(chickenRecordInput2);

        let chickenRecordInput3: CreateChickenRecordInput = {
            chicTime: '1584023974',
            period: 'EVENING',
            amountDead: 13,
            amountZleg: 4,
            amountDwaft: 4,
            amountSick: 2,
            date: '12-03-2020',
            hid: 1,
        };
        await this.dbService.createChickenRecord(chickenRecordInput3);

        let chickenRecordInput4: CreateChickenRecordInput = {
            chicTime: '1584023974',
            period: 'EVENING',
            amountDead: 4,
            amountZleg: 7,
            amountDwaft: 3,
            amountSick: 6,
            date: '12-03-2020',
            hid: 2,
        };
        await this.dbService.createChickenRecord(chickenRecordInput4);

        let dailyDataRecordInput: CreateDailyDataRecordInput = {
            timestamp: '1584014660',
            date: '12-03-2020',
            hid: 1,
        };
        await this.dbService.createDailyDataRecord(dailyDataRecordInput);

        let dailyDataRecordInput2: CreateDailyDataRecordInput = {
            timestamp: '1584014660',
            date: '12-03-2020',
            hid: 2,
        };
        await this.dbService.createDailyDataRecord(dailyDataRecordInput2);
        let foodRecordInput: CreateFoodRecordInput = {
            foodSilo: 1,
            foodIn: 8970,
            foodRemain: 4879,
            foodConsumed: 2421,
            timestamp: '1584014660',
            date: '12-03-2020',
            hid: 1,
        };
        await this.dbService.createFoodRecord(foodRecordInput);

        let foodRecordInput2: CreateFoodRecordInput = {
            foodSilo: 2,
            foodIn: 970,
            foodRemain: 79,
            foodConsumed: 134,
            timestamp: '1584014660',
            date: '12-03-2020',
            hid: 1,
        };
        await this.dbService.createFoodRecord(foodRecordInput2);

        let foodRecordInput3: CreateFoodRecordInput = {
            foodSilo: 1,
            foodIn: 9450,
            foodRemain: 7925,
            foodConsumed: 3454,
            timestamp: '1584014660',
            date: '12-03-2020',
            hid: 2,
        };
        await this.dbService.createFoodRecord(foodRecordInput3);

        let foodRecordInput4: CreateFoodRecordInput = {
            foodSilo: 2,
            foodIn: 2350,
            foodRemain: 2421,
            foodConsumed: 344,
            timestamp: '1584014660',
            date: '12-03-2020',
            hid: 2,
        };
        await this.dbService.createFoodRecord(foodRecordInput4);

        let dailyDataRecordInput3: CreateDailyDataRecordInput = {
            timestamp: '1584018805',
            date: '12-03-2020',
            hid: 1,
        };
        await this.dbService.createDailyDataRecord(dailyDataRecordInput3);

        let dailyDataRecordInput4: CreateDailyDataRecordInput = {
            timestamp: '1584018905',
            date: '12-03-2020',
            hid: 2,
        };
        await this.dbService.createDailyDataRecord(dailyDataRecordInput4);

        let medicineRecordInput: CreateMedicineRecordInput = {
            medicineType: 'NDIB',
            medicineConc: 35000,
            timestamp: '1584018805',
            date: '12-03-2020',
            hid: 1,
        };
        await this.dbService.createMedicineRecord(medicineRecordInput);

        let medicineRecordInput2: CreateMedicineRecordInput = {
            medicineType: 'NDIB',
            medicineConc: 40000,
            timestamp: '1584018905',
            date: '12-03-2020',
            hid: 2,
        };
        await this.dbService.createMedicineRecord(medicineRecordInput2);

        let dailyDataRecordInput5: CreateDailyDataRecordInput = {
            timestamp: '1584019202',
            date: '12-03-2020',
            hid: 1,
        };
        await this.dbService.createDailyDataRecord(dailyDataRecordInput5);
        let dailyDataRecordInput6: CreateDailyDataRecordInput = {
            timestamp: '1584019202',
            date: '12-03-2020',
            hid: 2,
        };
        await this.dbService.createDailyDataRecord(dailyDataRecordInput6);

        let waterRecordInput: CreateWaterRecordInput = {
            waterMeter1: 2508392,
            waterMeter2: 2530116,
            waterConsumed: 663,
            timestamp: '1584019202',
            date: '12-03-2020',
            hid: 1,
        };
        await this.dbService.createWaterRecord(waterRecordInput);

        let waterRecordInput2: CreateWaterRecordInput = {
            waterMeter1: 2608392,
            waterMeter2: 2530116,
            waterConsumed: 546,
            timestamp: '1584019202',
            date: '12-03-2020',
            hid: 2,
        };
        await this.dbService.createWaterRecord(waterRecordInput2);

        let dailyDataRecordInput7: CreateDailyDataRecordInput = {
            timestamp: '1584019202',
            date: '13-03-2020',
            hid: 1,
        };
        await this.dbService.createDailyDataRecord(dailyDataRecordInput7);

        let dailyDataRecordInput8: CreateDailyDataRecordInput = {
            timestamp: '1584019202',
            date: '13-03-2020',
            hid: 2,
        };
        await this.dbService.createDailyDataRecord(dailyDataRecordInput8);

        let waterRecordInput3: CreateWaterRecordInput = {
            waterMeter1: 2508508,
            waterMeter2: 2530735,
            waterConsumed: 763,
            timestamp: '1584019202',
            date: '13-03-2020',
            hid: 1,
        };
        await this.dbService.createWaterRecord(waterRecordInput3);

        let waterRecordInput4: CreateWaterRecordInput = {
            waterMeter1: 2508508,
            waterMeter2: 2530735,
            waterConsumed: 346,
            timestamp: '1584019202',
            date: '13-03-2020',
            hid: 2,
        };
        await this.dbService.createWaterRecord(waterRecordInput4);

        let environmentInput: CreateEnvDataInput = {
            timestamp: '1584011605',
            windspeed: 120,
            ammonia: 23,
            temperature: 27.8,
            humidity: 48.6,
            sid: '1',
        };
        await this.dbService.createEnvData(environmentInput);

        let environmentInput2: CreateEnvDataInput = {
            timestamp: '1584011605',
            windspeed: 123,
            ammonia: 24,
            temperature: 28.8,
            humidity: 48.5,
            sid: '2',
        };
        await this.dbService.createEnvData(environmentInput2);

        let environmentInput3: CreateEnvDataInput = {
            timestamp: '1584011605',
            windspeed: 130,
            ammonia: 22,
            temperature: 23.8,
            humidity: 44.6,
            sid: '3',
        };

        await this.dbService.createEnvData(environmentInput3);
        let environmentInput4: CreateEnvDataInput = {
            timestamp: '1584090605',
            windspeed: 143,
            ammonia: 22,
            temperature: 26.4,
            humidity: 40.5,
            sid: '4',
        };

        await this.dbService.createEnvData(environmentInput4);

        let environmentInput5: CreateEnvDataInput = {
            timestamp: '1584090605',
            windspeed: 139,
            ammonia: 20,
            temperature: 27.4,
            humidity: 41.5,
            sid: '5',
        };
        await this.dbService.createEnvData(environmentInput5);

        let environmentInput6: CreateEnvDataInput = {
            timestamp: '1584090605',
            windspeed: 129,
            ammonia: 28,
            temperature: 27.5,
            humidity: 41.3,
            sid: '6',
        };
        await this.dbService.createEnvData(environmentInput6);
        let environmentInput01: CreateEnvDataInput = {
            timestamp: '1584011805',
            windspeed: 118,
            ammonia: 24,
            temperature: 23.3,
            humidity: 41.3,
            sid: '1',
        };
        await this.dbService.createEnvData(environmentInput01);

        let environmentInput21: CreateEnvDataInput = {
            timestamp: '1584011805',
            windspeed: 133,
            ammonia: 29,
            temperature: 23.4,
            humidity: 42.3,
            sid: '2',
        };
        await this.dbService.createEnvData(environmentInput21);

        let environmentInput31: CreateEnvDataInput = {
            timestamp: '1584011805',
            windspeed: 132,
            ammonia: 23,
            temperature: 24.8,
            humidity: 44.3,
            sid: '3',
        };

        await this.dbService.createEnvData(environmentInput31);
        let environmentInput41: CreateEnvDataInput = {
            timestamp: '1584090805',
            windspeed: 141,
            ammonia: 20,
            temperature: 23.3,
            humidity: 42.9,
            sid: '4',
        };

        await this.dbService.createEnvData(environmentInput41);

        let environmentInput51: CreateEnvDataInput = {
            timestamp: '1584090805',
            windspeed: 149,
            ammonia: 19,
            temperature: 23.4,
            humidity: 43.5,
            sid: '5',
        };
        await this.dbService.createEnvData(environmentInput51);

        let environmentInput61: CreateEnvDataInput = {
            timestamp: '1584090805',
            windspeed: 124,
            ammonia: 23,
            temperature: 24.5,
            humidity: 41.2,
            sid: '6',
        };
        await this.dbService.createEnvData(environmentInput61);

        let environmentInput7: CreateEnvDataInput = {
            timestamp: '1584090805',
            windspeed: 128,
            ammonia: 27,
            temperature: 28.2,
            humidity: 42.3,
            sid: '7',
        };
        await this.dbService.createEnvData(environmentInput7);

        let environmentInput8: CreateEnvDataInput = {
            timestamp: '1584090805',
            windspeed: 158,
            ammonia: 23,
            temperature: 33.2,
            humidity: 32.3,
            sid: '8',
        };
        await this.dbService.createEnvData(environmentInput8);

        let environmentInput9: CreateEnvDataInput = {
            timestamp: '1584090805',
            windspeed: 128,
            ammonia: 25,
            temperature: 35.2,
            humidity: 35.3,
            sid: '9',
        };
        await this.dbService.createEnvData(environmentInput9);

        for (let i = 1; i <= 312; i++) {
            let imageInput: CreateCamImgInput = {
                timestamp: '1584011605',
                url: `https://i.imgur.com/0jQOC0U.jpg`,
                amountDead: Math.floor(Math.random() * 10),
                cid: `${i}`,
            };
            await this.dbService.createImage(imageInput);
        }
        await this.dbService.createCollectedDeadChickenTime('1584011605', '2');
        await this.dbService.createCollectedDeadChickenTime('1584090805', '4');
    };

    dropAllTable = async () => {
        var query_list = [];
        query_list.push(dropTable('ChickenRecord'));
        query_list.push(dropTable('Environment'));
        query_list.push(dropTable('FoodRecord'));
        query_list.push(dropTable('CollectedDeadChickenTime'));
        query_list.push(dropTable('Image'));
        query_list.push(dropTable('MedicineRecord'));
        query_list.push(dropTable('WaterRecord'));
        query_list.push(dropTable('Camera'));
        query_list.push(dropTable('Sensor'));
        query_list.push(dropTable('Chicken'));
        query_list.push(dropTable('DailyDataRecord'));
        query_list.push(dropTable('DailyRecord'));
        query_list.push(dropTable('User'));
        query_list.push(dropTable('House'));
        await poolQuery(this.pool, query_list.join(''));
    };

    seedSampleDataSet2 = async () => {
        for (let i = 1; i <= 5; i++) {
            await this.dbService.createHouse(i, 10, 10, 10);
        }

        let ownerDataInput: CreateUserInput = {
            username: `owner`,
            hashedPwd:
                '$2b$04$vpJ4H0yfvyN68IsbAS4e2eQ3A/wPJvK2bWqpq6CDhhHX9Y63IhHyG',
            isCurrentUser: true,
            firstName: `ownerfirstname`,
            lastName: `ownerlastname`,
            lineID: `lineowner`,
            role: Role.OWNER,
            imageUrl: `https://i.imgur.com/M9CxSGh.jpg`,
            hid: null,
        };
        await this.dbService.createUser(ownerDataInput);

        let userDataInput: CreateUserInput = {
            username: `worker`,
            hashedPwd:
                '$2b$04$C4GP5tj3zJCpgOHOBHmbfe1ahTVhvhfch6uwJ1Gv7vSUE3nJfJuyS',
            isCurrentUser: true,
            firstName: `firstname`,
            lastName: `lastname`,
            lineID: `lineid`,
            role: Role.WORKER,
            imageUrl: `https://i.imgur.com/asFo8tE.jpg`,
            hid: 1,
        };
        await this.dbService.createUser(userDataInput);

        for (let i = 1; i <= 5; i++) {
            for (let j = 1; j <= 2; j++) {
                let userDataInput: CreateUserInput = {
                    username: `worker${i}${j}`,
                    hashedPwd:
                        '$2b$04$C4GP5tj3zJCpgOHOBHmbfe1ahTVhvhfch6uwJ1Gv7vSUE3nJfJuyS',
                    isCurrentUser: true,
                    firstName: `firstname${i}${j}`,
                    lastName: `lastname${i}${j}`,
                    lineID: `lineid${i}${j}`,
                    role: Role.WORKER,
                    imageUrl: `https://i.imgur.com/asFo8tE.jpg`,
                    hid: i,
                };
                await this.dbService.createUser(userDataInput);
            }
        }

        for (let num = 1; num <= 9; num++) {
            for (let i = 1; i <= 5; i++) {
                await this.dbService.createDailyRecord(`1${num}-03-2020`, i);
            }
        }

        let randomGender = ['MALE', 'FEMALE'];
        for (let i = 1; i <= 5; i++) {
            let randomPostionInlist = Math.floor(
                Math.random() * randomGender.length,
            );
            let chickenInput: CreateChickenFlockInput = {
                generation: '2020/1',
                dateIn: '11-03-2020',
                dateOut: '11-04-2020',
                type: 'Sally',
                amountIn: 40000,
                gender: randomGender[randomPostionInlist],
                hid: i,
            };
            await this.dbService.createChickenFlock(chickenInput);
        }
        let uniqueID = 1;
        for (let house = 1; house <= 5; house++) {
            let no = 1;
            for (let i = 1; i <= 13; i++) {
                for (let j = 1; j <= 24; j++) {
                    const cameraInput: CreateCameraInput = {
                        cid: `${uniqueID}`,
                        cno: no,
                        hid: house,
                        xPosCam: i,
                        yPosCam: j,
                    };
                    await this.dbService.createCamera(cameraInput);
                    no++;
                    uniqueID++;
                }
            }
        }
        //CREATE ChickenRecord SAMPLE
        let tsMorning1 = 1583895000;
        let tsMorning2 = 1583902200;
        let tsEvening1 = 1583928600;
        let tsEvening2 = 1583935800;
        for (let day = 1; day <= 8; day++) {
            for (let house = 1; house <= 5; house++) {
                let getDate = new Date(0);
                getDate.setSeconds(tsMorning1);
                let getDay = getDate.getDate();
                let getMonth = 1 + getDate.getMonth();
                let getYear = getDate.getFullYear();
                let inputDateMorning1 = `${getDay}-${getMonth}-${getYear}`;
                let chickenRecordInputMorning1: CreateChickenRecordInput = {
                    chicTime: `${tsMorning1}`,
                    period: 'MORNING',
                    amountDead: Math.floor(Math.random() * 10),
                    amountZleg: Math.floor(Math.random() * 10),
                    amountDwaft: Math.floor(Math.random() * 10),
                    amountSick: Math.floor(Math.random() * 10),
                    date: inputDateMorning1,
                    hid: house,
                };
                await this.dbService.createChickenRecord(
                    chickenRecordInputMorning1,
                );
            }
            for (let house = 1; house <= 5; house++) {
                let getDate = new Date(0);
                getDate.setSeconds(tsMorning2);
                let getDay = getDate.getDate();
                let getMonth = 1 + getDate.getMonth();
                let getYear = getDate.getFullYear();
                let inputDateMorning2 = `${getDay}-${getMonth}-${getYear}`;
                let chickenRecordInputMorning2: CreateChickenRecordInput = {
                    chicTime: `${tsMorning2}`,
                    period: 'MORNING',
                    amountDead: Math.floor(Math.random() * 10 + 5),
                    amountZleg: Math.floor(Math.random() * 10 + 5),
                    amountDwaft: Math.floor(Math.random() * 10 + 5),
                    amountSick: Math.floor(Math.random() * 10 + 5),
                    date: `${inputDateMorning2}`,
                    hid: house,
                };
                await this.dbService.createChickenRecord(
                    chickenRecordInputMorning2,
                );
            }

            for (let house = 1; house <= 5; house++) {
                let getDate = new Date(0);
                getDate.setSeconds(tsEvening1);
                let getDay = getDate.getDate();
                let getMonth = 1 + getDate.getMonth();
                let getYear = getDate.getFullYear();
                let inputDateEvening1 = `${getDay}-${getMonth}-${getYear}`;
                let chickenRecordInputEvening1: CreateChickenRecordInput = {
                    chicTime: `${tsEvening1}`,
                    period: 'EVENING',
                    amountDead: Math.floor(Math.random() * 10),
                    amountZleg: Math.floor(Math.random() * 10),
                    amountDwaft: Math.floor(Math.random() * 10),
                    amountSick: Math.floor(Math.random() * 10),
                    date: `${inputDateEvening1}`,
                    hid: house,
                };
                await this.dbService.createChickenRecord(
                    chickenRecordInputEvening1,
                );
            }

            for (let house = 1; house <= 5; house++) {
                let getDate = new Date(0);
                getDate.setSeconds(tsEvening2);
                let getDay = getDate.getDate();
                let getMonth = 1 + getDate.getMonth();
                let getYear = getDate.getFullYear();
                let inputDateEvening2 = `${getDay}-${getMonth}-${getYear}`;
                let chickenRecordInputEvening2: CreateChickenRecordInput = {
                    chicTime: `${tsEvening2}`,
                    period: 'EVENING',
                    amountDead: Math.floor(Math.random() * 10 + 5),
                    amountZleg: Math.floor(Math.random() * 10 + 5),
                    amountDwaft: Math.floor(Math.random() * 10 + 5),
                    amountSick: Math.floor(Math.random() * 10 + 5),
                    date: `${inputDateEvening2}`,
                    hid: house,
                };
                await this.dbService.createChickenRecord(
                    chickenRecordInputEvening2,
                );
            }
            tsMorning1 = tsMorning1 + 60 * 60 * 24;
            tsMorning2 = tsMorning2 + 60 * 60 * 24;
            tsEvening1 = tsEvening1 + 60 * 60 * 24;
            tsEvening2 = tsEvening2 + 60 * 60 * 24;
        }
        ////////////////////////////////////////////////////////
        let ts = 1583895600;
        for (let t = 1; t <= 96; t++) {
            for (let house = 1; house <= 5; house++) {
                let getDate = new Date(0);
                getDate.setSeconds(ts);
                let getDay = getDate.getDate();
                let getMonth = 1 + getDate.getMonth();
                let getYear = getDate.getFullYear();
                let inputDate = `${getDay}-${getMonth}-${getYear}`;

                let dailyDataRecordInput: CreateDailyDataRecordInput = {
                    timestamp: `${ts}`,
                    date: `${inputDate}`,
                    hid: house,
                };
                // console.log(dailyDataRecordInput);
                await this.dbService.createDailyDataRecord(
                    dailyDataRecordInput,
                );
            }
            ts = ts + 60 * 60 * 2;
        }

        //create Food Record Input one times per day
        ts = 1583895600;
        for (let t = 1; t <= 7; t++) {
            for (let house = 1; house <= 5; house++) {
                for (let silo = 1; silo <= 2; silo++) {
                    let getDate = new Date(0);
                    getDate.setSeconds(ts);
                    let getDay = getDate.getDate();
                    let getMonth = 1 + getDate.getMonth();
                    let getYear = getDate.getFullYear();
                    let inputDate = `${getDay}-${getMonth}-${getYear}`;

                    let foodRecordInput: CreateFoodRecordInput = {
                        foodSilo: silo,
                        foodIn: 8000 + Math.floor(Math.random() * 2000),
                        foodRemain: 6000 + Math.floor(Math.random() * 2000),
                        foodConsumed: 1000 + Math.floor(Math.random() * 1000),
                        timestamp: `${ts}`,
                        date: `${inputDate}`,
                        hid: house,
                    };
                    // console.log(foodRecordInput);
                    await this.dbService.createFoodRecord(foodRecordInput);
                }
            }
            ts = ts + 60 * 60 * 24;
        }

        //create Medicine Record Only one times
        ts = 1583895600 + 60 * 60 * 6;
        for (let t = 1; t <= 1; t++) {
            for (let house = 1; house <= 5; house++) {
                let getDate = new Date(0);
                getDate.setSeconds(ts);
                let getDay = getDate.getDate();
                let getMonth = 1 + getDate.getMonth();
                let getYear = getDate.getFullYear();
                let inputDate = `${getDay}-${getMonth}-${getYear}`;

                let medicineRecordInput: CreateMedicineRecordInput = {
                    medicineType: 'NDIB',
                    medicineConc: 40000,
                    timestamp: `${ts}`,
                    date: `${inputDate}`,
                    hid: house,
                };
                await this.dbService.createMedicineRecord(medicineRecordInput);
            }
        }
        // create Water Record one times per day
        ts = 1583895600 + 60 * 60 * 8;
        let meter1 = 2508392;
        let meter2 = 2530116;
        let waterconsume = 663;
        for (let t = 1; t <= 7; t++) {
            for (let house = 1; house <= 5; house++) {
                let getDate = new Date(0);
                getDate.setSeconds(ts);
                let getDay = getDate.getDate();
                let getMonth = 1 + getDate.getMonth();
                let getYear = getDate.getFullYear();
                let inputDate = `${getDay}-${getMonth}-${getYear}`;

                let waterRecordInput: CreateWaterRecordInput = {
                    waterMeter1: meter1,
                    waterMeter2: meter2,
                    waterConsumed: waterconsume,
                    timestamp: `${ts}`,
                    date: `${inputDate}`,
                    hid: house,
                };
                await this.dbService.createWaterRecord(waterRecordInput);
            }
            meter1 = meter1 + Math.floor(Math.random() * 100);
            meter2 = 2530116 + Math.floor(Math.random() * 1000);
            waterconsume = 500 + Math.floor(Math.random() * 200);
            ts = ts + 60 * 60 * 24;
        }
        //create Sensor
        uniqueID = 1;
        for (let house = 1; house <= 5; house++) {
            for (let i = 1; i <= 2; i++) {
                for (let j = 1; j <= 3; j++) {
                    let sensorInput: CreateSensorInput = {
                        sid: `${uniqueID}`,
                        hid: house,
                        xPosSen: i,
                        yPosSen: j,
                    };
                    await this.dbService.createSensor(sensorInput);
                    uniqueID++;
                }
            }
        }
        //create Environment Data
        ts = 1583895600;
        for (let t = 1; t <= 30; t++) {
            uniqueID = 1;
            for (let house = 1; house <= 5; house++) {
                for (let no = 1; no <= 2 * 3; no++) {
                    let environmentInput: CreateEnvDataInput = {
                        timestamp: `${ts}`,
                        windspeed: this.weightedCenterRandom(1.6, 1.4, 5),
                        ammonia: this.weightedCenterRandom(30, 0, 3),
                        temperature: this.weightedCenterRandom(35, 20, 5),
                        humidity: this.weightedCenterRandom(80, 50, 2),
                        sid: `${uniqueID}`,
                    };
                    await this.dbService.createEnvData(environmentInput);
                    uniqueID++;
                }
            }
            ts = ts + 60 * 60 * 6;
        }
        //create Image
        ts = 1583895600;
        for (let t = 1; t <= 20; t++) {
            uniqueID = 1;
            for (let house = 1; house <= 2; house++) {
                for (let i = 1; i <= 13; i++) {
                    for (let j = 1; j <= 24; j++) {
                        let imageInput: CreateCamImgInput = {
                            timestamp: `${ts}`,
                            url: `https://i.imgur.com/0jQOC0U.jpg`,
                            amountDead: Math.floor(Math.random() * 10),
                            cid: `${uniqueID}`,
                        };
                        await this.dbService.createImage(imageInput);
                        uniqueID++;
                    }
                }
            }
            ts = ts + 60 * 60 * 2;
        }
        // create Collected Dead Chicken Time
        ts = 1583895600;
        for (let t = 1; t <= 2; t++) {
            uniqueID = 1;
            for (let house = 1; house <= 2; house++) {
                for (let i = 1; i <= 13; i++) {
                    for (let j = 1; j <= 24; j++) {
                        await this.dbService.createCollectedDeadChickenTime(
                            `${ts}`,
                            `${uniqueID}`,
                        );
                        uniqueID++;
                    }
                }
            }
            ts = ts + 60 * 60 * 6;
        }
    };

    seedSampleDataSet3 = async () => {
        for (let i = 1; i <= 5; i++) {
            await this.dbService.createHouse(i, 10, 10, 10);
        }

        let ownerDataInput: CreateUserInput = {
            username: `owner`,
            hashedPwd:
                '$2b$04$vpJ4H0yfvyN68IsbAS4e2eQ3A/wPJvK2bWqpq6CDhhHX9Y63IhHyG',
            isCurrentUser: true,
            firstName: `Nakornthip`,
            lastName: `Prompoon`,
            lineID: `lineowner`,
            role: Role.OWNER,
            imageUrl: `https://kookkook.s3-ap-southeast-1.amazonaws.com/profile/0.jpg`,
            hid: null,
        };
        await this.dbService.createUser(ownerDataInput);

        // let userDataInput: CreateUserInput = {
        //     username: `worker`,
        //     hashedPwd:
        //         '$2b$04$C4GP5tj3zJCpgOHOBHmbfe1ahTVhvhfch6uwJ1Gv7vSUE3nJfJuyS',
        //     isCurrentUser: true,
        //     firstName: `firstname`,
        //     lastName: `lastname`,
        //     lineID: `lineid`,
        //     role: Role.WORKER,
        //     imageUrl: `https://i.imgur.com/asFo8tE.jpg`,
        //     hid: 1,
        // };
        // await this.dbService.createUser(userDataInput);
        let firstname = [
            '',
            'Napatee',
            'Anapat',
            'Theerat',
            'Natakorn Ammy',
            'Panas',
            'Pachara',
            'Puvit',
            'Onninan',
            'Prin',
            'Ranchida',
        ];
        let lastname = [
            '',
            'Yaibuates',
            'Jiamwijitkul',
            'Tassanai',
            'Kam',
            'Rattanasuwan',
            'Pattarabodee',
            'Pracharktam',
            'Lewthanawinit',
            'Siripattanakul',
            'Nanagara',
        ];
        let userCount = 1;
        for (let i = 1; i <= 5; i++) {
            for (let j = 1; j <= 2; j++) {
                let userDataInput: CreateUserInput = {
                    username: `worker${i}${j}`,
                    hashedPwd:
                        '$2b$04$C4GP5tj3zJCpgOHOBHmbfe1ahTVhvhfch6uwJ1Gv7vSUE3nJfJuyS',
                    isCurrentUser: true,
                    firstName: firstname[userCount],
                    lastName: lastname[userCount],
                    lineID: `lineid${i}${j}`,
                    role: Role.WORKER,
                    imageUrl: `https://kookkook.s3-ap-southeast-1.amazonaws.com/profile/${userCount}.png`,
                    hid: i,
                };
                await this.dbService.createUser(userDataInput);
                userCount++;
            }
        }

        for (let num = 0; num <= 9; num++) {
            for (let house = 1; house <= 5; house++) {
                await this.dbService.createDailyRecord(
                    `2${num}-04-2020`,
                    house,
                );
            }
        }

        let randomGender = ['MALE', 'FEMALE'];
        for (let i = 1; i <= 5; i++) {
            let randomPostionInlist = Math.floor(
                Math.random() * randomGender.length,
            );
            let chickenInput: CreateChickenFlockInput = {
                generation: '2020/1',
                dateIn: '10-04-2020',
                dateOut: '15-05-2020',
                type: 'Sally',
                amountIn: 40000,
                gender: randomGender[randomPostionInlist],
                hid: i,
            };
            await this.dbService.createChickenFlock(chickenInput);
        }
        let uniqueID = 1;
        for (let house = 1; house <= 5; house++) {
            let no = 1;
            for (let i = 1; i <= 14; i++) {
                for (let j = 1; j <= 24; j++) {
                    const cameraInput: CreateCameraInput = {
                        cid: `${uniqueID}`,
                        cno: no,
                        hid: house,
                        xPosCam: i,
                        yPosCam: j,
                    };
                    await this.dbService.createCamera(cameraInput);
                    no++;
                    uniqueID++;
                }
            }
        }
        //CREATE ChickenRecord SAMPLE
        let tsMorning1 = 1587351000 + 60 * 60 * 6;
        let tsMorning2 = 1587358200 + 60 * 60 * 8;
        let tsEvening1 = 1587384600 + 60 * 60 * 4;
        let tsEvening2 = 1587391800 + 60 * 60 * 6;
        let randomweight = { 0: 0.8, 1: 0.05, 2: 0.05, 3: 0.05, 4: 0.05 };
        for (let day = 1; day <= 9; day++) {
            let amountDead1 = await this.weightedRandom(randomweight);
            let amountZleg1 = await this.weightedRandom(randomweight);
            let amountDwaft1 = await this.weightedRandom(randomweight);
            let amountSick1 = await this.weightedRandom(randomweight);
            for (let house = 1; house <= 5; house++) {
                amountDead1 = await this.weightedRandom(randomweight);
                amountZleg1 = await this.weightedRandom(randomweight);
                amountDwaft1 = await this.weightedRandom(randomweight);
                amountSick1 = await this.weightedRandom(randomweight);
                let getDate = new Date(0);
                getDate.setSeconds(tsMorning1);
                let getDay = getDate.getDate();
                let getMonth = 1 + getDate.getMonth();
                let getYear = getDate.getFullYear();
                let inputDateMorning1 = `${getDay}-${getMonth}-${getYear}`;
                let chickenRecordInputMorning1: CreateChickenRecordInput = {
                    chicTime: `${tsMorning1}`,
                    period: 'MORNING',
                    amountDead: amountDead1,
                    amountZleg: amountZleg1,
                    amountDwaft: amountDwaft1,
                    amountSick: amountSick1,
                    date: inputDateMorning1,
                    hid: house,
                };
                await this.dbService.createChickenRecord(
                    chickenRecordInputMorning1,
                );
            }
            for (let house = 1; house <= 5; house++) {
                let getDate = new Date(0);
                getDate.setSeconds(tsMorning2);
                let getDay = getDate.getDate();
                let getMonth = 1 + getDate.getMonth();
                let getYear = getDate.getFullYear();
                let inputDateMorning2 = `${getDay}-${getMonth}-${getYear}`;
                let chickenRecordInputMorning2: CreateChickenRecordInput = {
                    chicTime: `${tsMorning2}`,
                    period: 'MORNING',
                    amountDead:
                        Number(amountDead1) +
                        Number(await this.weightedRandom(randomweight)),
                    amountZleg:
                        Number(amountZleg1) +
                        Number(await this.weightedRandom(randomweight)),
                    amountDwaft:
                        Number(amountDwaft1) +
                        Number(await this.weightedRandom(randomweight)),
                    amountSick:
                        Number(amountSick1) +
                        Number(await this.weightedRandom(randomweight)),
                    date: `${inputDateMorning2}`,
                    hid: house,
                };
                await this.dbService.createChickenRecord(
                    chickenRecordInputMorning2,
                );
            }
            let amountDead2 = await this.weightedRandom(randomweight);
            let amountZleg2 = await this.weightedRandom(randomweight);
            let amountDwaft2 = await this.weightedRandom(randomweight);
            let amountSick2 = await this.weightedRandom(randomweight);
            for (let house = 1; house <= 5; house++) {
                amountDead2 = await this.weightedRandom(randomweight);
                amountZleg2 = await this.weightedRandom(randomweight);
                amountDwaft2 = await this.weightedRandom(randomweight);
                amountSick2 = await this.weightedRandom(randomweight);
                let getDate = new Date(0);
                getDate.setSeconds(tsEvening1);
                let getDay = getDate.getDate();
                let getMonth = 1 + getDate.getMonth();
                let getYear = getDate.getFullYear();
                let inputDateEvening1 = `${getDay}-${getMonth}-${getYear}`;
                let chickenRecordInputEvening1: CreateChickenRecordInput = {
                    chicTime: `${tsEvening1}`,
                    period: 'EVENING',
                    amountDead: amountDead2,
                    amountZleg: amountZleg2,
                    amountDwaft: amountDwaft2,
                    amountSick: amountSick2,
                    date: `${inputDateEvening1}`,
                    hid: house,
                };
                await this.dbService.createChickenRecord(
                    chickenRecordInputEvening1,
                );
            }

            for (let house = 1; house <= 5; house++) {
                let getDate = new Date(0);
                getDate.setSeconds(tsEvening2);
                let getDay = getDate.getDate();
                let getMonth = 1 + getDate.getMonth();
                let getYear = getDate.getFullYear();
                let inputDateEvening2 = `${getDay}-${getMonth}-${getYear}`;
                let chickenRecordInputEvening2: CreateChickenRecordInput = {
                    chicTime: `${tsEvening2}`,
                    period: 'EVENING',
                    amountDead:
                        Number(amountDead2) +
                        Number(await this.weightedRandom(randomweight)),
                    amountZleg:
                        Number(amountZleg2) +
                        Number(await this.weightedRandom(randomweight)),
                    amountDwaft:
                        Number(amountDwaft2) +
                        Number(await this.weightedRandom(randomweight)),
                    amountSick:
                        Number(amountSick2) +
                        Number(await this.weightedRandom(randomweight)),
                    date: `${inputDateEvening2}`,
                    hid: house,
                };
                await this.dbService.createChickenRecord(
                    chickenRecordInputEvening2,
                );
            }
            tsMorning1 = tsMorning1 + 60 * 60 * 24;
            tsMorning2 = tsMorning2 + 60 * 60 * 24;
            tsEvening1 = tsEvening1 + 60 * 60 * 24;
            tsEvening2 = tsEvening2 + 60 * 60 * 24;
        }
        ////////////////////////////////////////////////////////
        let ts = 1587352200;
        for (let t = 1; t <= 114; t++) {
            for (let house = 1; house <= 5; house++) {
                let getDate = new Date(0);
                getDate.setSeconds(ts);
                let getDay = getDate.getDate();
                let getMonth = 1 + getDate.getMonth();
                let getYear = getDate.getFullYear();
                let inputDate = `${getDay}-${getMonth}-${getYear}`;

                let dailyDataRecordInput: CreateDailyDataRecordInput = {
                    timestamp: `${ts}`,
                    date: `${inputDate}`,
                    hid: house,
                };
                // console.log(dailyDataRecordInput);
                await this.dbService.createDailyDataRecord(
                    dailyDataRecordInput,
                );
            }
            ts = ts + 60 * 60 * 2;
        }

        //create Food Record Input one times per day
        ts = 1587352200 + 60 * 60 * 6;
        for (let t = 1; t <= 10; t++) {
            for (let house = 1; house <= 5; house++) {
                for (let silo = 1; silo <= 2; silo++) {
                    let getDate = new Date(0);
                    getDate.setSeconds(ts);
                    let getDay = getDate.getDate();
                    let getMonth = 1 + getDate.getMonth();
                    let getYear = getDate.getFullYear();
                    let inputDate = `${getDay}-${getMonth}-${getYear}`;

                    let foodRecordInput: CreateFoodRecordInput = {
                        foodSilo: silo,
                        foodIn: 8000 + Math.floor(Math.random() * 2000),
                        foodRemain: 6000 + Math.floor(Math.random() * 2000),
                        foodConsumed: 1000 + Math.floor(Math.random() * 1000),
                        timestamp: `${ts}`,
                        date: `${inputDate}`,
                        hid: house,
                    };
                    // console.log(foodRecordInput);
                    await this.dbService.createFoodRecord(foodRecordInput);
                }
            }
            ts = ts + 60 * 60 * 24;
        }

        //create Medicine Record Only one times
        ts = 1587352200 + 60 * 60 * 6;
        for (let t = 1; t <= 9; t++) {
            for (let house = 1; house <= 5; house++) {
                let getDate = new Date(0);
                getDate.setSeconds(ts);
                let getDay = getDate.getDate();
                let getMonth = 1 + getDate.getMonth();
                let getYear = getDate.getFullYear();
                let inputDate = `${getDay}-${getMonth}-${getYear}`;

                let medicineRecordInput: CreateMedicineRecordInput = {
                    medicineType: 'NDIB',
                    medicineConc: 40000,
                    timestamp: `${ts}`,
                    date: `${inputDate}`,
                    hid: house,
                };
                await this.dbService.createMedicineRecord(medicineRecordInput);
            }
            ts += 60 * 60 * 24;
        }
        // create Water Record one times per day
        ts = 1587352200 + 60 * 60 * 8;
        let meter1 = 2508392;
        let meter2 = 2530116;
        let waterconsume = 663;
        for (let t = 1; t <= 9; t++) {
            for (let house = 1; house <= 5; house++) {
                let getDate = new Date(0);
                getDate.setSeconds(ts);
                let getDay = getDate.getDate();
                let getMonth = 1 + getDate.getMonth();
                let getYear = getDate.getFullYear();
                let inputDate = `${getDay}-${getMonth}-${getYear}`;

                let waterRecordInput: CreateWaterRecordInput = {
                    waterMeter1: meter1,
                    waterMeter2: meter2,
                    waterConsumed: waterconsume,
                    timestamp: `${ts}`,
                    date: `${inputDate}`,
                    hid: house,
                };
                await this.dbService.createWaterRecord(waterRecordInput);
            }
            meter1 = meter1 + Math.floor(Math.random() * 100);
            meter2 = 2530116 + Math.floor(Math.random() * 1000);
            waterconsume = 500 + Math.floor(Math.random() * 200);
            ts = ts + 60 * 60 * 24;
        }
        //create Sensor
        uniqueID = 1;
        for (let house = 1; house <= 5; house++) {
            for (let i = 1; i <= 2; i++) {
                for (let j = 1; j <= 3; j++) {
                    let sensorInput: CreateSensorInput = {
                        sid: `${uniqueID}`,
                        hid: house,
                        xPosSen: i,
                        yPosSen: j,
                    };
                    await this.dbService.createSensor(sensorInput);
                    uniqueID++;
                }
            }
        }
        //create Environment Data
        ts = 1587352200;
        for (let t = 1; t <= 38; t++) {
            uniqueID = 1;
            for (let house = 1; house <= 5; house++) {
                for (let no = 1; no <= 2 * 3; no++) {
                    let environmentInput: CreateEnvDataInput = {
                        timestamp: `${ts}`,
                        windspeed: this.weightedCenterRandom(1.6, 1.4, 5),
                        ammonia: this.weightedCenterRandom(30, 0, 3),
                        temperature: this.weightedCenterRandom(35, 20, 5),
                        humidity: this.weightedCenterRandom(80, 50, 2),
                        sid: `${uniqueID}`,
                    };
                    await this.dbService.createEnvData(environmentInput);
                    uniqueID++;
                }
            }
            ts = ts + 60 * 60 * 6;
        }
        //create Image
        ts = 1587352200;
        for (let t = 1; t <= 20; t++) {
            uniqueID = 1;
            for (let house = 1; house <= 2; house++) {
                for (let i = 1; i <= 14; i++) {
                    for (let j = 1; j <= 24; j++) {
                        let amountDead = 0;
                        let url = `https://i.imgur.com/0jQOC0U.jpg`;
                        if (i == 3 && j == 4) {
                            amountDead = 1;
                            url = `https://kookkook.s3-ap-southeast-1.amazonaws.com/chicken_img/46.png`;
                        }
                        if (i == 9 && j == 15) {
                            amountDead = 4;
                            url = `https://kookkook.s3-ap-southeast-1.amazonaws.com/chicken_img/49.png`;
                        }
                        if (i == 12 && j == 21) {
                            amountDead = 2;
                            url = `https://kookkook.s3-ap-southeast-1.amazonaws.com/chicken_img/18.png`;
                        }
                        let imageInput: CreateCamImgInput = {
                            timestamp: `${ts}`,
                            url: url,
                            amountDead: amountDead,
                            cid: `${uniqueID}`,
                        };
                        await this.dbService.createImage(imageInput);
                        uniqueID++;
                    }
                }
            }
            ts = ts + 60 * 60 * 2;
        }
        // create Collected Dead Chicken Time
        ts = 1587352200;
        for (let t = 1; t <= 2; t++) {
            uniqueID = 1;
            for (let house = 1; house <= 2; house++) {
                for (let i = 1; i <= 14; i++) {
                    for (let j = 1; j <= 24; j++) {
                        await this.dbService.createCollectedDeadChickenTime(
                            `${ts}`,
                            `${uniqueID}`,
                        );
                        uniqueID++;
                    }
                }
            }
            ts = ts + 60 * 60 * 6;
        }
    };

    seedSampleDataOld = async () => {
        for (let i = 1; i <= 5; i++) {
            await this.dbService.createHouse(i, 10, 10, 10);
        }

        let ownerDataInput: CreateUserInput = {
            username: `owner`,
            hashedPwd:
                '$2b$04$vpJ4H0yfvyN68IsbAS4e2eQ3A/wPJvK2bWqpq6CDhhHX9Y63IhHyG',
            isCurrentUser: true,
            firstName: `Nakornthip`,
            lastName: `Prompoon`,
            lineID: `lineowner`,
            role: Role.OWNER,
            imageUrl: `https://kookkook.s3-ap-southeast-1.amazonaws.com/profile/0.jpg`,
            hid: null,
        };
        await this.dbService.createUser(ownerDataInput);

        // let userDataInput: CreateUserInput = {
        //     username: `worker`,
        //     hashedPwd:
        //         '$2b$04$C4GP5tj3zJCpgOHOBHmbfe1ahTVhvhfch6uwJ1Gv7vSUE3nJfJuyS',
        //     isCurrentUser: true,
        //     firstName: `firstname`,
        //     lastName: `lastname`,
        //     lineID: `lineid`,
        //     role: Role.WORKER,
        //     imageUrl: `https://i.imgur.com/asFo8tE.jpg`,
        //     hid: 1,
        // };
        // await this.dbService.createUser(userDataInput);
        let firstname = [
            '',
            'Napatee',
            'Anapat',
            'Theerat',
            'Natakorn Ammy',
            'Panas',
            'Pachara',
            'Puvit',
            'Onninan',
            'Prin',
            'Ranchida',
        ];
        let lastname = [
            '',
            'Yaibuates',
            'Jiamwijitkul',
            'Tassanai',
            'Kam',
            'Rattanasuwan',
            'Pattarabodee',
            'Pracharktam',
            'Lewthanawinit',
            'Siripattanakul',
            'Nanagara',
        ];
        let userCount = 1;
        for (let i = 1; i <= 5; i++) {
            for (let j = 1; j <= 2; j++) {
                let userDataInput: CreateUserInput = {
                    username: `worker${i}${j}`,
                    hashedPwd:
                        '$2b$04$C4GP5tj3zJCpgOHOBHmbfe1ahTVhvhfch6uwJ1Gv7vSUE3nJfJuyS',
                    isCurrentUser: true,
                    firstName: firstname[userCount],
                    lastName: lastname[userCount],
                    lineID: `lineid${i}${j}`,
                    role: Role.WORKER,
                    imageUrl: `https://kookkook.s3-ap-southeast-1.amazonaws.com/profile/${userCount}.png`,
                    hid: i,
                };
                await this.dbService.createUser(userDataInput);
                userCount++;
            }
        }

        for (let num = 0; num <= 9; num++) {
            for (let house = 1; house <= 5; house++) {
                await this.dbService.createDailyRecord(
                    `1${num}-04-2020`,
                    house,
                );
            }
        }

        let randomGender = ['MALE', 'FEMALE'];
        for (let i = 1; i <= 5; i++) {
            let randomPostionInlist = Math.floor(
                Math.random() * randomGender.length,
            );
            let chickenInput: CreateChickenFlockInput = {
                generation: '2020/1',
                dateIn: '10-04-2020',
                dateOut: '15-05-2020',
                type: 'Sally',
                amountIn: 40000,
                gender: randomGender[randomPostionInlist],
                hid: i,
            };
            await this.dbService.createChickenFlock(chickenInput);
        }
        let uniqueID = 1;
        for (let house = 1; house <= 5; house++) {
            let no = 1;
            for (let i = 1; i <= 14; i++) {
                for (let j = 1; j <= 24; j++) {
                    const cameraInput: CreateCameraInput = {
                        cid: `${uniqueID}`,
                        cno: no,
                        hid: house,
                        xPosCam: i,
                        yPosCam: j,
                    };
                    await this.dbService.createCamera(cameraInput);
                    no++;
                    uniqueID++;
                }
            }
        }
        //CREATE ChickenRecord SAMPLE
        let tsMorning1 = 1586487000 + 60 * 60 * 6;
        let tsMorning2 = 1586494200 + 60 * 60 * 8;
        let tsEvening1 = 1586520600 + 60 * 60 * 4;
        let tsEvening2 = 1586527800 + 60 * 60 * 6;
        let randomweight = { 0: 0.8, 1: 0.05, 2: 0.05, 3: 0.05, 4: 0.05 };
        for (let day = 1; day <= 9; day++) {
            let amountDead1 = await this.weightedRandom(randomweight);
            let amountZleg1 = await this.weightedRandom(randomweight);
            let amountDwaft1 = await this.weightedRandom(randomweight);
            let amountSick1 = await this.weightedRandom(randomweight);
            for (let house = 1; house <= 5; house++) {
                amountDead1 = await this.weightedRandom(randomweight);
                amountZleg1 = await this.weightedRandom(randomweight);
                amountDwaft1 = await this.weightedRandom(randomweight);
                amountSick1 = await this.weightedRandom(randomweight);
                let getDate = new Date(0);
                getDate.setSeconds(tsMorning1);
                let getDay = getDate.getDate();
                let getMonth = 1 + getDate.getMonth();
                let getYear = getDate.getFullYear();
                let inputDateMorning1 = `${getDay}-${getMonth}-${getYear}`;
                let chickenRecordInputMorning1: CreateChickenRecordInput = {
                    chicTime: `${tsMorning1}`,
                    period: 'MORNING',
                    amountDead: amountDead1,
                    amountZleg: amountZleg1,
                    amountDwaft: amountDwaft1,
                    amountSick: amountSick1,
                    date: inputDateMorning1,
                    hid: house,
                };
                await this.dbService.createChickenRecord(
                    chickenRecordInputMorning1,
                );
            }
            for (let house = 1; house <= 5; house++) {
                let getDate = new Date(0);
                getDate.setSeconds(tsMorning2);
                let getDay = getDate.getDate();
                let getMonth = 1 + getDate.getMonth();
                let getYear = getDate.getFullYear();
                let inputDateMorning2 = `${getDay}-${getMonth}-${getYear}`;
                let chickenRecordInputMorning2: CreateChickenRecordInput = {
                    chicTime: `${tsMorning2}`,
                    period: 'MORNING',
                    amountDead:
                        Number(amountDead1) +
                        Number(await this.weightedRandom(randomweight)),
                    amountZleg:
                        Number(amountZleg1) +
                        Number(await this.weightedRandom(randomweight)),
                    amountDwaft:
                        Number(amountDwaft1) +
                        Number(await this.weightedRandom(randomweight)),
                    amountSick:
                        Number(amountSick1) +
                        Number(await this.weightedRandom(randomweight)),
                    date: `${inputDateMorning2}`,
                    hid: house,
                };
                await this.dbService.createChickenRecord(
                    chickenRecordInputMorning2,
                );
            }
            let amountDead2 = await this.weightedRandom(randomweight);
            let amountZleg2 = await this.weightedRandom(randomweight);
            let amountDwaft2 = await this.weightedRandom(randomweight);
            let amountSick2 = await this.weightedRandom(randomweight);
            for (let house = 1; house <= 5; house++) {
                amountDead2 = await this.weightedRandom(randomweight);
                amountZleg2 = await this.weightedRandom(randomweight);
                amountDwaft2 = await this.weightedRandom(randomweight);
                amountSick2 = await this.weightedRandom(randomweight);
                let getDate = new Date(0);
                getDate.setSeconds(tsEvening1);
                let getDay = getDate.getDate();
                let getMonth = 1 + getDate.getMonth();
                let getYear = getDate.getFullYear();
                let inputDateEvening1 = `${getDay}-${getMonth}-${getYear}`;
                let chickenRecordInputEvening1: CreateChickenRecordInput = {
                    chicTime: `${tsEvening1}`,
                    period: 'EVENING',
                    amountDead: amountDead2,
                    amountZleg: amountZleg2,
                    amountDwaft: amountDwaft2,
                    amountSick: amountSick2,
                    date: `${inputDateEvening1}`,
                    hid: house,
                };
                await this.dbService.createChickenRecord(
                    chickenRecordInputEvening1,
                );
            }

            for (let house = 1; house <= 5; house++) {
                let getDate = new Date(0);
                getDate.setSeconds(tsEvening2);
                let getDay = getDate.getDate();
                let getMonth = 1 + getDate.getMonth();
                let getYear = getDate.getFullYear();
                let inputDateEvening2 = `${getDay}-${getMonth}-${getYear}`;
                let chickenRecordInputEvening2: CreateChickenRecordInput = {
                    chicTime: `${tsEvening2}`,
                    period: 'EVENING',
                    amountDead:
                        Number(amountDead2) +
                        Number(await this.weightedRandom(randomweight)),
                    amountZleg:
                        Number(amountZleg2) +
                        Number(await this.weightedRandom(randomweight)),
                    amountDwaft:
                        Number(amountDwaft2) +
                        Number(await this.weightedRandom(randomweight)),
                    amountSick:
                        Number(amountSick2) +
                        Number(await this.weightedRandom(randomweight)),
                    date: `${inputDateEvening2}`,
                    hid: house,
                };
                await this.dbService.createChickenRecord(
                    chickenRecordInputEvening2,
                );
            }
            tsMorning1 = tsMorning1 + 60 * 60 * 24;
            tsMorning2 = tsMorning2 + 60 * 60 * 24;
            tsEvening1 = tsEvening1 + 60 * 60 * 24;
            tsEvening2 = tsEvening2 + 60 * 60 * 24;
        }
        ////////////////////////////////////////////////////////
        let ts = 1586488200;
        for (let t = 1; t <= 114; t++) {
            for (let house = 1; house <= 5; house++) {
                let getDate = new Date(0);
                getDate.setSeconds(ts);
                let getDay = getDate.getDate();
                let getMonth = 1 + getDate.getMonth();
                let getYear = getDate.getFullYear();
                let inputDate = `${getDay}-${getMonth}-${getYear}`;

                let dailyDataRecordInput: CreateDailyDataRecordInput = {
                    timestamp: `${ts}`,
                    date: `${inputDate}`,
                    hid: house,
                };
                // console.log(dailyDataRecordInput);
                await this.dbService.createDailyDataRecord(
                    dailyDataRecordInput,
                );
            }
            ts = ts + 60 * 60 * 2;
        }

        //create Food Record Input one times per day
        ts = 1586488200 + 60 * 60 * 6;
        for (let t = 1; t <= 8; t++) {
            for (let house = 1; house <= 5; house++) {
                for (let silo = 1; silo <= 2; silo++) {
                    let getDate = new Date(0);
                    getDate.setSeconds(ts);
                    let getDay = getDate.getDate();
                    let getMonth = 1 + getDate.getMonth();
                    let getYear = getDate.getFullYear();
                    let inputDate = `${getDay}-${getMonth}-${getYear}`;

                    let foodRecordInput: CreateFoodRecordInput = {
                        foodSilo: silo,
                        foodIn: 8000 + Math.floor(Math.random() * 2000),
                        foodRemain: 6000 + Math.floor(Math.random() * 2000),
                        foodConsumed: 1000 + Math.floor(Math.random() * 1000),
                        timestamp: `${ts}`,
                        date: `${inputDate}`,
                        hid: house,
                    };
                    // console.log(foodRecordInput);
                    await this.dbService.createFoodRecord(foodRecordInput);
                }
            }
            ts = ts + 60 * 60 * 24;
        }

        //create Medicine Record Only one times
        ts = 1586488200 + 60 * 60 * 6;
        for (let t = 1; t <= 9; t++) {
            for (let house = 1; house <= 5; house++) {
                let getDate = new Date(0);
                getDate.setSeconds(ts);
                let getDay = getDate.getDate();
                let getMonth = 1 + getDate.getMonth();
                let getYear = getDate.getFullYear();
                let inputDate = `${getDay}-${getMonth}-${getYear}`;

                let medicineRecordInput: CreateMedicineRecordInput = {
                    medicineType: 'NDIB',
                    medicineConc: 40000,
                    timestamp: `${ts}`,
                    date: `${inputDate}`,
                    hid: house,
                };
                await this.dbService.createMedicineRecord(medicineRecordInput);
            }
            ts += 60 * 60 * 24;
        }
        // create Water Record one times per day
        ts = 1586488200 + 60 * 60 * 8;
        let meter1 = 2508392;
        let meter2 = 2530116;
        let waterconsume = 663;
        for (let t = 1; t <= 9; t++) {
            for (let house = 1; house <= 5; house++) {
                let getDate = new Date(0);
                getDate.setSeconds(ts);
                let getDay = getDate.getDate();
                let getMonth = 1 + getDate.getMonth();
                let getYear = getDate.getFullYear();
                let inputDate = `${getDay}-${getMonth}-${getYear}`;

                let waterRecordInput: CreateWaterRecordInput = {
                    waterMeter1: meter1,
                    waterMeter2: meter2,
                    waterConsumed: waterconsume,
                    timestamp: `${ts}`,
                    date: `${inputDate}`,
                    hid: house,
                };
                await this.dbService.createWaterRecord(waterRecordInput);
            }
            meter1 = meter1 + Math.floor(Math.random() * 100);
            meter2 = 2530116 + Math.floor(Math.random() * 1000);
            waterconsume = 500 + Math.floor(Math.random() * 200);
            ts = ts + 60 * 60 * 24;
        }
        //create Sensor
        uniqueID = 1;
        for (let house = 1; house <= 5; house++) {
            for (let i = 1; i <= 2; i++) {
                for (let j = 1; j <= 3; j++) {
                    let sensorInput: CreateSensorInput = {
                        sid: `${uniqueID}`,
                        hid: house,
                        xPosSen: i,
                        yPosSen: j,
                    };
                    await this.dbService.createSensor(sensorInput);
                    uniqueID++;
                }
            }
        }
        //create Environment Data
        ts = 1586488200;
        for (let t = 1; t <= 38; t++) {
            uniqueID = 1;
            for (let house = 1; house <= 5; house++) {
                for (let no = 1; no <= 2 * 3; no++) {
                    let environmentInput: CreateEnvDataInput = {
                        timestamp: `${ts}`,
                        windspeed: this.weightedCenterRandom(1.6, 1.4, 5),
                        ammonia: this.weightedCenterRandom(30, 0, 3),
                        temperature: this.weightedCenterRandom(35, 20, 5),
                        humidity: this.weightedCenterRandom(80, 50, 2),
                        sid: `${uniqueID}`,
                    };
                    await this.dbService.createEnvData(environmentInput);
                    uniqueID++;
                }
            }
            ts = ts + 60 * 60 * 6;
        }
        //create Image
        ts = 1586488200;
        for (let t = 1; t <= 20; t++) {
            uniqueID = 1;
            for (let house = 1; house <= 2; house++) {
                for (let i = 1; i <= 14; i++) {
                    for (let j = 1; j <= 24; j++) {
                        let amountDead = 0;
                        let url = `https://i.imgur.com/0jQOC0U.jpg`;
                        if (i == 3 && j == 4) {
                            amountDead = 1;
                            url = `https://kookkook.s3-ap-southeast-1.amazonaws.com/chicken_img/46.png`;
                        }
                        if (i == 9 && j == 15) {
                            amountDead = 4;
                            url = `https://kookkook.s3-ap-southeast-1.amazonaws.com/chicken_img/49.png`;
                        }
                        if (i == 12 && j == 21) {
                            amountDead = 2;
                            url = `https://kookkook.s3-ap-southeast-1.amazonaws.com/chicken_img/18.png`;
                        }
                        let imageInput: CreateCamImgInput = {
                            timestamp: `${ts}`,
                            url: url,
                            amountDead: amountDead,
                            cid: `${uniqueID}`,
                        };
                        await this.dbService.createImage(imageInput);
                        uniqueID++;
                    }
                }
            }
            ts = ts + 60 * 60 * 2;
        }
        // create Collected Dead Chicken Time
        ts = 1586488200;
        for (let t = 1; t <= 2; t++) {
            uniqueID = 1;
            for (let house = 1; house <= 2; house++) {
                for (let i = 1; i <= 14; i++) {
                    for (let j = 1; j <= 24; j++) {
                        await this.dbService.createCollectedDeadChickenTime(
                            `${ts}`,
                            `${uniqueID}`,
                        );
                        uniqueID++;
                    }
                }
            }
            ts = ts + 60 * 60 * 6;
        }
    };

    convertTStoDate = async ts => {
        let getDate = new Date(0);
        getDate.setSeconds(ts);
        let getDay = getDate.getDate();
        let getMonth = 1 + getDate.getMonth();
        let getYear = getDate.getFullYear();
        let inputDate = `${getDay}-${getMonth}-${getYear}`;
        return inputDate;
    };
    weightedRandom = async prob => {
        let i,
            sum = 0,
            r = Math.random();
        for (i in prob) {
            sum += prob[i];
            if (r <= sum) return i;
        }
    };
    weightedCenterRandom = (max, min, numDice) => {
        var num = min;
        for (var i = 0; i < numDice; i++) {
            num += Math.random() * ((max - min) / numDice);
        }
        return num.toFixed(2);
    };
}
