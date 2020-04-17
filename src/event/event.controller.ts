import {
    Controller,
    Get,
    UseGuards,
    Post,
    Body,
    Res,
    Query,
    Request,
    Logger,
    Delete,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { NotiService } from './notification.service';
import {
    SubmitUnqualifiedChickenDTO,
    PostDailyInfo,
    CreateChickenFlockDTO,
    GetUnqualifiedChickenInfo,
    GetWeeklyDailyDataQuery,
} from './event.interfaces';
import { Response } from 'express';
import { RolesGuard, HousesGuard } from '../guard';
import { DbService } from '../db/db.service';
import { CheckerService } from './checker.services';
import * as moment from 'moment';
import { DailyInfo } from '../event/event.interfaces';

@Controller('event')
export class EventController {
    constructor(
        private readonly notiService: NotiService,
        private readonly checkIrrEnvService: CheckerService,
        private readonly dbService: DbService,
    ) {}

    private logger: Logger = new Logger();

    @Get('test')
    async test() {
        const data = {
            temperature: 23.3,
            humidity: 81,
            windspeed: 1.55,
            ammonia: 20.1,
        };
        console.log(this.checkIrrEnvService.getIrrEnv(28, data));
    }

    @UseGuards(AuthGuard(), HousesGuard)
    @Get('sensors')
    async getSensors(@Query('hno') hno: number, @Res() res: Response) {
        const hid = await this.dbService.getHidByHno(hno);
        const sensors = await this.dbService.getAllSensorInfoByHid(hid);
        res.send(
            sensors.map(each => {
                const { sid, xPosSen, yPosSen } = each;
                return {
                    [sid]: {
                        xPosSen,
                        yPosSen,
                    },
                };
            }),
        );
    }

    @UseGuards(AuthGuard(), HousesGuard)
    @Get('env/weekly')
    async getWeeklyEnvData(
        @Query() query: GetWeeklyDailyDataQuery,
        @Res() res: Response,
    ) {
        const { sid, type, dateStart, dateEnd } = query;

        // const dateStart = moment().format('DD-MM-YYYY');
        // const dateEnd = moment()
        //     .subtract(6, 'days')
        //     .format('DD-MM-YYYY');

        res.send(
            await this.dbService.getMaxAndMinBetweenDateBySidandEnvType(
                type,
                sid,
                moment(dateStart).format('DD-MM-YYYY'),
                moment(dateEnd).format('DD-MM-YYYY'),
            ),
        );
    }

    @UseGuards(AuthGuard(), HousesGuard)
    @Get('deadchickenmap')
    async getDeadChickenMap(@Query('hno') hno, @Res() res: Response) {
        this.logger.log('/GET /deadchickenmap');
        const hid = await this.dbService.getHidByHno(hno);
        const result = await this.dbService.getLastImageForEachCameraByHid(hid);
        res.send(result);
    }

    @UseGuards(AuthGuard(), HousesGuard)
    @Get('dailydata')
    async getDailyDataInfo(
        @Request() req,
        @Query() query,
        @Res() res: Response,
    ) {
        const formatedDate = moment(query.date).format('DD-MM-YYYY');
        // const formatedDate = '12-03-2020'; // mock

        const hid = await this.dbService.getHidByHno(query.hno);

        if (await this.dbService.isDailyRecordTupleExist(formatedDate, hid)) {
            const dailyInfo: DailyInfo = await this.dbService.getAllDataRecordByHidAndDate(
                hid,
                formatedDate,
            );
            res.send(dailyInfo);
        } else {
            res.send(null);
        }
    }

    @UseGuards(AuthGuard(), HousesGuard)
    @Post('dailydata')
    async submitDailyDataInfo(
        @Request() req,
        @Body() body: PostDailyInfo,
        @Res() res: Response,
    ) {
        try {
            const hid = await this.dbService.getHidByHno(body.hno);
            const date = moment(body.date).format('DD-MM-YYYY');
            const dateBefore = moment(body.date)
                .subtract(1, 'days')
                .format('DD-MM-YYYY');

            // console.log(body);

            if (!(await this.dbService.isDailyRecordTupleExist(date, hid))) {
                await this.dbService.createDailyRecord(date, hid);
            }

            const timestamp = (new Date().valueOf() / 1000).toString();
            // console.log(timestamp);

            // console.log(dateBefore);
            const waterBefore = await this.dbService.getLatestWaterRecordByHidAndDate(
                hid,
                dateBefore,
            );
            // console.log(waterBefore);

            const waterConsumed =
                body.dailyInfo.water.waterMeter1 +
                body.dailyInfo.water.waterMeter2 -
                (waterBefore.waterMeter1 + waterBefore.waterMeter2);

            const { food, water, medicine } = body.dailyInfo;

            const dailyInfo = {
                food,
                water: {
                    ...water,
                    waterConsumed,
                },
                medicine,
            };

            const payload = {
                hid,
                date,
                timestamp,
                dailyInfo,
            };

            console.log(payload);
            console.log(dailyInfo);

            await this.dbService.createDailyDataRecordSet(payload);

            res.status(200).send('Success');
        } catch (err) {
            res.status(400).send(err);
        }
    }

    @UseGuards(AuthGuard(), HousesGuard)
    @Get('unqualifiedchicken')
    async getUnqualifiedChickenInfo(
        @Request() req,
        @Query() query: GetUnqualifiedChickenInfo,
        @Res() res: Response,
    ) {
        const formatedDate = moment(query.date).format('DD-MM-YYYY');
        const h_id = await this.dbService.getHidByHno(query.hno);

        const {
            chicTime,
            period,
            date,
            hid,
            ...remains
        } = await this.dbService.getLatestChickenRecordByHidAndDateAndPeriod(
            h_id,
            formatedDate,
            query.period,
        );
        res.send(remains);
    }

    @UseGuards(AuthGuard(), HousesGuard)
    @Post('unqualifiedchicken')
    async submitUnqualifiedChickenInfo(
        @Request() req,
        @Body() body: SubmitUnqualifiedChickenDTO,
        @Res() res: Response,
    ) {
        try {
            const { date, period, unqualifiedChickenInfo } = body;

            const hid = await this.dbService.getHidByHno(body.hno);
            const formatedDate = moment(date).format('DD-MM-YYYY');

            if (
                !(await this.dbService.isDailyRecordTupleExist(
                    formatedDate,
                    hid,
                ))
            ) {
                await this.dbService.createDailyRecord(formatedDate, hid);
            }
            await this.dbService.createChickenRecord({
                date: formatedDate,
                chicTime: (new Date().valueOf() / 1000).toString(),
                hid,
                period,
                ...unqualifiedChickenInfo,
            });

            res.status(200).send('Success');
        } catch (err) {
            res.status(400).send(err);
        }
    }

    @UseGuards(AuthGuard(), RolesGuard)
    @Get('chickenflocks')
    async getChickenFlock(@Query('hno') hno, @Res() res: Response) {
        const hid = await this.dbService.getHidByHno(hno);
        res.send(await this.dbService.getChickenFlockInfoByHid(hid));
    }

    @UseGuards(AuthGuard(), RolesGuard)
    @Post('chickenflocks')
    async addChickenFlock(
        @Body() body: CreateChickenFlockDTO,
        @Res() res: Response,
    ) {
        const hid = await this.dbService.getHidByHno(body.hno);

        const chickenflock = await this.dbService.getChickenFlockInfoByHidAndGeneration(
            hid,
            body.chickenFlockInfo.generation,
        );

        if (!chickenflock) {
            await this.dbService.createChickenFlock({
                ...body.chickenFlockInfo,
                dateIn: moment(body.chickenFlockInfo.dateIn).format(
                    'DD-MM-YYYY',
                ),
                dateOut: moment(body.chickenFlockInfo.dateOut).format(
                    'DD-MM-YYYY',
                ),
                hid,
            });
        } else {
            // Fuck DB update
            console.log('Wait for Update function.');
        }

        res.status(200).send('Success');
    }

    @UseGuards(AuthGuard(), RolesGuard)
    @Delete('chickenflocks')
    async deleteChickenFlock(@Query() query, @Res() res: Response) {
        try {
            const hid = await this.dbService.getHidByHno(query.hno);
            await this.dbService.deleteChickenFlockByHidAndGeneration(
                hid,
                query.generation,
            );
            res.send('Success');
        } catch (err) {
            res.status(400).send(err);
        }
    }

    @UseGuards(AuthGuard(), RolesGuard)
    @Get('hnos')
    async getAllHnoForOwner(@Res() res: Response) {
        res.send(await this.dbService.getAllHno());
    }
}
