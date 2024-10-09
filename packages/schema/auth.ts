import {User} from "@prisma/client";
import {Expose} from "class-transformer";

export type JwtToken = {
    sub: string;
    exp: number;
    iat: number;
};

export class AccessTokenClaims implements Partial<User> {
    @Expose()
    email: string;

    @Expose()
    first_name: string | null;

    @Expose()
    last_name: string | null;

    @Expose()
    username: string;
}

export interface AccessTokenDTO extends JwtToken, AccessTokenClaims {}


export interface RefreshTokenDto extends JwtToken {
    jti: string;
}
