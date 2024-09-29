import { Prisma , User} from "@prisma/client";
import { User } from "@server/modules/users/entities/user.entity";

type Tokens = {
    access_token?: string; 
    refresh_token?: string
}

type JwtToken = {
    sub: string;
    exp: number;
    iat: number
}


type AccessTokenPayload = {
    email: string;
    first_name?: string | null;
    last_name?: string | null;
    username?: string | null;
}



interface AccessTokenDTO extends JwtToken  {

    data: AccessTokenPayload
}

interface AccessToken extends AccessTokenPayload {
    id: string;
}

type RefreshTokenPayload = {
    token_id: string
}

interface RefreshTokenDto extends JwtToken {
    jti: string;
}

interface RefreshToken {
    id: string;
    token_id: string;
    refresh_token: string
}