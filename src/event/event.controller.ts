import { Controller, Get, UseGuards } from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { NotiService } from 'src/event/noti.service';

@Controller('event')
export class EventController {
    constructor(private readonly notiService: NotiService) {}

    @UseGuards(AuthGuard())
    @Get('line')
    sendMsg() {
        this.notiService.sendLineMsg();
    }
}
