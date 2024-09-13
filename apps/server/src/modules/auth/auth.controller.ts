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
import { JwtAuthGuard } from './guards/access-auth.guard';
import { Public } from '@server/constants/constants';
import { CreateUserDto } from '../users/dto/create-user.dto';
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}


    @Public()
    // @UseGuards(AuthGuard("local"))
    @HttpCode(HttpStatus.OK)
    @Post("login")
    async login(@Body() createUserDto: CreateUserDto) {
        // console.log("req", req);
        return this.authService.signIn(createUserDto);
    }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post("signup")
    async signup(@Body() createUserDto: CreateUserDto) {
        // console.log("req", req);
        return this.authService.signUp(createUserDto);
    }

    @Get("profile") 
    getProfile(@Request() req: {user: string}) {
        return req.user;
    }
}
