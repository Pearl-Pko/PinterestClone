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
    UseInterceptors,
    ClassSerializerInterceptor,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Prisma } from '@prisma/client';
import { User } from '@server/decorators/user';
import { AccessToken } from '@server/types/auth';
import { CreateUserDto, UserEntity, UserEntityDto } from '@schema/user';
import {
    UserWithEmailNotFoundException,
    UserWithIdNotFoundException,
} from '@server/common/exceptions/exceptions';

@Controller('user')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('profile')
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(ClassSerializerInterceptor)
    async getProfile(@User<AccessToken>() token: AccessToken) {
        console.log('token', token.id);
        const user = await this.usersService.findUser({ id: token.id });

        if (!user) {
            throw new UserWithIdNotFoundException(token.id);
        }

        return new UserEntityDto(user);
    }
}
