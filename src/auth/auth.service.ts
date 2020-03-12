/* eslint-disable @typescript-eslint/camelcase */
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/users.interfaces';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) {}

    async validateUser(username: string, pass: string): Promise<any> {
        const user: User = await this.usersService.findOne(username);

        if (user && user.password === pass) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = {
            username: user.username,
            sub: user.userId,
            role: user.role,
        };
        const access_token = this.jwtService.sign(payload);
        const dbGetResponsibleHouse = async () => true as any;
        const responsible_house: number = await dbGetResponsibleHouse();
        return {
            access_token,
            responsible_house,
        };
    }
}
