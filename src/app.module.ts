import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from './db/db.module';
import { EventModule } from './event/event.module';
import { Module } from '@nestjs/common';
import { SeederModule } from './seeder/seeder.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { UsersModule } from './users/users.module';
import { join } from 'path';

@Module({
    imports: [
        AuthModule,
        ConfigModule.forRoot({ isGlobal: true }),
        DbModule,
        EventModule,
        UsersModule,
        SeederModule,
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'client'),
        }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
