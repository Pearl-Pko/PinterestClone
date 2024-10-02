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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Prisma } from '@prisma/client';
import { User } from '@server/decorators/user';
import { AccessToken } from '@server/types/auth';
import { CreateUserDto } from '@schema/user';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}


    @Get("profile") 
    @HttpCode(HttpStatus.OK)
    getProfile(@User<AccessToken>() token: AccessToken) {
        console.log("token", token.id);
        return this.usersService.findUser({id: token.id});
    }
}
