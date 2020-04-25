import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';
import { SeederService } from './seeder/seeder.service';

@Controller()
export class AppController {
    constructor(
        private readonly appService: AppService,
        private readonly seederService: SeederService,
    ) {}

    @Get('dropdb')
    async deleteDb() {
        // await this.seederService.dropDatabaseUser();
        // await this.seederService.dropDatabase();
        await this.seederService.dropAllTable();
    }
}
