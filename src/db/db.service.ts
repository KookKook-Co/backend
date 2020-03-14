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

    createUser = (fname, lname, currentuser, hashpassword, position) =>
        poolQuery(`INSERT INTO "_User" (pwd, currentuser, fname, lname, position) \
                VALUES ('${hashpassword}', '${currentuser}', '${fname}', '${lname}', '${position}');`);
    F;
    getUserUid = (fname, lname) =>
        poolQuery(`SELECT uid FROM "_User" \
                WHERE fname = '${fname}' AND lname = '${lname}';`);

    getUserPwd = (fname, lname) =>
        poolQuery(`SELECT pwd FROM "_User" \
                WHERE fname = '${fname}' AND lname = '${lname}';`);

    deleteUser = (fname, lname) =>
        poolQuery(`DELETE FROM "_User" \
                WHERE fname = '${fname}' AND lname = '${lname}';`);

    updateUserPwd = (fname, lname, newPwd) =>
        poolQuery(`UPDATE "_User" \
                SET pwd = '${newPwd}' \
                WHERE fname = '${fname}' AND lname = '${lname}';`);

    createHouse = (house_id, length, width, scale) =>
        poolQuery(`INSERT INTO "House" \
        (hid, length, width, scale) \
        VALUES (${house_id}, ${length}, ${width}, ${scale});`);

    createDailyRecord = (date, hid) =>
        poolQuery(`INSERT INTO "DailyRecord" (date, hid) \
                VALUES (TO_DATE('${date}', 'DD-MM-YYYY'), '${hid}');`);

    getDailyRecord = hid =>
        poolQuery(`SELECT date FROM "DailyRecord" \
                WHERE hid = '${hid}';`);

    deleteDailyRecord = (date, hid) =>
        poolQuery(`DELETE FROM "DailyRecord" \
                WHERE hid = '${hid}' AND date = TO_DATE('${date}', 'DD-MM-YYYY');`);

    createChicken = (date_in, hid, gen, amount_in, type, gender) =>
        poolQuery(`INSERT INTO "Chicken" \
                (date_in, hid, gen, amount_in, type, gender) \
                VALUES (TO_DATE('${date_in}', 'DD-MM-YYYY'), ${hid}, '${gen}', ${amount_in}, '${type}', '${gender}');`);

    createResponsibleWithID = (hid, uid) =>
        poolQuery(`INSERT INTO "HasUser" (hid, uid) \
                    VALUES ('${hid}', '${uid}');`);

    createSensor = (sen_no, hid, sen_x, sen_y) =>
        poolQuery(`INSERT INTO "Sensor" (sen_no, hid, sen_x, sen_y) \
                        VALUES (${sen_no}, ${hid}, '${sen_x}', '${sen_y}');`);

    createEnvData = (timestamp, sen_no, hid, windspeed, humid, temp, ammonia) =>
        poolQuery(`INSERT INTO "Environment" (timestamp, sen_no, hid, windspeed, humid, temp, ammonia) \
                            VALUES (TO_TIMESTAMP(${timestamp}), ${sen_no}, '${hid}', '${windspeed}', '${humid}', '${temp}', '${ammonia}');`);

    createCamera = (cam_no, hid, cam_x, cam_y) =>
        poolQuery(`INSERT INTO "Camera" (cam_no, hid, cam_x, cam_y) \
                          VALUES (${cam_no}, ${hid}, '${cam_x}', '${cam_y}');`);

    createImage = (timestamp, cam_no, hid, url, clicked, startdead) =>
        poolQuery(`INSERT INTO "Image" (timestamp, cam_no, hid, url, clicked, startdead)  \
                            VALUES (TO_TIMESTAMP(${timestamp}), ${cam_no}, '${hid}', '${url}', '${clicked}', '${startdead}');`);

    createChickenRecord = (chic_time, date, hid, death_real) =>
        poolQuery(`INSERT INTO "ChickenRecord" (chic_time, date, hid, death_real) \
                        VALUES (TO_TIMESTAMP(${chic_time}), TO_DATE('${date}', 'DD-MM-YYYY'), '${hid}', ${death_real});`);

    createFoodRecord = (
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
        return poolQuery(`INSERT INTO "FoodRecord" (food_no, date, hid, food_in, food_remain, food_consume) \
                        VALUES (${food_no}, TO_DATE('${date}', 'DD-MM-YYYY'), '${hid}', ${food_in}, ${food_remain}, ${food_consume});`);
    };
    createVacRecord = (vac_time, vac_type, date, hid, vac_conc = null) =>
        poolQuery(`INSERT INTO "VacRecord" (vactime, vac_type, date, hid, vac_conc) \
                        VALUES (TO_TIMESTAMP(${vac_time}), '${vac_type}', TO_DATE('${date}', 'DD-MM-YYYY'), '${hid}', ${vac_conc});`);

    createWaterRecord = (meter_1, meter_2, date, hid, water_consume = null) =>
        poolQuery(`INSERT INTO "WaterRecord" (meter_1, meter_2, date, hid, water_consume) \
                        VALUES (${meter_1}, ${meter_2}, TO_DATE('${date}', 'DD-MM-YYYY'), '${hid}', ${water_consume});`);
}
