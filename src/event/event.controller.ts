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
import { NotiService } from '../event/noti.service';
import {
    SubmitUnqualifiedChickenDTO,
    PostDailyInfo,
    CreateChickenFlockDTO,
} from './event.interfaces';
import { Response } from 'express';
import { RolesGuard, HousesGuard } from '../guard';
import { DbService } from '../db/db.service';
import { CheckIrrEnvService } from './checkIrrEnv.services';
import moment = require('moment');

@Controller('event')
export class EventController {
    constructor(
        private readonly notiService: NotiService,
        private readonly checkIrrEnvService: CheckIrrEnvService,
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

    @UseGuards(AuthGuard())
    @Get('line')
    sendMsg() {
        this.notiService.sendLineMsg();
    }

    @UseGuards(AuthGuard(), HousesGuard)
    @Get('sensors')
    async getSensors(@Query('hno') hno: number, @Res() res) {
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

    @UseGuards(AuthGuard())
    @Get('env/weekly')
    async getWeeklyEnvData(@Query() query) {
        const { sid, hno } = query;
        // Wait DB
        return {};
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
        @Query('date') date: string,
        @Res() res: Response,
    ) {
        const formatedDate = moment(date).format('DD-MM-YYYY');
        const hid = await this.dbService.getHidByHno(req.user.hno);

        // if (await this.dbService.getLast(formatedDate, req.user.hno)) {
        //     const dailyInfo: DailyInfo = await this.dbService.get(date);
        //     res.send(dailyInfo);
        // }
    }

    @UseGuards(AuthGuard(), HousesGuard)
    @Post('dailydata')
    async submitDailyDataInfo(
        @Request() req,
        @Body() body: PostDailyInfo,
        @Res() res: Response,
    ) {
        try {
            const hid = await this.dbService.getHidByHno(req.user.hno);
            const date = moment(body.date).format('DD-MM-YYYY');
            if (
                !(await this.dbService.isDailyRecordTupleExist(
                    date.toString(),
                    hid,
                ))
            ) {
                await this.dbService.createDailyRecord(date, hid);
            }

            // Some shit from DB
            await this.dbService.createDailyDataRecord({
                timestamp: (new Date().valueOf() / 1000).toString(),
                date,
                hid,
            });

            res.status(200).send('Success');
        } catch (err) {
            res.status(400).send(err);
        }
    }

    @UseGuards(AuthGuard(), HousesGuard)
    @Get('unqualifiedchicken')
    async getUnqualifiedChickenInfo(
        @Request() req,
        @Query('date') date: string,
        @Res() res: Response,
    ) {
        const formatedDate = moment(date).format('DD-MM-YYYY');
        const hid = await this.dbService.getHidByHno(req.user.hno);

        // Fuck DB

        // res.send(
        //     await this.dbService.getLatestChickenRecordByHidAndDate(
        //         hid,
        //         formatedDate,
        //     ),
        // );
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

            const hid = await this.dbService.getHidByHno(req.user.hno);
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
    async getChickenFlock(@Query('hno') hno, @Res() res) {
        const hid = await this.dbService.getHidByHno(hno);
        res.send(await this.dbService.getChickenFlockInfoByHid(hid));
    }

    @UseGuards(AuthGuard(), RolesGuard)
    @Post('chickenflocks')
    async addChickenFlock(@Body() body: CreateChickenFlockDTO, @Res() res) {
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
    async deleteChickenFlock(@Query() query, @Res() res) {
        // Wait DB deleteChickenFlock
    }
}
