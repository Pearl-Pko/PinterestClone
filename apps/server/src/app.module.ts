import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { DatabaseModule } from './modules/database/database.module';
import { PostsModule } from './modules/posts/posts.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './interceptors/logger-interceptor';
import { AuthModule } from './modules/auth/auth.module';
import { MailModule } from './modules/mail/mail.module';
import { BullModule } from '@nestjs/bullmq';
import { config } from 'process';
import { BullConfigService } from './config/bull.config';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
    
        BullModule.forRootAsync({
            useClass: BullConfigService
        }),
        // BullModule.forRoot({
        //     connection: {
        //         host: "172.24.54.59",
        //         port: 6379
        //     }
        // }),
        UsersModule,
        DatabaseModule,
        PostsModule,
        AuthModule,
        MailModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        // {
        //     provide: APP_INTERCEPTOR,
        //     useClass: LoggingInterceptor,
        // },
    ],
})
export class AppModule {}
