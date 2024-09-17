import {
    BadRequestException,
    HttpException,
    HttpStatus,
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
import { ChangePassword, ResetPasswordDto } from './dto/dto';
import { DatabaseService } from '../database/database.service';
import { createHmac, randomBytes } from 'crypto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private sessionService: SessionService,
        private databaseService: DatabaseService,
    ) {}

    async signIn(userDto: CreateUserDto): Promise<Tokens> {
        const user: User | null = await this.usersService.findUser({
            email: userDto.email,
        });
        if (!user) {
            throw new UserNotFoundException(userDto.email);
        }

        const passwordMatch = await this.compareHash(
            userDto.password,
            user.password,
        );

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

    async compareHash(plainText: string, hash: string) {
        return bcrypt.compare(plainText, hash);
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
        return await this.sessionService.deleteSession(refreshToken.token_id);
    }

    async changePassword(userToken: AccessToken, password: ChangePassword) {
        const user = await this.usersService.findUser({
            email: userToken.email,
        });

        if (!user) {
            throw new UserNotFoundException(userToken.email);
        }

        const passwordMatch = await this.compareHash(
            password.oldPassword,
            user.password,
        );

        if (!passwordMatch) {
            throw new HttpException('Incorrect password', HttpStatus.FORBIDDEN);
        }

        const hashNewPassword = await this.hashData(password.newPassword);

        await this.usersService.updateUser(userToken.id, {
            password: hashNewPassword,
        });

        await this.sessionService.invalidateUserSessions(userToken.id);

        return true;
    }

    async generateResetToken() {
        const resetToken = randomBytes(64).toString('base64');
        const resetTokenExpiry = new Date(Date.now() + 3600 * 1000);
        return { resetToken, resetTokenExpiry };
    }
    
    generateHMac(token: string) {
        const hmac = createHmac(
            'sha256',
            this.configService.get<string>('RESET_TOKEN_SECRET')!,
        )
            .update(token)
            .digest('base64');
        return hmac;
    }

    async requestPasswordReset(email: string) {
        const user = await this.usersService.findUser({ email: email });

        if (!user) {
            throw new UserNotFoundException(email);
        }

        const { resetToken, resetTokenExpiry } =
            await this.generateResetToken();

        const hashedResetToken = this.generateHMac(resetToken);

        await this.usersService.updateUser(user.id, {
            reset_token: hashedResetToken,
            reset_token_expires_at: resetTokenExpiry,
        });

        return { resetToken };
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto) {
        const hashedResetToken = this.generateHMac(resetPasswordDto.token);
        const user = await this.usersService.findUserByResetToken(hashedResetToken);

        if (!user) {
            throw new UnauthorizedException("Invalid or expired token");
        }

        if (!user.reset_token && user.reset_token_expires_at! < new Date()) {
            throw new UnauthorizedException('Invalid or expired token');
        }

        const match = hashedResetToken === user.reset_token;

        if (!match) {
            throw new UnauthorizedException('Invalid or expired token');
        }

        const newPassword = await this.hashData(resetPasswordDto.newPassword);

        await this.usersService.updateUser(user.id, {
            password: newPassword,
            reset_token: null,
            reset_token_expires_at: null,
        });

        await this.sessionService.invalidateUserSessions(user.id);
        return true;
    }
}
