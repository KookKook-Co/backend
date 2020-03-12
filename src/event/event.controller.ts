import {
    Controller,
    Get,
    UseGuards,
    Post,
    Body,
    Res,
    Query,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { NotiService } from '../event/noti.service';
import { DailyInfoDTO } from './event.interfaces';
import { Response } from 'express';

@Controller('event')
export class EventController {
    constructor(private readonly notiService: NotiService) {}

    @UseGuards(AuthGuard())
    @Get('line')
    sendMsg() {
        this.notiService.sendLineMsg();
    }

    @UseGuards(AuthGuard())
    @Get('deadchickenmap')
    async getDeadChicken(@Res() res: Response) {
        const dbQueryDeadChickenMap = async () => true as any;
        const map = await dbQueryDeadChickenMap();
        res.send(map);
    }

    @UseGuards(AuthGuard())
    @Get('dailyinfo')
    async getDailyInfo(@Query('date') date: Date, @Res() res: Response) {
        const dbQueryDailyInputInfo = async (date: Date) => true as any;
        const dailyInfo: DailyInfoDTO = await dbQueryDailyInputInfo(date);
        res.send(dailyInfo);
    }

    @UseGuards(AuthGuard())
    @Post('dailyinfo')
    async inputDailyInfo(
        @Body() dailyInfo: DailyInfoDTO,
        @Res() res: Response,
    ) {
        const dbCreateDailyInputInfo = async (data: any) => true as any;
        const data = await dbCreateDailyInputInfo(dailyInfo);
    }
}
