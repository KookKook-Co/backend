import * as request from 'request';

import { ConfigService } from '@nestjs/config';
import { EnvType } from './event.interfaces';
import { Injectable } from '@nestjs/common';

@Injectable()
export class NotiService {
    constructor(private readonly configService: ConfigService) {}

    private topics = {
        [EnvType.temperature]: 'TEMPERATURE',
        [EnvType.ammonia]: 'AMMONIA CONCENTRATION',
        [EnvType.humidity]: 'HUMIDITY',
        [EnvType.windspeed]: 'WINDSPEED',
    };

    private units = {
        [EnvType.temperature]: '°C',
        [EnvType.ammonia]: 'ppm',
        [EnvType.humidity]: '%RH',
        [EnvType.windspeed]: 'm/s',
    };

    private images = {
        [EnvType.temperature]:
            'https://static.bhphotovideo.com/explora/sites/default/files/styles/top_shot/public/Color-Temperature.jpg?itok=yHYqoXAf',
        [EnvType.ammonia]:
            'https://media.discordapp.net/attachments/690441617080844359/703681776593141800/ammonia.jpg?width=1220&height=686',
        [EnvType.humidity]:
            'https://media.discordapp.net/attachments/690441617080844359/703681763872080012/humidity.jpg?width=1220&height=686',
        [EnvType.windspeed]:
            'https://media.discordapp.net/attachments/690441617080844359/703681755261173780/windspeed.jpg?width=1220&height=686',
    };

    sendLineMsg(hno, type: EnvType, value) {
        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.LINE_BOT_TOKEN}`,
        };
        const body = JSON.stringify({
            to: `${process.env.LINE_GROUPID}`,
            messages: [
                {
                    type: 'text',
                    text: `Warning !!! House ${hno} has irregular ${type} condition. \nCurrent ${type} is ${value} ${this.units[type]}.`,
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
                    console.log('body: ' + body);
                }
            },
        );
    }

    sendLineMessage(hno, type: EnvType, value) {
        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.LINE_BOT_TOKEN}`,
        };
        const body = JSON.stringify({
            to: `${process.env.LINE_GROUPID}`,
            messages: [
                {
                    type: 'template',
                    altText: `WARNING! [HOUSE ${hno}] IRR ENV`,
                    template: {
                        type: 'buttons',
                        actions: [
                            {
                                type: 'uri',
                                label: 'View Dashboard',
                                uri: 'http://128.199.211.41',
                            },
                        ],
                        thumbnailImageUrl: `${this.images[type]}`,
                        title: `WARNING!\nIRREGULAR ${this.topics[type]}`,
                        text: `House ${hno} ${type} is ${value} ${this.units[type]}.`,
                    },
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
                    // console.log('body: ' + body);
                }
            },
        );
    }
}
