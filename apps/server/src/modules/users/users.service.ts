import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DatabaseService } from '@server/modules/database/database.service';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UsersService {
    constructor(private readonly database: DatabaseService) {}

    async findUser({
        username,
        email,
    }: {
        username?: string;
        email?: string;
    }): Promise<User | null> {
        if (!username && !email)
            throw new Error('Username or email must be given');

        return await this.database.user.findFirst({
            where: {
                OR: [
                    { email: { equals: email, mode: 'insensitive' } },
                    { username: username },
                ],
            },
        });
    }

    async findUserByResetToken(resetToken: string) {
        return await this.database.user.findFirst({
            where: {
                reset_token: resetToken,
            },
        });
    }

    async create(user: CreateUserDto) {
        const randomUserName = user.email;

        return await this.database.user.create({
            data: {
                ...user,
                username: randomUserName,
            },
        });
    }

    async updateUser(userId: string, newData: Partial<User>) {
        return await this.database.user.update({
            where: { id: userId },
            data: newData,
        });
    }
}
