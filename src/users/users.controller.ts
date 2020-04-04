import { Controller, Post, Body, Res, Get, UseGuards } from '@nestjs/common';
import { CreateUserDTO } from './users.interfaces';
import { Response } from 'express';
import { RolesGuard } from '../guard/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { DbService } from '../db/db.service';
import { CreateUserInput } from '../db/db.interfaces';

@Controller('users')
export class UsersController {
    constructor(private readonly dbService: DbService) {}

    @UseGuards(AuthGuard(), RolesGuard)
    @Post()
    async createAccount(
        @Body() createUserDTO: CreateUserDTO,
        @Res() res: Response,
    ) {
        try {
            const { user, hno } = createUserDTO;
            const hid = await this.dbService.getHidByHno(hno);
            const createUserInput: CreateUserInput = {
                ...user,
                isCurrentUser: true,
                hid,
            };
            const payload = await this.dbService.createUser(createUserInput);
            res.status(200).send(payload);
        } catch (err) {
            res.status(400).send(err);
        }
    }

    @UseGuards(AuthGuard(), RolesGuard)
    @Get('')
    async fetchAllAccounts() {
        return true;
    }

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
