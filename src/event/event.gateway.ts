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

import { CheckerService } from './checker/checker.service';
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

    private weightedCenterRandom = (max, min, numDice, fixed) => {
        var num: number = min;
        for (var i = 0; i < numDice; i++) {
            num += Math.random() * ((max - min) / numDice);
        }
        return num.toFixed(fixed);
    };

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
        // const rand = () => parseFloat((Math.random() * 100).toFixed(1));

        const currentData = (): EnvironmentalData => {
            return {
                temperature: parseFloat(
                    this.weightedCenterRandom(35, 20, 5, 1),
                ),
                humidity: parseFloat(this.weightedCenterRandom(80, 50, 2, 1)),
                windspeed: parseFloat(
                    this.weightedCenterRandom(1.6, 1.4, 5, 2),
                ),
                ammonia: parseFloat(this.weightedCenterRandom(25, 0, 3, 1)),
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

        const send = async () => {
            const houseRealTimeData: RealTimeData[] = [];

            for (let i = 1; i <= 6; i++) {
                if (i === 1) {
                    // const { hno } = payload;

                    const hid = await this.dbService.getHidByHno(1);
                    const {
                        dateIn,
                    } = await this.dbService.getLatestChickenFlockInfoByHid(1);

                    const now = moment(new Date());
                    const chickenAge = moment
                        .duration(now.diff(moment(dateIn)))
                        .asDays();

                    const houseEnvInfo = await this.dbService.getLatestEnivonmentForEachSensorInHid(
                        1,
                    );

                    const houseEnv = houseEnvInfo.map(each => {
                        const { sid, timestamp, ...env } = each;
                        return {
                            sid,
                            irregularEnv: this.checkIrrEnv.getIrrEnv(
                                chickenAge,
                                env,
                            ),
                            environmentalData: env,
                        };
                    });
                    this.logger.log(`Age: ${chickenAge}`);
                    this.logger.log(houseEnv[0]);
                    houseRealTimeData.push(houseEnv[0]);
                } else {
                    const currData = currentData();
                    houseRealTimeData.push({
                        sid: i.toString(),
                        irregularEnv: this.checkIrrEnv.getIrrEnv(20, currData),
                        environmentalData: currData,
                    });
                }
            }
            // console.log(houseRealTimeData);
            client.emit('pipeRealTimeData', houseRealTimeData);
        };

        send();

        setInterval(() => {
            send();
        }, 3000);
    }

    @SubscribeMessage('sendEnvironmentalData')
    receiveRealtimeData(client: Socket, payload: any) {
        const { sid, environmentalData } = payload;
    }
}
