import { ConfigModule } from '@nestjs/config';
import { DbService } from '../db/db.service';
import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service';

@Module({
    imports: [ConfigModule.forRoot()],
    providers: [SeederService, DbService],
})
export class SeederModule {}
