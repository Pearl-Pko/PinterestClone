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
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from '@server/constants/constants';
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}


    @Public()
    @UseGuards(AuthGuard("local"))
    @HttpCode(HttpStatus.OK)
    @Post("login")
    async login(@Request() req: any) {
        // console.log("req", req);
        return this.authService.signIn(req.user);
    }

    @Get("profile") 
    getProfile(@Request() req: {user: string}) {
        return req.user;
    }
}
