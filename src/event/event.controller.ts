import {
    Controller,
    Get,
    UseGuards,
    Post,
    Body,
    Res,
    Query,
    Request,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { NotiService } from '../event/noti.service';
import {
    DailyInfo,
    ChickenFlockInfo,
    SubmitUnqualifiedChickenDTO,
} from './event.interfaces';
import { Response } from 'express';
import { RolesGuard, HousesGuard } from '../guard';
import { DbService } from '../db/db.service';

@Controller('event')
export class EventController {
    constructor(
        private readonly notiService: NotiService,
        private readonly dbService: DbService,
    ) {}

    @UseGuards(AuthGuard())
    @Get('line')
    sendMsg() {
        this.notiService.sendLineMsg();
    }

    @UseGuards(AuthGuard(), HousesGuard)
    @Get('deadchickenmap')
    async getDeadChickenMap(@Res() res: Response) {
        const dbQueryDeadChickenMap = async () => true as any;
        const map = await dbQueryDeadChickenMap();
        res.send(map);
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

        if (await checkExist(req.hno)) {
            const dailyInfo: DailyInfo = await dbQueryDailyInputInfo(date);
            res.send(dailyInfo);
        } else {
            res.send(null);
        }
    }

    @UseGuards(AuthGuard(), HousesGuard)
    @Post('dailydata')
    async submitDailyDataInfo(
        @Request() req,
        @Body() dailyInfo: DailyInfo,
        @Res() res: Response,
    ) {
        try {
            const checkExist = async (hid: any, date: any) => false;
            const update = async (data: any) => false;

            const hid = await this.dbService.getHid(req.hno);
            const date = dailyInfo.timestamp.toLocaleDateString();
            if (!(await checkExist(hid, date))) {
                await this.dbService.createDailyRecord(date, hid);
            } else {
                await this.dbService.createDailyDataRecord({
                    date,
                    timestamp: dailyInfo.timestamp.getTime().toString(),
                    hid,
                });
            }
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

            const hid = await this.dbService.getHid(req.hno);

            const date = body.date;
            if (!(await checkExist(date, hid))) {
                await this.dbService.createDailyRecord(date, hid);
            } else {
                await this.dbService.createChickenRecord({
                    date,
                    chicTime: body.timestamp.getTime().toString(),
                    hid,
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
        const hid = await this.dbService.getHid(req.hno);
        const payload = await this.dbService.createChickenFlock({
            ...chickenFlockInfo,
            hid,
        });
        return payload;
    }
}
