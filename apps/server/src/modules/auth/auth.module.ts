import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from './auth.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [UsersModule, 
    JwtModule.registerAsync({
      global: true, 
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET"),
        signOptions: {expiresIn: "1000s", }

      }),
      inject: [ConfigService]
    })
  ],
  controllers: [AuthController],
  providers: [AuthService,{provide: APP_GUARD, useClass: AuthGuard}, ConfigService, AuthGuard],
})
export class AuthModule {}
