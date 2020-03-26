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
                "role" VARCHAR(50), \
                "imgUrl" VARCHAR, \
                "hid" INT, \
                PRIMARY KEY (uid)',
            ),
        );

        query_list.push(
            createTable(
                'Chicken',
                '"dateIn" DATE, \
                "dateOut" DATE, \
                "generation" VARCHAR(50), \
                "type" VARCHAR(20), \
                "amountIn" INT, \
                "gender" VARCHAR(1), \
                "hid" INT NOT NULL, \
                PRIMARY KEY ("dateIn", "hid")',
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
                'VacRecord',
                '"vacType" VARCHAR(50), \
                "vacConc" DOUBLE PRECISION, \
                "timestamp" TIMESTAMP, \
                "date" DATE, \
                "hid" INT NOT NULL, \
                PRIMARY KEY ("vacType", "timestamp", "date", "hid")',
            ),
        );

        query_list.push(
            createTable(
                'Camera',
                '"cid" INT, \
                "xPosCam" INT, \
                "yPosCam" INT, \
                "hid" INT NOT NULL, \
                PRIMARY KEY (cid, hid)',
            ),
        );

        query_list.push(
            createTable(
                'Image',
                '"timestamp" TIMESTAMP, \
                "url" VARCHAR, \
                "cid" INT NOT NULL, \
                "hid" INT NOT NULL, \
                PRIMARY KEY (timestamp, cid, hid)',
            ),
        );

        query_list.push(
            createTable(
                'Sensor',
                '"sid" INT, \
                "xPosSen" INT, \
                "yPosSen" INT, \
                "hid" INT NOT NULL, \
                PRIMARY KEY (sid, hid)',
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
                "sid" INT NOT NULL, \
                "hid" INT NOT NULL, \
                PRIMARY KEY (timestamp, sid, hid)',
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
                'VacRecord',
                'timestamp, date, hid',
                'DailyDataRecord',
                'timestamp, date, hid',
                'ts_date_hid_constraint',
            ),
        );
        query_list.push(
            addMultiConstraint(
                'Camera',
                'hid',
                'House',
                'hid',
                'hid_constraint',
            ),
        );
        query_list.push(
            addMultiConstraint(
                'Image',
                'cid, hid',
                'Camera',
                'cid, hid',
                'cid_hid_constraint',
            ),
        );
        query_list.push(
            addConstraint('Sensor', 'hid', 'House', 'hid', 'hid_constraint'),
        );
        query_list.push(
            addMultiConstraint(
                'Environment',
                'sid, hid',
                'Sensor',
                'sid, hid',
                'sid_hid_constraint',
            ),
        );
        await poolQuery(this.pool, query_list.join(''));
    };

    seedSampleData = async () => {
        await this.dbService.createHouse(1, 10, 10, 10);
        await this.dbService.createHouse(2, 10, 10, 10);
        let UserDataInput: CreateUserInput = {
            username: 'username1',
            hashedPwd:
                '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4',
            isCurrentUser: 1,
            firstName: 'worker1',
            lastName: 'lastname1',
            role: 'worker',
            imgUrl: 'http://www.kk.com/img/1',
            hid: 1,
        };
        let UserDataInput2: CreateUserInput = {
            username: 'username2',
            hashedPwd:
                '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4',
            isCurrentUser: 1,
            firstName: 'worker2',
            lastName: 'lastname2',
            role: 'worker',
            imgUrl: 'http://www.kk.com/img/2',
            hid: 2,
        };
        await this.dbService.createUser(UserDataInput);
        await this.dbService.createUser(UserDataInput2);
        await this.dbService.createDailyRecord('12-03-2020', 1);
        await this.dbService.createDailyRecord('12-03-2020', 2);
        await this.dbService.createDailyRecord('13-03-2020', 1);
        await this.dbService.createDailyRecord('13-03-2020', 2);
        let chickenInput: CreateChickenFlockInput = {
            dateIn: '12-03-2020',
            dateOut: '12-04-2020',
            generation: '1/2020',
            type: 'Sally',
            amountIn: 40000,
            gender: 'm',
            hid: 1,
        };
        let chickenInput2: CreateChickenFlockInput = {
            dateIn: '12-03-2020',
            dateOut: '12-04-2020',
            generation: '1/2020',
            type: 'Sally',
            amountIn: 40000,
            gender: 'f',
            hid: 2,
        };
        const sensor1: CreateSensorInput = {
            sid: 1,
            hid: 1,
            xPosSen: 10,
            yPosSen: 20,
        };
        const camera1: CreateCameraInput = {
            cid: 1,
            hid: 1,
            xPosCam: 10,
            yPosCam: 20,
        };
        const sensor2: CreateSensorInput = {
            sid: 2,
            hid: 1,
            xPosSen: 20,
            yPosSen: 40,
        };
        const camera2: CreateCameraInput = {
            cid: 2,
            hid: 1,
            xPosCam: 20,
            yPosCam: 40,
        };
        const sensor3: CreateSensorInput = {
            sid: 3,
            hid: 2,
            xPosSen: 10,
            yPosSen: 20,
        };
        const camera3: CreateCameraInput = {
            cid: 3,
            hid: 2,
            xPosCam: 10,
            yPosCam: 20,
        };
        const sensor4: CreateSensorInput = {
            sid: 4,
            hid: 2,
            xPosSen: 20,
            yPosSen: 40,
        };
        const camera4: CreateCameraInput = {
            cid: 4,
            hid: 2,
            xPosCam: 20,
            yPosCam: 40,
        };
        await this.dbService.createChickenFlock(chickenInput);
        await this.dbService.createChickenFlock(chickenInput2);
        await this.dbService.createSensor(sensor1);
        await this.dbService.createSensor(sensor2);
        await this.dbService.createSensor(sensor3);
        await this.dbService.createSensor(sensor4);
        await this.dbService.createCamera(camera1);
        await this.dbService.createCamera(camera2);
        await this.dbService.createCamera(camera3);
        await this.dbService.createCamera(camera4);
        let chickenRecordInput: CreateChickenRecordInput = {
            chicTime: '1584011015',
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

        let vacRecordInput: CreateVacRecordInput = {
            vacType: 'NDIB',
            vacConc: 35000,
            timestamp: '1584018805',
            date: '12-03-2020',
            hid: 1,
        };
        await this.dbService.createVacRecord(vacRecordInput);

        let vacRecordInput2: CreateVacRecordInput = {
            vacType: 'NDIB',
            vacConc: 40000,
            timestamp: '1584018905',
            date: '12-03-2020',
            hid: 2,
        };
        await this.dbService.createVacRecord(vacRecordInput2);

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
            sid: 1,
            hid: 1,
        };
        await this.dbService.createEnvData(environmentInput);

        let environmentInput2: CreateEnvDataInput = {
            timestamp: '1584011605',
            windspeed: 123,
            ammonia: 24,
            temperature: 28.8,
            humidity: 48.5,
            sid: 2,
            hid: 1,
        };
        await this.dbService.createEnvData(environmentInput2);

        let environmentInput3: CreateEnvDataInput = {
            timestamp: '1584090805',
            windspeed: 143,
            ammonia: 22,
            temperature: 26.4,
            humidity: 40.5,
            sid: 3,
            hid: 2,
        };
        await this.dbService.createEnvData(environmentInput3);

        let environmentInput4: CreateEnvDataInput = {
            timestamp: '1584090805',
            windspeed: 139,
            ammonia: 20,
            temperature: 27.4,
            humidity: 41.5,
            sid: 4,
            hid: 2,
        };
        await this.dbService.createEnvData(environmentInput4);
        let imageInput: CreateCamImgInput = {
            timestamp: '1584011605',
            url: 'http://www.kookkook.com/img/1_1',
            cid: 1,
            hid: 1,
        };

        await this.dbService.createImage(imageInput);
        let imageInput2: CreateCamImgInput = {
            timestamp: '1584011605',
            url: 'http://www.kookkook.com/img/1_2',
            cid: 2,
            hid: 1,
        };
        await this.dbService.createImage(imageInput2);

        let imageInput3: CreateCamImgInput = {
            timestamp: '1584090805',
            url: 'http://www.kookkook.com/img/2_3',
            cid: 3,
            hid: 2,
        };
        await this.dbService.createImage(imageInput3);

        let imageInput4: CreateCamImgInput = {
            timestamp: '1584090805',
            url: 'http://www.kookkook.com/img/2_4',
            cid: 4,
            hid: 2,
        };
        await this.dbService.createImage(imageInput4);
    };

    dropAllTable = async () => {
        var query_list = [];
        query_list.push(dropTable('ChickenRecord'));
        query_list.push(dropTable('Environment'));
        query_list.push(dropTable('FoodRecord'));
        query_list.push(dropTable('Image'));
        query_list.push(dropTable('VacRecord'));
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
}
