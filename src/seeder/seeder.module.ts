import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service';

@Module({
    imports: [ConfigModule.forRoot()],
    providers: [SeederService],
})
export class SeederModule {}
