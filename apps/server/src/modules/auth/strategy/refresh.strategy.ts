import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { JwtToken, RefreshToken, RefreshTokenDto } from '@server/types/auth';
import { Request } from 'express';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
    JwtStrategy,
    'jwt-refresh',
) {
    constructor(private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                ExtractJwt.fromAuthHeaderAsBearerToken(),
                (req) => {
                    const token = req.cookies['refresh_token'];
                    return token;
                },
            ]),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
            passReqToCallback: true,
        });
    }

    validate(req: Request, payload: RefreshTokenDto): RefreshToken {
        const refreshToken =
            req.get('Authorization')?.replace('Bearer', '').trim()! ||
            req.cookies['refresh_token'];
        return {
            id: payload.sub,
            token_id: payload.jti,
            refresh_token: refreshToken,
        };
    }
}
