import * as request from 'request';

import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class NotiService {
    constructor(private readonly configService: ConfigService) {}

    sendLineMsg(hno, type, value) {
        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.configService.get<string>(
                'LINE_BOT_TOKEN',
            ) || process.env.LINE_BOT_TOKEN}`,
        };
        const body = JSON.stringify({
            to: `${this.configService.get<string>('LINE_GROUPID') ||
                process.env.LINE_GROUPID}`,
            messages: [
                {
                    type: 'text',
                    text: `Warning !!! House ${hno} has irregular ${type} condition. \nCurrent ${type} is ${value}.`,
                },
            ],
        });
        request.post(
            {
                url: 'https://api.line.me/v2/bot/message/push',
                headers: headers,
                body: body,
            },
            (err, res, body) => {
                // console.log('status = ' + res.statusCode);
                if (err) {
                    console.log('error: ' + err);
                } else {
                    // console.log(res);
                    // console.log('body: ' + body);
                }
            },
        );
    }
}
