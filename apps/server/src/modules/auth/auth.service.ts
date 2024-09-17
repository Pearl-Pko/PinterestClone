import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import {
    UserAlreadyExists,
    UserNotFoundException,
} from '@server/common/exceptions/exceptions';
import * as bcrypt from 'bcrypt';
import { SessionService } from '../session/session.service';
import {
    AccessToken,
    AccessTokenPayload,
    RefreshToken,
    RefreshTokenDto,
    Tokens,
} from '@server/types/auth';

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

        const passwordMatch = await this.comparePassword(
            userDto.password,
            user.password,
        );
        console.log('password match', passwordMatch);
        if (!passwordMatch) {
            throw new NotFoundException('Incorrect password');
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
        const token_id = uuidv4();
        const { accessToken, refreshToken } = await this.getTokens(
            user.id,
            user,
            token_id,
        );

        const hashedRefreshToken = await this.hashData(refreshToken);

        this.sessionService.createSession({
            token_hash: hashedRefreshToken,
            expires_at: new Date(),
            user_id: user.id,
            id: token_id,
        });
        return { access_token: accessToken, refresh_token: refreshToken };
    }

    async validateUser(
        email: string,
        password: string,
    ): Promise<AccessTokenPayload | null> {
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

    async getTokens(userId: string, user: AccessToken, token_id: string) {
        const [accessToken, refreshToken] = await Promise.all([
            this.generateAccessToken(user),
            this.generateRefreshToken(user, token_id),
        ]);
        return { accessToken, refreshToken };
    }

    async generateAccessToken(user: AccessToken) {
        return this.jwtService.signAsync(
            {
                sub: user.id,
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
        );
    }

    async generateRefreshToken(user: AccessToken, token_id: string) {
        return this.jwtService.signAsync(
            {
                sub: user.id,
                data: {
                    token_id: token_id,
                },
            },
            {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
                expiresIn: this.configService.get<string>(
                    'JWT_REFRESH_TOKEN_EXPIRES_IN',
                ),
            },
        );
    }

    async refreshToken(refreshToken: RefreshToken) {
        const user = await this.sessionService.verifySession(
            refreshToken.id,
            refreshToken.token_id,
            refreshToken.refresh_token,
        );

        return this.generateAccessToken(user);
    }

    async logout(refreshToken: RefreshToken) {
        return await this.sessionService.deleteSession(refreshToken.token_id)
    }
}
