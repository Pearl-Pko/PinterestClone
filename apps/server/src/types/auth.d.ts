import { Prisma , User} from "@prisma/client";
import { RefreshTokenDto } from "@schema/auth";
import { User } from "@server/modules/users/entities/user.entity";

type Tokens = {
    access_token?: string; 
    refresh_token?: string
}

interface RefreshToken extends RefreshTokenDto {
    token: string
}