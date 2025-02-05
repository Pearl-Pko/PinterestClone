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
    SerializeOptions,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Prisma, User } from '@prisma/client';
import { User as UserToken } from '@server/decorators/user';
import { ChangeUsernameDto, CreateUserDto, UserEntity } from '@schema/user';
import {
    UserWithEmailNotFoundException,
    UserWithIdNotFoundException,
    UserWithUsernameNotFoundException,
} from '@server/common/exceptions/exceptions';
import { AccessTokenDTO } from '@schema/auth';
import { FormDataRequest, MemoryStoredFile } from 'nestjs-form-data';
import { EditProfileDto } from './dto/user.dto';
import { Public } from '@server/constants/constants';
import { ApiResponse } from '@schema/util';
import { Type } from 'class-transformer';

class UserEntityApiResponse extends ApiResponse<User | User[]> {
    @Type(() => UserEntity)
    data?: User | User[] | undefined;
}
@Controller('user')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @HttpCode(HttpStatus.OK)
    @SerializeOptions({
        groups: ['user', 'user.private'],
        type: UserEntity,
    })
    @Get('profile')
    async getProfile(@UserToken<AccessTokenDTO>() token: AccessTokenDTO) {
        console.log('token', token.sub);
        const user = await this.usersService.findUser({ id: token.sub });

        if (!user) {
            throw new UserWithIdNotFoundException(token.sub);
        }

        return new UserEntity(user);
    }

    @Patch('profile')
    @SerializeOptions({
        groups: ['user', 'user.private'],
        type: UserEntity,
    })
    @FormDataRequest({ storage: MemoryStoredFile })
    async edit(
        @Body() updateUserDto: EditProfileDto,
        @UserToken<AccessTokenDTO>() token: AccessTokenDTO,
    ) {
        const updatedUser = await this.usersService.editProfile(
            token.sub,
            updateUserDto,
        );
        return new UserEntity(updatedUser);
    }

    @Patch('username')
    @SerializeOptions({
        groups: ['user', 'user.private'],
        type: UserEntity,
    })
    async editUserName(
        @Body() changeUserNameDto: ChangeUsernameDto,
        @UserToken<AccessTokenDTO>() token: AccessTokenDTO,
    ) {
        const updatedUser = await this.usersService.changeUsername(
            token.sub,
            changeUserNameDto,
        );
        return new UserEntity(updatedUser);
    }

    @Get(':username')
    @Public()
    @SerializeOptions({
        groups: ['user'],
        type: UserEntity,
    })
    async getUser(@Param('username') username: string) {
        const user = await this.usersService.findUser({ username: username });

        if (!user) throw new UserWithUsernameNotFoundException(username);
        return new UserEntity(user);
    }
}
