import { Prisma , User} from "@prisma/client";
import { RefreshTokenDto } from "@schema/auth";
import { ApiResponse } from "@schema/util";
import { User } from "@server/modules/users/entities/user.entity";

type Tokens = {
    access_token?: string; 
    refresh_token?: string
}

type UserTokenResponse = {
    data: User, 
    newUser?: boolean
} & Tokens;

type UserSessionTokenResponse = UserTokenResponse & ApiResponse;


interface RefreshToken extends RefreshTokenDto {
    token: string
}