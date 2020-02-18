import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class DbService {
    constructor(private readonly configService: ConfigService) {}

    private pool = new Pool({
        connectionString: this.configService.get<string>('DB_URI'),
    });

    createUser() {
        return true;
    }
}
