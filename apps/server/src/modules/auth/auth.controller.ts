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
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { AccessTokenGuard } from './guards/access-auth.guard';
import { Public } from '@server/constants/constants';
import { RefreshTokenGuard } from './guards/refresh-auth.guard';
import { User } from '@server/decorators/user';
import { AccessToken, RefreshToken } from '@server/types/auth';
// import { ChangePassword, ForgotPasswordDto, ResetPasswordDto } from './dto/dto';
import { MailService } from '../mail/mail.service';
import { AddSessionInterceptor } from '@server/interceptors/add-session-interceptor';
import { RemoveSessionInterceptor } from '@server/interceptors/delete-session-interceptor';
import {ChangePassword, CreateUserDto, ForgotPasswordDto, ResetPasswordDto} from "@schema/user"
@Controller('user')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly mailService: MailService,
    ) {}

    @Public()
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(AddSessionInterceptor)
    @Post('login')
    async login(@Body() createUserDto: CreateUserDto) {
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
    async refresh(@User<RefreshToken>() token: RefreshToken) {
        return await this.authService.refreshToken(token);
    }

    @Public()
    @HttpCode(HttpStatus.OK)
    @UseGuards(RefreshTokenGuard)
    @UseInterceptors(RemoveSessionInterceptor)
    @Post('logout')
    async logout(@User<RefreshToken>() token: RefreshToken) {
        if (await this.authService.logout(token)) {
            
            return { status: 'success', message: 'Successfully logged out' };
        }
        throw new HttpException('Failed to log out', HttpStatus.NOT_FOUND);
    }

    @Post('change-password')
    @HttpCode(HttpStatus.OK)
    async changePassword(
        @User<AccessToken>() token: AccessToken,
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
}
