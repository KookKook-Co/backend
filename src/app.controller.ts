import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';
import { SeederService } from './seeder/seeder.service';

@Controller()
export class AppController {
    constructor(
        private readonly appService: AppService,
        private readonly seederService: SeederService,
    ) {}
    @Get()
    getHello() {
        return this.appService.getHello();
    }

    @Get('/dropdb')
    async deleteDb() {
        return await this.seederService.dropAllTable();
    }
}
