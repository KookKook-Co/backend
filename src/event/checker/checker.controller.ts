import { Controller, Inject, Logger } from '@nestjs/common';
import {
    MessagePattern,
    Ctx,
    MqttContext,
    Payload,
} from '@nestjs/microservices';
import { NotiService } from '../notification.service';
import { CheckerService } from './checker.service';
import { DbService } from '../../db/db.service';
import moment = require('moment-timezone');
import { EnvType } from '../event.interfaces';

@Controller()
export class CheckerController {
    constructor(
        private readonly checkerService: CheckerService,
        private readonly notiService: NotiService,
        private readonly dbService: DbService,
    ) {}

    private logger: Logger = new Logger('IrrEnvChecker Controller');

    @MessagePattern('/+/+')
    async checkIrrEnv(@Payload() data, @Ctx() context: MqttContext) {
        const info = context.getTopic().split('/');
        this.logger.log(`SID: ${info[1]}`);
        this.logger.log(`Environment Type: ${info[2]}`);
        this.logger.log(`Value: ${data}`);
        const value = parseFloat(data);
        const hid = await this.dbService.getHidBySid(info[1]);
        this.logger.log(`House Number: ${hid}`);
        const { dateIn } = await this.dbService.getLatestChickenFlockInfoByHid(
            hid,
        );

        const now = moment(new Date());
        const chickenAge = moment.duration(now.diff(moment(dateIn))).asDays();
        this.logger.log(`Chicken Age: ${chickenAge}`);

        if (
            this.checkerService.isIrrEnv(chickenAge, info[2] as EnvType, value)
        ) {
            this.notiService.sendLineMessage(hid, info[2] as EnvType, value);
        }
    }
}
