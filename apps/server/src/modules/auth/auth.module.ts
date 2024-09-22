import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategy/local.strategy';
import { AccessTokenGuard } from './guards/access-auth.guard';
import { AccessTokenStrategy } from './strategy/jwt.strategy';
import { RefreshTokenStrategy } from './strategy/refresh.strategy';
import { SessionModule } from '../session/session.module';
import { MailModule } from '../mail/mail.module';

@Module({
    imports: [
        UsersModule,
        PassportModule,
        SessionModule,
        MailModule,
        JwtModule.registerAsync({
            global: true,
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_ACCESS_SECRET'),
                
                signOptions: { expiresIn: configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES_IN') },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,

        { provide: APP_GUARD, useClass: AccessTokenGuard },
        ConfigService,
        LocalStrategy,
        AccessTokenStrategy,
        RefreshTokenStrategy
    ],
})
export class AuthModule {}
