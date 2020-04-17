import { ClientsModule, Transport } from '@nestjs/microservices';

import { AuthModule } from '../auth/auth.module';
import { CheckerController } from './checker.controller';
import { CheckerService } from './checker.services';
import { ConfigModule } from '@nestjs/config';
import { EventController } from './event.controller';
import { EventGateway } from './event.gateway';
import { Module } from '@nestjs/common';
import { NotiService } from './notification.service';
import { ReportController } from './report.controller';

@Module({
    imports: [
        ConfigModule,
        AuthModule,
        ClientsModule.register([
            {
                name: 'MQTT_SERVICE',
                transport: Transport.MQTT,
                options: {
                    hostname: process.env.HOST_IP,
                    port: parseInt(process.env.MQTT_PORT),
                },
            },
        ]),
    ],
    controllers: [EventController, CheckerController, ReportController],
    providers: [EventGateway, NotiService, CheckerService],
})
export class EventModule {}
