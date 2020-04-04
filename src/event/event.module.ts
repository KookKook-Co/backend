import { AuthModule } from '../auth/auth.module';
import { CheckIrrEnvService } from './checkIrrEnv.services';
import { ConfigModule } from '@nestjs/config';
import { EventController } from './event.controller';
import { EventGateway } from './event.gateway';
import { Module } from '@nestjs/common';
import { NotiService } from './noti.service';

@Module({
    imports: [ConfigModule, AuthModule],
    controllers: [EventController],
    providers: [EventGateway, NotiService, CheckIrrEnvService],
})
export class EventModule {}
