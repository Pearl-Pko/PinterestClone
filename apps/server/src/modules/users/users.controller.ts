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
import { ChangeUsernameDto, CreateUserDto, UserEntity } from '@schema/user';
import {
    UserWithEmailNotFoundException,
    UserWithIdNotFoundException,
} from '@server/common/exceptions/exceptions';
import { AccessTokenDTO } from '@schema/auth';
import { FormDataRequest, MemoryStoredFile } from 'nestjs-form-data';
import { EditProfileDto } from './dto/user.dto';

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

        return new UserEntity({ ...user });
    }

    @Patch('profile')
    @FormDataRequest({ storage: MemoryStoredFile })
    @UseInterceptors(ClassSerializerInterceptor)
    async edit(
        @Body() updateUserDto: EditProfileDto,
        @User<AccessTokenDTO>() token: AccessTokenDTO,
    ) {
        const updatedUser = await this.usersService.editProfile(
            token.sub,
            updateUserDto,
        );
        return new UserEntity(updatedUser);
    }

    @Patch(':id/username')
    async editUserName(
        @Body() changeUserNameDto: ChangeUsernameDto,
        @User<AccessTokenDTO>() token: AccessTokenDTO,
    ) {
        const updatedUser = await this.usersService.changeUsername(token.sub, changeUserNameDto)
        return new UserEntity(updatedUser)
    }
}
