import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { cors: true });

    await app.listen(process.env.PORT, () => {
        // console.log(`Listening to localhost:${process.env.PORT}`);
    });
}
bootstrap();
