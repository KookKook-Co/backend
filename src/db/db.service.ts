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

    createUser = async (fname, lname, hashpassword, position) =>
        await poolQuery(`INSERT INTO "_User" (pwd, fname, lname, position) \
                VALUES ('${hashpassword}', '${fname}', '${lname}', '${position}');`);

    updateUser() {
        return true;
    }
    createHouse = async (house_id, length, width, scale) => {
        await poolQuery(`INSERT INTO "House" \
              (hid, length, width, scale) \
              VALUES (${house_id}, ${length}, ${width}, ${scale});`);
    };
    createDailyRecord = async (date, hid) => {
        await poolQuery(`INSERT INTO "DailyRecord" (date, hid) \
                      VALUES (TO_DATE('${date}', 'DD-MM-YYYY'), '${hid}');`);
    };
    createChicken = async (date_in, hid, amount_in, type, gender) =>
        await poolQuery(`INSERT INTO "Chicken" \
                (date_in, hid, amount_in, type, gender) \
                VALUES (TO_DATE('${date_in}', 'DD-MM-YYYY'), ${hid}, ${amount_in}, '${type}', '${gender}');`);
    createResponsibleWithID = async (hid, uid) =>
        await poolQuery(`INSERT INTO "HasUser" (hid, uid) \
                    VALUES ('${hid}', '${uid}');`);
    createSensor = async (sen_no, hid, sen_x, sen_y) => {
        await poolQuery(`INSERT INTO "Sensor" (sen_no, hid, sen_x, sen_y) \
                        VALUES (${sen_no}, ${hid}, '${sen_x}', '${sen_y}');`);
    };
    createEnvData = async (
        timestamp,
        sen_no,
        hid,
        windspeed,
        humid,
        temp,
        ammonia,
    ) => {
        await poolQuery(`INSERT INTO "Environment" (timestamp, sen_no, hid, windspeed, humid, temp, ammonia) \
                            VALUES (TO_TIMESTAMP(${timestamp}), ${sen_no}, '${hid}', '${windspeed}', '${humid}', '${temp}', '${ammonia}');`);
    };
    createCamera = async (cam_no, hid, cam_x, cam_y) => {
        await poolQuery(`INSERT INTO "Camera" (cam_no, hid, cam_x, cam_y) \
                          VALUES (${cam_no}, ${hid}, '${cam_x}', '${cam_y}');`);
    };
    createImage = async (timestamp, cam_no, hid, url, clicked, startdead) => {
        await poolQuery(`INSERT INTO "Image" (timestamp, cam_no, hid, url, clicked, startdead)  \
                            VALUES (TO_TIMESTAMP(${timestamp}), ${cam_no}, '${hid}', '${url}', '${clicked}', '${startdead}');`);
    };
    createChickenRecord = async (chic_time, date, hid, death_real) => {
        await poolQuery(`INSERT INTO "ChickenRecord" (chic_time, date, hid, death_real) \
                        VALUES (TO_TIMESTAMP(${chic_time}), TO_DATE('${date}', 'DD-MM-YYYY'), '${hid}', ${death_real});`);
    };
    createFoodRecord = async (
        food_no,
        date,
        hid,
        food_in,
        food_remain,
        food_consume = null,
    ) => {
        if ((food_consume = null)) {
            food_consume = food_in - food_remain;
        }
        await poolQuery(`INSERT INTO "FoodRecord" (food_no, date, hid, food_in, food_remain, food_consume) \
                        VALUES (${food_no}, TO_DATE('${date}', 'DD-MM-YYYY'), '${hid}', ${food_in}, ${food_remain}, ${food_consume});`);
    };
    createVacRecord = async (
        vac_time,
        vac_type,
        date,
        hid,
        vac_conc = null,
    ) => {
        await poolQuery(`INSERT INTO "VacRecord" (vactime, vac_type, date, hid, vac_conc) \
                        VALUES (TO_TIMESTAMP(${vac_time}), '${vac_type}', TO_DATE('${date}', 'DD-MM-YYYY'), '${hid}', ${vac_conc});`);
    };

    createWaterRecord = async (
        meter_1,
        meter_2,
        date,
        hid,
        water_consume = null,
    ) => {
        await poolQuery(`INSERT INTO "WaterRecord" (meter_1, meter_2, date, hid, water_consume) \
                        VALUES (${meter_1}, ${meter_2}, TO_DATE('${date}', 'DD-MM-YYYY'), '${hid}', ${water_consume});`);
    };
}
