import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { Logger } from '@nestjs/common';
import { RealtimeData } from './event.interfaces';

@WebSocketGateway()
export class EventGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private logger: Logger = new Logger('EventGateway');

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

    @SubscribeMessage('getRealtimeData')
    handleMessage(client: Socket, payload: any) {
        const { hno } = payload;
        setInterval(() => {
            const rand = () => Math.random() * 100;

            const currentData = (): RealtimeData => {
                return {
                    temperature: rand(),
                    humidity: rand(),
                    windSpeed: rand(),
                    ammonia: rand(),
                };
            };

            const realtimeData = [];

            for (let i = 1; i < 3; i++) {
                for (let j = 1; j <= 3; j++) {
                    realtimeData.push({
                        xPosSen: i,
                        yPosSen: j,
                        environmentalData: currentData(),
                    });
                }
            }
            client.emit('pipeRealtimeData', realtimeData);
        }, 2000);
    }
}
