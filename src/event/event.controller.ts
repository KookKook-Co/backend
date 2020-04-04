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
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { NotiService } from '../event/noti.service';
import {
    ChickenFlockInfo,
    SubmitUnqualifiedChickenDTO,
    PostDailyInfo,
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
        @Query('date') date: Date,
        @Res() res: Response,
    ) {
        const dbQueryDailyInputInfo = async (date: Date) => true as any;
        const checkExist = async (data: any) => false;

        const formatedDate = moment(date).format('DD-MM-YYYY');
        const hid = await this.dbService.getHidByHno(req.user.hno);

        // if (await this.dbService.getLast(formatedDate.toString(), req.user.hno)) {
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

            await this.dbService.createDailyDataRecord({
                timestamp: new Date().getTime().toString(),
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
        @Query('date') date: Date,
        @Res() res: Response,
    ) {
        const dbQueryDailyInputInfo = async (date: Date) => true as any;
        const checkExist = async (data: any) => false;

        if (await checkExist(req.hno)) {
            const dailyInfo = await dbQueryDailyInputInfo(date);
            res.send(dailyInfo);
        } else {
            res.send(null);
        }
    }

    @UseGuards(AuthGuard(), HousesGuard)
    @Post('unqualifiedchicken')
    async submitUnqualifiedChickenInfo(
        @Request() req,
        @Body() body: SubmitUnqualifiedChickenDTO,
        @Res() res: Response,
    ) {
        try {
            const checkExist = async (date, hid) => false;

            const hid = await this.dbService.getHidByHno(req.hno);

            const { date, period } = body;
            if (!(await checkExist(date, hid))) {
                await this.dbService.createDailyRecord(date, hid);
            } else {
                await this.dbService.createChickenRecord({
                    date,
                    chicTime: body.timestamp.getTime().toString(),
                    hid,
                    period,
                    ...body.unqualifiedChickenInfo,
                });
            }
        } catch (err) {
            res.status(400).send(err);
        }
    }

    @UseGuards(AuthGuard(), RolesGuard)
    @Post('chickenflock')
    async addChickenFlock(
        @Request() req,
        @Body() chickenFlockInfo: ChickenFlockInfo,
    ) {
        const hid = await this.dbService.getHidByHno(req.hno);
        const payload = await this.dbService.createChickenFlock({
            ...chickenFlockInfo,
            hid,
        });
        return payload;
    }
}
