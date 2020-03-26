import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from './db/db.module';
import { EventModule } from './event/event.module';
import { Module } from '@nestjs/common';
import { SeederModule } from './seeder/seeder.module';
import { UsersModule } from './users/users.module';

@Module({
    imports: [
        AuthModule,
        ConfigModule.forRoot({ isGlobal: true }),
        DbModule,
        EventModule,
        UsersModule,
        SeederModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
