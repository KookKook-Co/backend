import { Controller, Post, Body, Res, Get, UseGuards } from '@nestjs/common';
import { User, CreateUserDto, Role } from './users.interfaces';
import { Response } from 'express';
import { RolesGuard } from '../guard/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../decorator/roles.decorator';

@Controller('users')
export class UsersController {
    @Roles(Role.ADMIN, Role.OWNER)
    @UseGuards(AuthGuard(), RolesGuard)
    @Post('create')
    async createAccount(@Body() body: CreateUserDto, @Res() res: Response) {
        const createUser = (data: CreateUserDto): Promise<any> => {
            return new Promise(res => {
                const user = { ...data };
                res(user);
            });
        };
        try {
            const payload = await createUser(body);
            res.status(200).send(payload);
        } catch (err) {
            res.status(400).send(err);
        }
    }

    @Roles(Role.ADMIN, Role.OWNER)
    @UseGuards(AuthGuard(), RolesGuard)
    @Get('all')
    async fetchAllAccounts() {
        return true;
    }

    @Roles(Role.ADMIN, Role.OWNER)
    @UseGuards(AuthGuard(), RolesGuard)
    @Post('update')
    async updateUser() {
        return true;
    }

    @Roles(Role.ADMIN)
    @UseGuards(AuthGuard(), RolesGuard)
    @Post('delete')
    async deleteUser() {
        return true;
    }

    @UseGuards(AuthGuard())
    @Get('profile')
    async getProfile() {
        return true;
    }
}
