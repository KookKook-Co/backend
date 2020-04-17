import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { cors: true });
    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.MQTT,
        options: {
            hostname: process.env.HOST_IP,
            port: parseInt(process.env.MQTT_PORT),
        },
    });
    await app.startAllMicroservicesAsync();
    await app.listen(process.env.PORT);
}
bootstrap();
