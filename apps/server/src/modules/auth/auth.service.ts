import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    HttpException,
    HttpStatus,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import {
    PasswordRequiredException,
    UserAlreadyExists,
    UserWithEmailNotFoundException,
} from '@server/common/exceptions/exceptions';
import * as bcrypt from 'bcrypt';
import { SessionService } from '../session/session.service';
import {
    // AccessTokenPayload,
    RefreshToken,
    Tokens,
} from '@server/types/auth';
// import { ChangePassword, ResetPasswordDto } from './dto/dto';
import { DatabaseService } from '../database/database.service';
import { createHmac, randomBytes } from 'crypto';
import {
    ChangePassword,
    CreateUserDto,
    ResetPasswordDto,
    UserEntity,
} from '@schema/user';
import {
    AccessTokenDTO,
    AccessTokenClaims,
    RefreshTokenDto,
} from '@schema/auth';
import { plainToInstance } from 'class-transformer';
import { GoogleProfile } from './strategy/google.strategy';
import { convertTextToSlug } from '@server/utils/format';

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
            throw new UserWithEmailNotFoundException(userDto.email);
        }

        if (!user.password) {
            throw new PasswordRequiredException();
        }

        const passwordMatch = await this.compareHash(
            userDto.password,
            user.password,
        );

        if (!passwordMatch) {
            throw new ForbiddenException('Incorrect password');
        }

        return await this.createUserSession(user);
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

        return await this.createUserSession(newUser);
    }

    async handleProviderLogin(user: GoogleProfile): Promise<Tokens> {
        const account = await this.databaseService.account.findUnique({
            where: {
                provider_providerId: {
                    provider: user.provider,
                    providerId: user.id,
                },
            },
            include: {
                user: true,
            },
        });

        if (account) return await this.createUserSession(account.user);

        const email = user.emails[0].value;

        let existingUser = await this.databaseService.user.findUnique({
            where: {
                email: email,
            },
        });

        if (!existingUser) {
            existingUser = await this.databaseService.user.create({
                data: {
                    username: convertTextToSlug(email.split('@')[0]),
                },
            });
        }

        // automatic account merging for google provider
        await this.databaseService.account.create({
            data: {
                provider: user.provider,
                providerId: user.id,
                user_id: existingUser.id,
            },
        });

        return await this.createUserSession(existingUser);
    }

    async handleProviderLink(userId: string, user: GoogleProfile) {
        const account = await this.databaseService.account.findUnique({
            where: {
                provider_providerId: {
                    provider: user.provider,
                    providerId: user.id,
                },
            },
            include: {
                user: true,
            },
        });

        if (account) {
            if (account.user_id === userId) {
                throw new ConflictException(
                    'This provider has already been linked to this account',
                );
            } else {
                throw new ConflictException(
                    'This provider is linked to another account',
                );
            }
        }

        await this.databaseService.account.create({
            data: {
                provider: user.provider,
                providerId: user.id,
                user_id: userId,
            },
        });

        return true;
    }

    async handleProviderUnlink(userId: string, provider: string) {
        const user = await this.databaseService.user.findUnique({
            where: {
                id: userId,
            },
            include: {
                Account: true,
            },
        });

        const hasPassword = !!user?.password;

        if (!hasPassword) {
            throw new BadRequestException(
                'You cannot unlink your provider without a password. Please set a password first.',
            );
        }

        await this.databaseService.account.deleteMany({
            where: {
                user_id: userId,
                provider: provider,
            },
        });

        return true;
    }

    async createUserSession(user: User): Promise<Tokens> {
        const token_id = uuidv4();

        const { accessToken, refreshToken } = await this.getTokens(
            user.id,
            user,
            token_id,
        );

        const hashedRefreshToken = await this.hashData(refreshToken);

        const decodedRefreshToken = this.jwtService.decode(
            refreshToken,
        ) as RefreshTokenDto;
        await this.sessionService.createSession({
            token_hash: hashedRefreshToken,
            expires_at: new Date(decodedRefreshToken.exp * 1000),
            user_id: user.id,
            id: token_id,
        });
        return { access_token: accessToken, refresh_token: refreshToken };
    }

    async validateUser(
        email: string,
        password: string,
    ): Promise<AccessTokenClaims | null> {
        const user = await this.usersService.findUser({ email });

        const hashPassword = await this.hashData(password);

        if (user && user.password === hashPassword) {
            return plainToInstance(AccessTokenClaims, user, {
                strategy: 'excludeAll',
            });
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

    async getTokens(userId: string, user: User, token_id: string) {
        const [accessToken, refreshToken] = await Promise.all([
            this.generateAccessToken(user),
            this.generateRefreshToken(user, token_id),
        ]);
        return { accessToken, refreshToken };
    }

    async generateAccessToken(user: User) {
        return this.jwtService.signAsync(
            {
                sub: user.id,
                ...plainToInstance(AccessTokenClaims, user, {
                    strategy: 'excludeAll',
                }),
            } as AccessTokenDTO,
            {
                secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
                expiresIn: this.configService.get<string>(
                    'JWT_ACCESS_TOKEN_EXPIRES_IN',
                ),
            },
        );
    }

    async generateRefreshToken(user: User, token_id: string) {
        return this.jwtService.signAsync(
            {
                sub: user.id,
                jti: token_id,
            } as RefreshTokenDto,
            {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
                expiresIn: this.configService.get<string>(
                    'JWT_REFRESH_TOKEN_EXPIRES_IN',
                ),
            },
        );
    }

    async refreshToken(refreshToken: RefreshToken): Promise<Tokens> {
        const user = await this.sessionService.verifySession(
            refreshToken.sub,
            refreshToken.jti,
            refreshToken.token,
        );

        return { access_token: await this.generateAccessToken(user) };
    }

    async logout(refreshToken: RefreshToken) {
        return await this.sessionService.deleteSession(refreshToken.jti);
    }

    async changePassword(userToken: AccessTokenDTO, password: ChangePassword) {
        const user = await this.usersService.findUser({
            email: userToken.email,
        });

        if (!user) {
            throw new UserWithEmailNotFoundException(userToken.email);
        }

        if (!user.password) {
            throw new PasswordRequiredException();
        }

        const passwordMatch = await this.compareHash(
            password.oldPassword,
            user.password,
        );

        if (!passwordMatch) {
            console.log('not match');
            throw new HttpException('Incorrect password', HttpStatus.FORBIDDEN);
        }

        const hashNewPassword = await this.hashData(password.newPassword);

        await this.usersService.updateUser(userToken.sub, {
            password: hashNewPassword,
        });

        await this.sessionService.invalidateUserSessions(userToken.sub);

        return true;
    }

    async generateResetToken() {
        const resetToken = randomBytes(64).toString('base64url');
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
            throw new UserWithEmailNotFoundException(email);
        }

        const { resetToken, resetTokenExpiry } =
            await this.generateResetToken();

        const hashedResetToken = this.generateHMac(resetToken);

        await this.usersService.updateUser(user.id, {
            reset_token: hashedResetToken,
            reset_token_expires_at: resetTokenExpiry,
        });

        return resetToken;
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto) {
        const hashedResetToken = this.generateHMac(resetPasswordDto.token);
        const user =
            await this.usersService.findUserByResetToken(hashedResetToken);

        if (!user) {
            throw new UnauthorizedException('Invalid or expired token');
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
