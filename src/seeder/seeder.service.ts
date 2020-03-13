import {
    addConstraint,
    addMultiConstraint,
    createTable,
    poolQuery,
} from './utils';

import { ConfigService } from '@nestjs/config';
import { DbService } from '../db/db.service';
import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { async } from 'rxjs/internal/scheduler/async';

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
        var query_list = [];
        query_list.push(
            createTable(
                'House',
                '"hid" INT, "length" DOUBLE PRECISION, "width" DOUBLE PRECISION, "scale" DOUBLE PRECISION, PRIMARY KEY (hid)',
            ),
        );

        query_list.push(
            createTable(
                '_User',
                '"uid" SERIAL, \
                "pwd" VARCHAR, \
                "fname" VARCHAR(50), \
                "lname" VARCHAR(50), \
                "position" VARCHAR(50), \
                PRIMARY KEY (uid)',
            ),
        );

        query_list.push(
            createTable(
                'HasUser',
                '"hid" INT, \
                "uid" INT NOT NULL, \
                PRIMARY KEY (hid, uid)',
            ),
        );

        query_list.push(
            createTable(
                'Chicken',
                '"date_in" DATE, \
                "hid" INT NOT NULL, \
                "amount_in" INT, \
                "type" VARCHAR(20), \
                "gender" VARCHAR(1), \
                PRIMARY KEY (date_in, hid)',
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
                'FoodRecord',
                '"food_no" INT, \
                "date" DATE, \
                "hid" INT NOT NULL, \
                "food_in" DOUBLE PRECISION, \
                "food_remain" DOUBLE PRECISION, \
                "food_consume" DOUBLE PRECISION, \
                PRIMARY KEY (food_no, date, hid)',
            ),
        );

        query_list.push(
            createTable(
                'ChickenRecord',
                '"chic_time" TIMESTAMP, \
                "date" DATE, \
                "hid" INT NOT NULL, \
                "death_real" INT, \
                PRIMARY KEY (chic_time, date, hid)',
            ),
        );

        query_list.push(
            createTable(
                'WaterRecord',
                '"meter_1" INT, \
                "meter_2" INT, \
                "date" DATE, \
                "hid" INT NOT NULL, \
                "water_consume" DOUBLE PRECISION, \
                PRIMARY KEY (meter_1, meter_2, date, hid)',
            ),
        );

        query_list.push(
            createTable(
                'VacRecord',
                '"vactime" TIMESTAMP, \
                "date" DATE, \
                "hid" INT NOT NULL, \
                "vac_type" VARCHAR(50), \
                "vac_conc" DOUBLE PRECISION, \
                PRIMARY KEY (vactime, date, hid)',
            ),
        );

        query_list.push(
            createTable(
                'Camera',
                '"cam_no" INT, \
                "hid" INT NOT NULL, \
                "cam_x" INT, \
                "cam_y" INT, \
                PRIMARY KEY (cam_no, hid)',
            ),
        );

        query_list.push(
            createTable(
                'Image',
                '"timestamp" TIMESTAMP, \
                "cam_no" INT NOT NULL, \
                "hid" INT NOT NULL, \
                "url" VARCHAR, \
                "clicked" BOOLEAN, \
                "startdead" BOOLEAN, \
                PRIMARY KEY (timestamp, cam_no, hid)',
            ),
        );

        query_list.push(
            createTable(
                'Sensor',
                '"sen_no" INT, \
                "hid" INT NOT NULL, \
                "sen_x" INT, \
                "sen_y" INT, \
                PRIMARY KEY (sen_no, hid)',
            ),
        );

        query_list.push(
            createTable(
                'Environment',
                '"timestamp" TIMESTAMP, \
                "sen_no" INT NOT NULL, \
                "hid" INT NOT NULL, \
                "windspeed" DOUBLE PRECISION, \
                "humid" DOUBLE PRECISION, \
                "temp" DOUBLE PRECISION, \
                "ammonia" DOUBLE PRECISION, \
                PRIMARY KEY (timestamp, sen_no, hid)',
            ),
        );

        query_list.push(
            addConstraint('HasUser', 'uid', '_User', 'uid', 'uid_constraint'),
        );
        query_list.push(
            addConstraint('HasUser', 'hid', 'House', 'hid', 'hid_constraint'),
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
                'FoodRecord',
                'date, hid',
                'DailyRecord',
                'date, hid',
                'date_hid_constraint',
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
                'date, hid',
                'DailyRecord',
                'date, hid',
                'date_hid_constraint',
            ),
        );
        query_list.push(
            addMultiConstraint(
                'VacRecord',
                'date, hid',
                'DailyRecord',
                'date, hid',
                'date_hid_constraint',
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
                'cam_no, hid',
                'Camera',
                'cam_no, hid',
                'camno_hid_constraint',
            ),
        );
        query_list.push(
            addConstraint('Sensor', 'hid', 'House', 'hid', 'hid_constraint'),
        );
        query_list.push(
            addMultiConstraint(
                'Environment',
                'sen_no, hid',
                'Sensor',
                'sen_no, hid',
                'senno_hid_constraint',
            ),
        );

        // console.log(query_list.join(''));
        await poolQuery(this.pool, query_list.join(''));
    };

    seedAddSampleData = async () => {
    
        await this.dbService.createHouse(1, 10, 10, 10);
        // await temp;
        await this.dbService.createHouse(2, 10, 10, 10);
        // await temp;
        await this.dbService.createUser(
            'worker1',
            'kookkook',
            '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4',
            'worker',
        );
        // await temp;
        await this.dbService.createUser(
            'worker2',
            'kookkook',
            '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4',
            'worker',
        );
        // await temp;
        await this.dbService.createResponsibleWithID(1, 1);
        // await temp;
        await this.dbService.createResponsibleWithID(2, 2);
        // await temp;
        await this.dbService.createDailyRecord('12-03-2020', 1);
        // await temp;
        await this.dbService.createDailyRecord('12-03-2020', 2);
        // await temp;
        await this.dbService.createDailyRecord('13-03-2020', 1);
        // await temp;
        await this.dbService.createDailyRecord('13-03-2020', 2);
        // await temp;
        await this.dbService.createChicken(
            '12-03-2020',
            1,
            36000,
            'Sally',
            'm',
        );
        // await temp;
        await this.dbService.createChicken(
            '12-03-2020',
            2,
            40000,
            'Sally',
            'f',
        );
        // await temp;
        await this.dbService.createSensor(1, 1, 10, 20);
        // await temp;
        await this.dbService.createSensor(2, 1, 20, 40);
        // await temp;
        await this.dbService.createSensor(1, 2, 10, 20);
        // await temp;
        await this.dbService.createSensor(2, 2, 20, 40);
        // await temp;
        await this.dbService.createCamera(1, 1, 10, 20);
        // await temp;
        await this.dbService.createCamera(2, 1, 20, 40);
        // await temp;
        await this.dbService.createCamera(1, 2, 10, 20);
        // await temp;
        await this.dbService.createCamera(2, 2, 20, 40);
        // await temp;
        await this.dbService.createChickenRecord(
            1584011605,
            '12-03-2020',
            1,
            13,
        );
        // await temp;
        await this.dbService.createChickenRecord(
            1584011605,
            '12-03-2020',
            2,
            33,
        );
        // await temp;
        await this.dbService.createChickenRecord(
            1584090805,
            '13-03-2020',
            1,
            43,
        );
        // await temp;
        await this.dbService.createChickenRecord(
            1584090805,
            '13-03-2020',
            2,
            24,
        );
        // await temp;
        await this.dbService.createFoodRecord(
            1,
            '12-03-2020',
            1,
            8430,
            8130,
            300,
        );
        // await temp;
        await this.dbService.createFoodRecord(
            2,
            '12-03-2020',
            1,
            7800,
            7200,
            600,
        );
        // await temp;
        await this.dbService.createFoodRecord(
            1,
            '12-03-2020',
            2,
            8530,
            8130,
            400,
        );
        // await temp;
        await this.dbService.createFoodRecord(
            2,
            '12-03-2020',
            2,
            7800,
            7200,
            600,
        );
        // await temp;
        await this.dbService.createVacRecord(
            1584018805,
            'Calcium',
            '12-03-2020',
            1,
            10.3,
        );
        // await temp;
        await this.dbService.createVacRecord(
            1584018905,
            'Calcium',
            '12-03-2020',
            2,
            20.4,
        );
        // await temp;
        await this.dbService.createWaterRecord(
            2508392,
            2530116,
            '12-03-2020',
            1,
            663,
        );
        // await temp;
        await this.dbService.createWaterRecord(
            2608392,
            2630116,
            '12-03-2020',
            2,
            546,
        );
        // await temp;
        await this.dbService.createWaterRecord(
            2508508,
            2530735,
            '13-03-2020',
            1,
            763,
        );
        // await temp;
        await this.dbService.createWaterRecord(
            2608508,
            2630735,
            '13-03-2020',
            2,
            346,
        );
        // await temp;
        await this.dbService.createEnvData(
            1584011605,
            1,
            1,
            120,
            48.6,
            28.2,
            23,
        );
        // await temp;
        await this.dbService.createEnvData(
            1584011605,
            2,
            1,
            140,
            46.4,
            24.2,
            29,
        );
        // await temp;
        await this.dbService.createEnvData(
            1584090805,
            1,
            2,
            125,
            45.6,
            25.3,
            25,
        );
        // await temp;
        await this.dbService.createEnvData(
            1584090805,
            2,
            2,
            123,
            46.6,
            27.4,
            24,
        );
        // await temp;
        await this.dbService.createImage(
            1584011605,
            1,
            1,
            'http://www.kookkook.com/img/1_1',
            0,
            0,
        );
        // await temp;
        await this.dbService.createImage(
            1584011605,
            2,
            1,
            'http://www.kookkook.com/img/1_2',
            0,
            0,
        );
        // await temp;
        await this.dbService.createImage(
            1584090805,
            1,
            2,
            'http://www.kookkook.com/img/2_1',
            0,
            0,
        );
        // await temp;
        await this.dbService.createImage(
            1584090805,
            2,
            2,
            'http://www.kookkook.com/img/2_2',
            0,
            0,
        );
        // await temp;
    };
}
