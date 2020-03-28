import * as bcrypt from 'bcrypt';

import { User, UserPayload } from '../users/users.interfaces';

import { DbService } from '../db/db.service';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UsersService,
        private readonly dbService: DbService,
        private readonly jwtService: JwtService,
    ) {}

    async validateUser(
        username: string,
        password: string,
    ): Promise<User | null> {
        const { hashedPwd, ...result } = await this.userService.findOne(
            username,
        );
        return (await bcrypt.compare(password, hashedPwd)) ? result : null;
    }

    async login(user: User) {
        try {
            const { uid } = user;
            const {
                imageUrl,
                hno,
                role,
            } = await this.dbService.getLoginUserInfo(uid);
            const payload: UserPayload = {
                uid,
                hno,
                role,
            };
            const access_token = this.jwtService.sign(payload);
            return {
                access_token,
                imageUrl,
                hno,
                role,
            };
        } catch (err) {
            console.log(err);
        }
    }
}
