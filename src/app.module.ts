import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { DbService } from './db/db.service';
import { EventModule } from './event/event.module';
import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';

@Module({
    imports: [
        AuthModule,
        ConfigModule.forRoot({ isGlobal: true }),
        EventModule,
        UsersModule,
    ],
    controllers: [AppController],
    providers: [AppService, DbService],
})
export class AppModule {}
