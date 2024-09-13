import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '@prisma/client';
import {
    UserAlreadyExists,
    UserNotFoundException,
} from '@server/common/exceptions/exceptions';
import * as bcrypt from 'bcrypt';
import { SessionService } from '../session/session.service';
import { Token, Tokens } from '@server/types/auth';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private sessionService: SessionService,
    ) {}

    async signIn(userDto: CreateUserDto): Promise<Tokens> {
        const user: User | null = await this.usersService.findUser({
            email: userDto.email,
        });
        if (!user) {
            throw new UserNotFoundException(userDto.email);
        }

        const passwordMatch = this.comparePassword(
            userDto.password,
            user.password,
        );
        if (!passwordMatch) {
            throw new BadRequestException('Incorrect password');
        }

        return this.createUserSession(user);
    }

    async signUp(user: CreateUserDto): Promise<Tokens> {
        const userExists: User | null = await this.usersService.findUser({
            email: user.email,
        });
        if (userExists) {
            throw new UserAlreadyExists();
        }

        const hashPassword = await this.hashData(user.password);
        const newUser = await this.usersService.create({
            email: user.email,
            password: hashPassword,
        });

        return this.createUserSession(newUser);
    }

    async createUserSession(user: User): Promise<Tokens> {
        const { accessToken, refreshToken } = await this.getTokens(
            user.id,
            user,
        );

        const hashedRefreshToken = await this.hashData(refreshToken);

        this.sessionService.createSession({
            refresh_token_hash: hashedRefreshToken,
            expires_at: new Date(),
            userId: user.id,
        });
        return { access_token: accessToken, refresh_token: refreshToken };
    }

    async validateUser(email: string, password: string): Promise<Token | null> {
        const user = await this.usersService.findUser({ email });

        const hashPassword = await this.hashData(password);

        if (user && user.password === hashPassword) {
            return {
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                username: user.username,
            };
        }
        return null;
    }

    async hashData(data: string): Promise<string> {
        const saltRounds = 10;
        return await bcrypt.hash(data, saltRounds);
    }

    async comparePassword(password: string, hashedPassword: string) {
        return bcrypt.compare(password, hashedPassword);
    }

    async getTokens(userId: string, user: Token) {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(
                {
                    sub: userId,
                    data: {
                        email: user.email,
                        first_name: user.first_name,
                        last_name: user.first_name,
                        username: user.username,
                    },
                },
                {
                    secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
                    expiresIn: this.configService.get<string>(
                        'JWT_ACCESS_TOKEN_EXPIRES_IN',
                    ),
                },
            ),
            this.jwtService.signAsync(
                { sub: userId },
                {
                    secret: this.configService.get<string>(
                        'JWT_REFRESH_SECRET',
                    ),
                    expiresIn: this.configService.get<string>(
                        'JWT_REFRESH_TOKEN_EXPIRES_IN',
                    ),
                },
            ),
        ]);
        return { accessToken, refreshToken };
    }
}
