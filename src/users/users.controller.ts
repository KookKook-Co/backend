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
    UseInterceptors,
    UploadedFile,
    Logger,
} from '@nestjs/common';
import { CreateUserDTO, UpdateUserDTO } from './users.interfaces';
import { Response } from 'express';
import { RolesGuard } from '../guard/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { DbService } from '../db/db.service';
import { CreateUserInput } from '../db/db.interfaces';
import { FileInterceptor } from '@nestjs/platform-express';
import { v4 as uuidv4 } from 'uuid';

import * as bcrypt from 'bcryptjs';
import { FileService } from './files.service';

@Controller('users')
export class UsersController {
    constructor(
        private readonly dbService: DbService,
        private readonly fileService: FileService,
    ) {}

    private logger: Logger = new Logger('UserController');

    @UseGuards(AuthGuard(), RolesGuard)
    @Get()
    async fetchAllAccounts(@Query('hno') hno, @Res() res) {
        const hid = await this.dbService.getHidByHno(hno);
        const uids = await this.dbService.getAllUsersIDByHid(hid);
        const result = await Promise.all(
            uids.map(async each => {
                const {
                    hashedPwd,
                    isCurrentUser,
                    ...remains
                } = await this.dbService.getUserByUid(each);
                return { ...remains, hno: remains.hid };
            }),
        );
        res.send(result);
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
    @UseInterceptors(FileInterceptor('image'))
    @Post()
    async createAccount(
        @UploadedFile() img,
        @Body() createUserDTO: CreateUserDTO,
        @Res() res: Response,
    ) {
        try {
            const user = await this.dbService.getUserByUsername(
                createUserDTO.username,
            );

            if (user === undefined || user === null) {
                console.log(img);
                const uuid = uuidv4();
                await this.fileService.uploadFile(img.buffer, uuid);
                const imageUrl = this.fileService.getFile(uuid);
                console.log(imageUrl);
                console.log(createUserDTO);

                const { password, hno, ...userInfo } = createUserDTO;

                const createUserInput: CreateUserInput = {
                    ...userInfo,
                    hashedPwd: bcrypt.hashSync(password, 1),
                    imageUrl,
                    isCurrentUser: true,
                    hid: hno,
                };

                console.log(createUserInput);

                await this.dbService.createUser(createUserInput);
                res.status(200).send(imageUrl);
            } else {
                res.status(409).send('Duplicated Username');
            }
        } catch (err) {
            console.log(err);
            res.status(400).send(err);
        }
    }

    @UseGuards(AuthGuard(), RolesGuard)
    @Put()
    async updateUser(@Body() body: UpdateUserDTO, @Res() res) {
        try {
            // console.log(body);
            const { uid, ...user } = body;
            await this.dbService.updateUserInfo(uid, user);
            res.status(200).send('Success');
        } catch (err) {
            console.log(err);
            res.status(400).send(err);
        }
    }

    @UseGuards(AuthGuard(), RolesGuard)
    @Put('password')
    async resetPassword(@Body() body, @Res() res) {
        try {
            this.logger.log(body, '/PUT password');
            const { uid, password } = body;
            const hashedPwd = bcrypt.hashSync(password, Math.random());
            await this.dbService.resetUserPassword(uid, hashedPwd);
            res.status(200).send('Success');
        } catch (err) {
            res.status(400).send(err);
        }
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
