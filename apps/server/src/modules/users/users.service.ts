import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DatabaseService } from '@server/modules/database/database.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
    private readonly users = [
        {
            userId: 1,
            username: 'john',
            password: 'changeme',
        },
        {
            userId: 2,
            username: 'maria',
            password: 'guess',
        },
    ];

    constructor(private readonly database: DatabaseService) {}

    create(createUserDto: Prisma.UserCreateInput) {}

    findAll() {
        return `This action returns all users`;
    }

    async findOne(username: string) {
        return this.users.find((user) => user.username === username);
    }

    async findProfileByUserName(userName: string) {
        const user = await this.database.user.findUnique({
            where: {
                user_name: userName,
            },
        });
        if (!user)
            throw new NotFoundException(
                `User not found with user name ${userName}`,
            );
        console.log('user exists');
        return user;
    }

    findProfileById(id: string) {
        const user = this.database.user.findUnique({
            where: {
                id: id,
            },
        });

        if (!user) throw new NotFoundException(``);

        return user;
    }

    update(id: number, updateUserDto: UpdateUserDto) {
        return `This action updates a #${id} user`;
    }

    remove(id: number) {
        return `This action removes a #${id} user`;
    }
}
