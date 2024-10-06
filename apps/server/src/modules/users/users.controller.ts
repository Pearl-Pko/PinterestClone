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
import { CreateUserDto, UserEntity, UserEntityDto } from '@schema/user';
import {
    UserWithEmailNotFoundException,
    UserWithIdNotFoundException,
} from '@server/common/exceptions/exceptions';
import { AccessTokenDTO } from '@schema/auth';

@Controller('user')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('profile')
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(ClassSerializerInterceptor)
    async getProfile(@User<AccessTokenDTO>() token: AccessTokenDTO) {
        console.log('token', token.sub);
        const user = await this.usersService.findUser({ id: token.sub });

        if (!user) {
            throw new UserWithIdNotFoundException(token.sub);
        }

        return new UserEntityDto(user);
    }
}
