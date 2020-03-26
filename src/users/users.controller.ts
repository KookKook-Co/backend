import { Controller, Post, Body, Res, Get, UseGuards } from '@nestjs/common';
import { User, CreateUserDTO, Role } from './users.interfaces';
import { Response } from 'express';
import { RolesGuard } from '../guard/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../decorator/roles.decorator';
import { DbService } from '../db/db.service';

@Controller('users')
export class UsersController {
    constructor(private readonly dbService: DbService) {}

    @Roles(Role.OWNER)
    @UseGuards(AuthGuard(), RolesGuard)
    @Post()
    async createAccount(
        @Body() createUserDTO: CreateUserDTO,
        @Res() res: Response,
    ) {
        try {
            const createAccount = (data: any) => true as any;

            const payload = await createAccount(createUserDTO);
            res.status(200).send(payload);
        } catch (err) {
            res.status(400).send(err);
        }
    }

    @Roles(Role.OWNER)
    @UseGuards(AuthGuard(), RolesGuard)
    @Get('')
    async fetchAllAccounts() {
        return true;
    }

    @Roles(Role.OWNER)
    @UseGuards(AuthGuard(), RolesGuard)
    @Post('update')
    async updateUser() {
        return true;
    }

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
