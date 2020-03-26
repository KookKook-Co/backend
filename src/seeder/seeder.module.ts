import { ConfigModule } from '@nestjs/config';
import { DbModule } from '../db/db.module';
import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service';

@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true }), DbModule],
    providers: [SeederService],
    exports: [SeederService],
})
export class SeederModule {}
