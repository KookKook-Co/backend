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
    addMultiConstraint,
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
            process.env.DB_URI || this.configService.get<string>('DB_URI'),
    });

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
                "username" VARCHAR(50), \
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
            imageUrl: 'http://www.kk.com/img/1',
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
            imageUrl: 'http://www.kk.com/img/2',
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
                url: `http://www.kookkook.com/img/${i}`,
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
        query_list.push(dropTable('House'));
        query_list.push(dropTable('User'));
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
            imageUrl: `http://www.kk.com/img/0`,
            hid: 1,
        };
        await this.dbService.createUser(ownerDataInput);

        for (let i = 1; i <= 5; i++) {
            for (let j = 1; j <= 2; j++) {
                let userDataInput: CreateUserInput = {
                    username: `worker${i}${j}`,
                    hashedPwd:
                        '$2b$04$vpJ4H0yfvyN68IsbAS4e2eQ3A/wPJvK2bWqpq6CDhhHX9Y63IhHyG',
                    isCurrentUser: true,
                    firstName: `firstname${i}${j}`,
                    lastName: `lastname${i}${j}`,
                    lineID: `lineid${i}${j}`,
                    role: Role.WORKER,
                    imageUrl: `http://www.kk.com/img/hid=${i}/${j}`,
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

        let randomGender = ['MALE', 'FEMEALE'];
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
        for (let house = 1; house <= 5; house++) {
            let chickenRecordInputMorning1: CreateChickenRecordInput = {
                chicTime: '1583895000',
                period: 'MORNING',
                amountDead: Math.floor(Math.random() * 5),
                amountZleg: Math.floor(Math.random() * 5),
                amountDwaft: Math.floor(Math.random() * 5),
                amountSick: Math.floor(Math.random() * 5),
                date: `11-03-2020`,
                hid: house,
            };
            await this.dbService.createChickenRecord(
                chickenRecordInputMorning1,
            );
        }
        for (let house = 1; house <= 5; house++) {
            let chickenRecordInputMorning2: CreateChickenRecordInput = {
                chicTime: '1583902200',
                period: 'MORNING',
                amountDead: Math.floor(Math.random() * 10 + 5),
                amountZleg: Math.floor(Math.random() * 10 + 5),
                amountDwaft: Math.floor(Math.random() * 10 + 5),
                amountSick: Math.floor(Math.random() * 10 + 5),
                date: `11-03-2020`,
                hid: house,
            };
            await this.dbService.createChickenRecord(
                chickenRecordInputMorning2,
            );
        }

        for (let house = 1; house <= 5; house++) {
            let chickenRecordInputEvening1: CreateChickenRecordInput = {
                chicTime: '1583928600',
                period: 'EVENING',
                amountDead: Math.floor(Math.random() * 10),
                amountZleg: Math.floor(Math.random() * 10),
                amountDwaft: Math.floor(Math.random() * 10),
                amountSick: Math.floor(Math.random() * 10),
                date: `11-03-2020`,
                hid: house,
            };
            await this.dbService.createChickenRecord(
                chickenRecordInputEvening1,
            );
        }

        for (let house = 1; house <= 5; house++) {
            let chickenRecordInputEvening2: CreateChickenRecordInput = {
                chicTime: '1583935800',
                period: 'EVENING',
                amountDead: Math.floor(Math.random() * 10 + 5),
                amountZleg: Math.floor(Math.random() * 10 + 5),
                amountDwaft: Math.floor(Math.random() * 10 + 5),
                amountSick: Math.floor(Math.random() * 10 + 5),
                date: `11-03-2020`,
                hid: house,
            };
            await this.dbService.createChickenRecord(
                chickenRecordInputEvening2,
            );
        }
        ////////////////////////////////////////////////////////
        let ts = 1583895600;
        for (let t = 1; t <= 30; t++) {
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
        ts = 1583895600;
        for (let t = 1; t <= 2; t++) {
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
                        foodIn: 10000,
                        foodRemain: 8000,
                        foodConsumed: 2000,
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

        ts = 1583895600 + 60 * 60 * 8;
        for (let t = 1; t <= 2; t++) {
            for (let house = 1; house <= 5; house++) {
                let getDate = new Date(0);
                getDate.setSeconds(ts);
                let getDay = getDate.getDate();
                let getMonth = 1 + getDate.getMonth();
                let getYear = getDate.getFullYear();
                let inputDate = `${getDay}-${getMonth}-${getYear}`;

                let waterRecordInput: CreateWaterRecordInput = {
                    waterMeter1: 2508392,
                    waterMeter2: 2530116,
                    waterConsumed: 663,
                    timestamp: `${ts}`,
                    date: `${inputDate}`,
                    hid: house,
                };
                await this.dbService.createWaterRecord(waterRecordInput);
            }
            ts = ts + 60 * 60 * 24;
        }

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

        ts = 1583895600;
        for (let t = 1; t <= 30; t++) {
            uniqueID = 1;
            for (let house = 1; house <= 5; house++) {
                for (let no = 1; no <= 2 * 3; no++) {
                    let environmentInput: CreateEnvDataInput = {
                        timestamp: `${ts}`,
                        windspeed: Math.floor(Math.random() * 15 + 110),
                        ammonia: Math.floor(Math.random() * 5 + 20),
                        temperature: Math.floor(Math.random() * 10 + 25),
                        humidity: Math.floor(Math.random() * 20 + 40),
                        sid: `${uniqueID}`,
                    };
                    await this.dbService.createEnvData(environmentInput);
                    uniqueID++;
                }
            }
            ts = ts + 60 * 60 * 2;
        }

        ts = 1583895600;
        for (let t = 1; t <= 2; t++) {
            uniqueID = 1;
            for (let house = 1; house <= 2; house++) {
                for (let i = 1; i <= 13; i++) {
                    for (let j = 1; j <= 24; j++) {
                        let imageInput: CreateCamImgInput = {
                            timestamp: `${ts}`,
                            url: `http://www.kookkook.com/img/${house}_${uniqueID}_${t}`,
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
}
