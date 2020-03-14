import { DbService } from './db/db.service';
import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeder/seeder.module';
import { SeederService } from './seeder/seeder.service';

async function bootstrap() {
    console.log('Running "seed.ts"');
    console.log('Please run this file in development environment only');
    const app = await NestFactory.create(SeederModule);
    const seeder = app.get(SeederService);
    await seeder.seedTableConstraint();
    await seeder.seedAddSampleData();
    // const testDbService = app.get(DbService);
    // console.log((await testDbService.deleteUser('worker1', 'kookkook')).rows);
    app.close();
}

bootstrap();
