import * as moment from 'moment';

import { EnvType, EnvironmentalData, RealTimeData } from './event.interfaces';
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { CheckerService } from './checker.service';
import { DbService } from '../db/db.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway()
export class EventGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private logger: Logger = new Logger('EventGateway');

    constructor(
        private readonly dbService: DbService,
        private readonly checkIrrEnv: CheckerService,
    ) {}

    @WebSocketServer()
    server: Server;

    afterInit() {
        this.logger.log('EventGateway successfully initialized');
    }

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
        return {
            event: 'InitConnection',
            message: 'Success',
        };
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
        return {
            event: 'CloseConnection',
            message: 'Success',
        };
    }

    @SubscribeMessage('getRealTimeData')
    async pipeData(client: Socket, payload: any) {
        // random
        const rand = () => parseFloat((Math.random() * 100).toFixed(1));

        const currentData = (): EnvironmentalData => {
            return {
                temperature: rand(),
                humidity: rand(),
                windspeed: rand(),
                ammonia: rand(),
            };
        };

        // const rndIrreg = (): EnvType[] => {
        //     const all = [
        //         EnvType.temperature,
        //         EnvType.humidity,
        //         EnvType.windspeed,
        //         EnvType.ammonia,
        //     ];

        //     return all.reduce((a, b) => {
        //         if (rand() < 5) a.push(b);
        //         return a;
        //     }, []);
        // };

        // random

        // const { hno } = payload;

        // const hid = await this.dbService.getHidByHno(hno);
        // const { dateIn } = await this.dbService.getLatestChickenFlockInfoByHid(
        //     hid,
        // );

        // const now = moment(new Date());
        // const chickenAge = moment.duration(now.diff(moment(dateIn))).asDays();

        // setInterval(async () => {
        //     const houseEnvInfo = await this.dbService.getLatestEnivonmentForEachSensorInHid(
        //         hid,
        //     );

        //     const houseEnv = houseEnvInfo.map(each => {
        //         const { sid, timestamp, ...env } = each;
        //         return {
        //             sid,
        //             irregularEnv: this.checkIrrEnv.getIrrEnv(chickenAge, env),
        //             environmentalData: env,
        //         };
        //     });

        //     client.emit('pipeRealTimeData', houseEnv);
        // }, 5000);

        setInterval(() => {
            const houseRealTimeData: RealTimeData[] = [];

            for (let i = 1; i <= 6; i++) {
                const currData = currentData();
                houseRealTimeData.push({
                    sid: i.toString(),
                    irregularEnv: this.checkIrrEnv.getIrrEnv(10, currData),
                    environmentalData: currData,
                });
            }
            // console.log(houseRealTimeData);
            client.emit('pipeRealTimeData', houseRealTimeData);
        }, 5000);
    }

    @SubscribeMessage('sendEnvironmentalData')
    receiveRealtimeData(client: Socket, payload: any) {
        const { sid, environmentalData } = payload;
    }
}
