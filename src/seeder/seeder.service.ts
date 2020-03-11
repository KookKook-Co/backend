import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class SeederService {
    constructor(private readonly configService: ConfigService) {}

    private pool = new Pool({
        connectionString:
            process.env.DB_URI || this.configService.get<string>('DB_URI'),
    });

    seedUsers() {
        this.pool.query(
            'CREATE TABLE users(user_id SERIAL PRIMARY KEY, user_no INTEGER not null)',
        );
    }
}
