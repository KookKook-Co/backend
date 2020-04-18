import {
    Controller,
    Post,
    Body,
    Res,
    Get,
    UseGuards,
    Query,
    Put,
    Delete,
    Req,
} from '@nestjs/common';
import { CreateUserDTO } from './users.interfaces';
import { Response } from 'express';
import { RolesGuard } from '../guard/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { DbService } from '../db/db.service';
import { CreateUserInput } from '../db/db.interfaces';

import * as bcrypt from 'bcrypt';

@Controller('users')
export class UsersController {
    constructor(private readonly dbService: DbService) {}

    @UseGuards(AuthGuard(), RolesGuard)
    @Get()
    async fetchAllAccounts(@Query('hno') hno, @Res() res) {
        const hid = await this.dbService.getHidByHno(hno);
        // const {hashedPwd} = await this.dbService.getAllUsersInfoByHid(hid);
        res.send({});
    }

    @UseGuards(AuthGuard())
    @Get('currentuser')
    async getUserInfo(@Req() req, @Res() res) {
        const { uid } = req.user;
        const {
            isCurrentUser,
            hashedPwd,
            ...remains
        } = await this.dbService.getUserByUid(uid);
        res.send({ ...remains, hno: remains.hid });
    }

    @UseGuards(AuthGuard(), RolesGuard)
    @Post()
    async createAccount(
        @Body() createUserDTO: CreateUserDTO,
        @Res() res: Response,
    ) {
        try {
            const { user, hno } = createUserDTO;
            const { password, ...userInfo } = user;
            const hid = await this.dbService.getHidByHno(hno);
            const createUserInput: CreateUserInput = {
                ...userInfo,
                hashedPwd: bcrypt.hashSync(password, 1),
                isCurrentUser: true,
                hid,
            };
            await this.dbService.createUser(createUserInput);
            res.status(200).send('Success');
        } catch (err) {
            res.status(400).send(err);
        }
    }

    @UseGuards(AuthGuard(), RolesGuard)
    @Put()
    async updateUser(@Body() body) {
        // Wait Frontend & DB
        return true;
    }

    @UseGuards(AuthGuard(), RolesGuard)
    @Delete()
    async deleteUser(@Query('uid') uid, @Res() res) {
        try {
            await this.dbService.deleteUserByUid(uid);
            res.send('Success');
        } catch (err) {
            res.status(200).send(err);
        }
    }
}
