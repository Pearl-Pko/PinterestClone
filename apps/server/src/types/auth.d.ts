import { Prisma , User} from "@prisma/client";
import { User } from "@server/modules/users/entities/user.entity";

type Tokens = {
    access_token: string; 
    refresh_token: string
}

type JwtToken = {
    sub: string;
    data: Token;
    exp: number;
    iat: number
}

interface Token  {
    email: string;
    first_name?: string | null;
    last_name?: string | null;
    username?: string | null;
}