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

    createUser = (fname, lname, is_current_user, hashpassword, position) =>
        this
            .dbPoolQuery(`INSERT INTO "_User" (pwd, is_current_user, fname, lname, position) \
                VALUES ('${hashpassword}', '${is_current_user}', '${fname}', '${lname}', '${position}');`);

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

    createChicken = (date_in, hid, gen, amount_in, type, gender) =>
        this.dbPoolQuery(`INSERT INTO "Chicken" \
                (date_in, hid, gen, amount_in, type, gender) \
                VALUES (TO_DATE('${date_in}', 'DD-MM-YYYY'), ${hid}, '${gen}', ${amount_in}, '${type}', '${gender}');`);

    getChickenInfo = (hid, gen) =>
        this
            .dbPoolQuery(`SELECT date_in, amount_in, type, gender FROM "Chicken" \
        WHERE hid = '${hid}' AND gen = '${gen}';`);

    createResponsibleWithID = (hid, uid) =>
        this.dbPoolQuery(`INSERT INTO "HasUser" (hid, uid) \
                    VALUES ('${hid}', '${uid}');`);

    createSensor = (sid, hid, sen_x, sen_y) =>
        this.dbPoolQuery(`INSERT INTO "Sensor" (sid, hid, sen_x, sen_y) \
                        VALUES (${sid}, ${hid}, '${sen_x}', '${sen_y}');`);
    getSensorInfo = sid =>
        this.dbPoolQuery(`SELECT hid, sen_x, sen_y FROM "Sensor" \
        WHERE sid = '${sid};`);

    createEnvData = (timestamp, sid, hid, windspeed, humid, temp, ammonia) =>
        this
            .dbPoolQuery(`INSERT INTO "Environment" (timestamp, sid, hid, windspeed, humid, temp, ammonia) \
                            VALUES (TO_TIMESTAMP(${timestamp}), ${sid}, '${hid}', '${windspeed}', '${humid}', '${temp}', '${ammonia}');`);
    getLatestEnvData = hid =>
        this.dbPoolQuery(`SELECT * FROM "Environment"
                        WHERE hid = ${hid} ORDER BY timestamp DESC LIMIT 1;`);
    getEnvDataByDate = (hid, date) =>
        this.dbPoolQuery(`SELECT * FROM "Environment" WHERE hid = ${hid}
        AND timestamp BETWEEN TO_TIMESTAMP('${date} 00:00:00','DD-MM-YYYY HH24:MI:SS') 
        AND TO_TIMESTAMP('${date} 23:59:59','DD-MM-YYYY HH24:MI:SS')`);

    createCamera = (cid, hid, cam_x, cam_y) =>
        this.dbPoolQuery(`INSERT INTO "Camera" (cid, hid, cam_x, cam_y) \
                          VALUES (${cid}, ${hid}, '${cam_x}', '${cam_y}');`);
    getCameraInfo = cid =>
        this.dbPoolQuery(`SELECT * FROM "Camera" WHERE cid = ${cid};`);

    createImage = (timestamp, cid, hid, url) =>
        this.dbPoolQuery(`INSERT INTO "Image" (timestamp, cid, hid, url)  \
                            VALUES (TO_TIMESTAMP(${timestamp}), ${cid}, '${hid}', '${url}');`);
                            
    createChickenRecord = (chic_time, date, hid, death_real, death_cam) =>
        this
            .dbPoolQuery(`INSERT INTO "ChickenRecord" (chic_time, date, hid, death_real, death_cam) \
                        VALUES (TO_TIMESTAMP(${chic_time}), TO_DATE('${date}', 'DD-MM-YYYY'), '${hid}', ${death_real}, ${death_cam});`);

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
        return this
            .dbPoolQuery(`INSERT INTO "FoodRecord" (food_no, date, hid, food_in, food_remain, food_consume) \
                        VALUES (${food_no}, TO_DATE('${date}', 'DD-MM-YYYY'), '${hid}', ${food_in}, ${food_remain}, ${food_consume});`);
    };
    createVacRecord = (vac_time, vac_type, date, hid, vac_conc = null) =>
        this
            .dbPoolQuery(`INSERT INTO "VacRecord" (vac_time, vac_type, date, hid, vac_conc) \
                        VALUES (TO_TIMESTAMP(${vac_time}), '${vac_type}', TO_DATE('${date}', 'DD-MM-YYYY'), '${hid}', ${vac_conc});`);

    createWaterRecord = (meter_1, meter_2, date, hid, water_consume = null) =>
        this
            .dbPoolQuery(`INSERT INTO "WaterRecord" (meter_1, meter_2, date, hid, water_consume) \
                        VALUES (${meter_1}, ${meter_2}, TO_DATE('${date}', 'DD-MM-YYYY'), '${hid}', ${water_consume});`);
}
