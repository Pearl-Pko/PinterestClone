import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import {
    AccessToken,
    JwtToken,
    AccessTokenPayload,
    AccessTokenDTO,
} from '@server/types/auth';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(JwtStrategy, 'jwt') {
    constructor(private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                ExtractJwt.fromAuthHeaderAsBearerToken(),
                (req) => {
                    const token = req.cookies['access_token'];
                    return token;
                },
            ]),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),
        });
    }

    validate(payload: AccessTokenDTO): AccessToken {
        return { id: payload.sub, ...payload.data };
    }
}
