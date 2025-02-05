import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    HttpCode,
    HttpStatus,
    UseGuards,
    Request,
    HttpException,
    Res,
    UseInterceptors,
    Req,
    Query,
    BadRequestException,
    applyDecorators,
    SerializeOptions,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { AccessTokenGuard } from './guards/access-auth.guard';
import { Public } from '@server/constants/constants';
import { RefreshTokenGuard } from './guards/refresh-auth.guard';
import { User as UserToken } from '@server/decorators/user';
import { RefreshToken } from '@server/types/auth';
// import { ChangePassword, ForgotPasswordDto, ResetPasswordDto } from './dto/dto';
import { MailService } from '../mail/mail.service';
import {
    AddSessionInterceptor,
    Session,
} from '@server/interceptors/add-session-interceptor';
import { RemoveSessionInterceptor } from '@server/interceptors/delete-session-interceptor';
import {
    ChangePassword,
    CreateUserDto,
    ForgotPasswordDto,
    ResetPasswordDto,
    SetPasswordDto,
    UnlinkProviderDto,
    UserEntity,
} from '@schema/user';
import { AccessTokenDTO } from '@schema/auth';
import { GoogleOauthGuard, OAuthState } from './guards/google-oauth.guard';
import { GoogleProfile } from './strategy/google.strategy';
import { UserWithIdNotFoundException } from '@server/common/exceptions/exceptions';
import { Response } from 'express';
import { ApiResponse } from '@schema/util';
import { set } from 'date-fns';
import { Type } from 'class-transformer';
import { User } from '@prisma/client';

class UserEntityApiResponse extends ApiResponse<User | User[]> {
    @Type(() => UserEntity)
    data?: User | User[] | undefined;
}

@Controller('user')
@SerializeOptions({
    groups: ['user', 'user.private'],
    type: UserEntityApiResponse,
})
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly mailService: MailService,
    ) {}

    @Public()
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(AddSessionInterceptor)
    @Post('login')
    async login(@Body() createUserDto: CreateUserDto)  {
        return await this.authService.signIn(createUserDto);
    }

    @Public()
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(AddSessionInterceptor)
    @Post('signup')
    async signup(@Body() createUserDto: CreateUserDto) {
        return await this.authService.signUp(createUserDto);
    }

    @Public()
    @UseGuards(RefreshTokenGuard)
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(AddSessionInterceptor)
    @Post('refresh')
    async refresh(@UserToken<RefreshToken>() token: RefreshToken) {
        return await this.authService.refreshToken(token);
    }

    @Public()
    @HttpCode(HttpStatus.OK)
    @UseGuards(RefreshTokenGuard)
    @UseInterceptors(RemoveSessionInterceptor)
    @Post('logout')
    async logout(@UserToken<RefreshToken>() token: RefreshToken) {
        if (await this.authService.logout(token)) {
            return { status: 'success', message: 'Successfully logged out' };
        }
        throw new HttpException('Failed to log out', HttpStatus.NOT_FOUND);
    }

    @Public()
    @Get('google')
    @UseGuards(GoogleOauthGuard)
    async googleAuth() {}

    @Public()
    @UseInterceptors(AddSessionInterceptor)
    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(
        @UserToken<GoogleProfile>() user: GoogleProfile,
        @Query('state') state: string,
        @Res() res: Response,
    ) {
        const oauthState = JSON.parse(
            Buffer.from(state, 'base64').toString('utf8'),
        ) as OAuthState;

        if (oauthState.source === 'signin') {
            return {
                ...(await this.authService.handleProviderLogin(user)),
                redirectAddress: oauthState.redirectAddress,
            } as Session;
        } else {
            if (!oauthState.userId) {
                throw new BadRequestException('User Id not found');
            }

            console.log('real', oauthState.userId);

            const linkSuccessful = await this.authService.handleProviderLink(
                oauthState.userId,
                user,
            );
            return {
                status: linkSuccessful ? 'sucess' : 'failed',
                message:
                    'This provider has successfully been linked to this account',
                redirectAddress: oauthState.redirectAddress,
            };
        }
    }

    @Get('google/link')
    @UseGuards(GoogleOauthGuard)
    async googleAuthLink() {}

    @Post('unlink-provider')
    async unlinkProivder(
        @UserToken<AccessTokenDTO>() user: AccessTokenDTO,
        @Body() provider: UnlinkProviderDto,
    ): Promise<ApiResponse> {
        const result = await this.authService.handleProviderUnlink(
            user.sub,
            provider.provider,
        );
        return {
            status: result ? 'success' : 'failed',
            message: 'Provider unlinked successfullly',
        };
    }

    @Public()
    @Get('google/link/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthLinkRedirect(
        @UserToken<GoogleProfile>() user: GoogleProfile,
    ) {
        console.log('link callback');
        // return await this.authService.handleProviderLogin(user);
    }

    @Post('change-password')
    @HttpCode(HttpStatus.OK)
    async changePassword(
        @UserToken<AccessTokenDTO>() token: AccessTokenDTO,
        @Body() password: ChangePassword,
    ) {
        // this.authService.
        if (await this.authService.changePassword(token, password)) {
            return {
                status: 'success',
                message: 'Successfully changed password',
            };
        }
        throw new HttpException(
            'Failed to changed password',
            HttpStatus.NOT_FOUND,
        );
    }

    @Public()
    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
        const resetToken = await this.authService.requestPasswordReset(
            forgotPasswordDto.email,
        );

        await this.mailService.sendPasswordResetMail(
            forgotPasswordDto.email,
            resetToken,
        );

        return { message: 'Password reset email sent' };
    }

    @Public()
    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        const resetPasswordStatus =
            await this.authService.resetPassword(resetPasswordDto);
        if (resetPasswordStatus) {
            return {
                status: 'sucess',
                message: 'Successfully changed password',
            };
        }
        throw new HttpException(
            'Failed to reset password',
            HttpStatus.NOT_FOUND,
        );
    }

    @Post('set-password')
    @HttpCode(HttpStatus.OK)
    async setPassword(
        @UserToken<AccessTokenDTO>() user: AccessTokenDTO,
        @Body() setPassowrdDto: SetPasswordDto,
    ): Promise<ApiResponse> {
        const setPass = await this.authService.setPassword(
            user,
            setPassowrdDto,
        );

        return { message: 'Password set successfully', status: 'success' };
    }
}
