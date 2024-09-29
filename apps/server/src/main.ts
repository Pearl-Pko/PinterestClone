import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { LoggingInterceptor } from './interceptors/logger-interceptor';


async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(new ValidationPipe({ transform: true,  whitelist: true }));
    app.useGlobalInterceptors(new LoggingInterceptor());
    app.use(cookieParser())
    
    await app.listen(process.env.PORT || 4000);
}
bootstrap();
