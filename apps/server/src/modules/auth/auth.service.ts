import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) {}

    async signIn(user: any): Promise<{ access_token: string }> {

        const payload = { sub: user.userId, username: user.username };

        return {
            access_token: this.jwtService.sign(payload)
        };
    }

    async validateUser(username: string, password: string): Promise<any> {
        const user = await this.usersService.findOne(username);

        console.log("nah");
        if (user && user.password === password) {
            const {password, ...result} = user;
            return result;
        }
        return null;
    }
}
