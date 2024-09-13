import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(JwtStrategy, "jwt-refresh") {
    constructor(private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>("JWT_REFRESH_SECRET")
        })
    }

    async validate(payload: any) {
        return {userId: payload.sub, username: payload.username}
    }
}