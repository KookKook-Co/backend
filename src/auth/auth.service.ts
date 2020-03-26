import * as bcrypt from 'bcrypt';

import { DbService } from '../db/db.service';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/users.interfaces';

@Injectable()
export class AuthService {
    constructor(
        private readonly dbService: DbService,
        private readonly jwtService: JwtService,
    ) {}

    async validateUser(username: string, password: string): Promise<any> {
        const dbGetUser = async data => true as any;

        const user = await dbGetUser(username);
        if (await bcrypt.compare(password, user.pwd)) {
            const { pwd, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: User) {
        try {
            const dbGetUser = async uid => true as any;

            const { uid, imageUrl, responsible_house, role } = await dbGetUser(
                user.uid,
            );
            const payload = {
                uid,
                responsible_house,
                role,
            };
            const access_token = this.jwtService.sign(payload);
            return {
                access_token,
                imageUrl,
                responsible_house,
                role,
            };
        } catch (err) {
            console.log(err);
        }
    }
}
