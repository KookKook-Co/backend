import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeder/seeder.module';
import { SeederService } from './seeder/seeder.service';

async function bootstrap() {
    console.log('Running "seed.ts"');
    console.log('Please run this file in development environment only');
    const app = await NestFactory.create(SeederModule);
    const seeder = app.get(SeederService);
    // await seeder.seedNewDatabase();
    // await seeder.seedNewDatabaseUser();
    await seeder.seedTableConstraint();
    await seeder.seedIndexTable();
    await seeder.seedSampleDataSet3();
    app.close();
}

bootstrap();
