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
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { AccessTokenGuard } from './guards/access-auth.guard';
import { Public } from '@server/constants/constants';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { RefreshTokenGuard } from './guards/refresh-auth.guard';
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Public()
    // @UseGuards(AuthGuard("local"))
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() createUserDto: CreateUserDto) {
        // console.log("req", req);
        return this.authService.signIn(createUserDto);
    }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('signup')
    async signup(@Body() createUserDto: CreateUserDto) {
        // console.log("req", req);
        return this.authService.signUp(createUserDto);
    }

    @Public()
    @UseGuards(RefreshTokenGuard)
    @Post('refresh')
    async refresh(@Request() req: any) {
        return { access_token: await this.authService.refreshToken(req.user) };
        // console.log("refresh", req.user.refreshToken)
    }

    @Get('profile')
    getProfile(@Request() req: { user: string }) {
        return req.user;
    }


    @Public()
    @UseGuards(RefreshTokenGuard)
    @Post('logout')
    async logout(@Request() req: any) {
        if (await this.authService.logout(req.user)) {
            return {status: "true", message: "Successfully logged out"}
        }
        return {status: "Invalid token"};
    }
}
