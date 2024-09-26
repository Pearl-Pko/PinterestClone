import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "../auth.service";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UserWithEmailNotFoundException } from "@server/common/exceptions/exceptions";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, "local") {
    constructor(private authService: AuthService) {
        super({
            usernameField: "email"
        });
    }

    async validate(email: string, password: string): Promise<any> {
        console.log(email, password);
        const user = await this.authService.validateUser(email, password);
        if (!user) {
            throw new UserWithEmailNotFoundException(email);
        }


        return user;
    }

}