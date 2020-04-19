import { Controller, UseGuards, Post, Body, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { HousesGuard } from '../guard';
import { Report } from './event.interfaces';
import { DbService } from '../db/db.service';
import * as nodemailer from 'nodemailer';

@Controller('report')
export class ReportController {
    constructor(private readonly dbService: DbService) {}

    private checkList = {
        [Report.ENVIRONMENT]: this.dbService.getMaxMinEnvironmentalDataReport,
        [Report.FOOD]: this.dbService.getFoodConsumptionReport,
        [Report.WATER]: this.dbService.getWaterConsumptionReport,
        [Report.MEDICINE]: this.dbService.getMedicineConsumptionReport,
        [Report.CHICKEN]: this.dbService.getDeadChickenReport,
    };

    @UseGuards(AuthGuard(), HousesGuard)
    @Post()
    async getEnvDataReport(@Body() body, @Res() res) {
        try {
            const { hno, generation, email, reports } = body;
            const hid = await this.dbService.getHidByHno(hno);
            const result = await Promise.all(
                reports.map(report => this.checkList[report](hid, generation)),
            );

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD,
                },
            });

            const info = await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: `Chicken Report (Generation: ${generation})`,
                attachments: result.map(each => {
                    return {
                        path: `csv/${each}`,
                    };
                }),
            });

            res.send({
                payload: {
                    data: {
                        email,
                    },
                },
            });
        } catch (err) {
            res.status(888).send({
                payload: {
                    err,
                },
            });
        }
    }
}
