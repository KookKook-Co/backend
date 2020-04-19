import { Controller, Inject } from '@nestjs/common';
import {
    ClientProxy,
    MessagePattern,
    Ctx,
    MqttContext,
    Payload,
} from '@nestjs/microservices';
import { NotiService } from './notification.service';
import { CheckerService } from './checker.service';
import { DbService } from '../db/db.service';
import moment = require('moment');
import { EnvType } from './event.interfaces';

@Controller()
export class CheckerController {
    constructor(
        @Inject('MQTT_SERVICE') private client: ClientProxy,
        private readonly checkerService: CheckerService,
        private readonly notiService: NotiService,
        private readonly dbService: DbService,
    ) {}

    @MessagePattern('/+/+')
    async checkIrrEnv(@Payload() data, @Ctx() context: MqttContext) {
        // console.log(`Topic: ${context.getTopic()}`);
        const info = context.getTopic().split('/');
        console.log(info);
        const value = parseFloat(data);
        console.log(value);
        const hid = await this.dbService.getHidBySid(info[1]);
        // console.log(hid);
        const { dateIn } = await this.dbService.getLatestChickenFlockInfoByHid(
            hid,
        );

        const now = moment(new Date());
        const chickenAge = moment.duration(now.diff(moment(dateIn))).asDays();

        console.log(`ChickenAge: ${chickenAge}`);

        console.log(
            this.checkerService.isIrrEnv(chickenAge, info[2] as EnvType, value),
        );
        if (
            this.checkerService.isIrrEnv(chickenAge, info[2] as EnvType, value)
        ) {
            this.notiService.sendLineMsg(hid, info[2] as EnvType, value);
        }
    }
}
