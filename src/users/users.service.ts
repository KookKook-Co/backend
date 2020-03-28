import { DbService } from '../db/db.service';
import { Injectable } from '@nestjs/common';
import { User } from './users.interfaces';

@Injectable()
export class UsersService {
    constructor(private readonly dbService: DbService) {}

    async findOne(username: string): Promise<User> {
        return this.dbService.getUserByUsername(username);
    }
}
