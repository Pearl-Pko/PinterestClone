import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '@server/modules/database/database.service';
import { Prisma, User } from '@prisma/client';
import { CreateUserDto } from '@schema/user';
import { convertTextToSlug } from '@server/utils/format';

@Injectable()
export class UsersService {
    constructor(private readonly database: DatabaseService) {}

    async findUser({
        username,
        email,
        id,
    }: {
        username?: string;
        email?: string;
        id?: string;
    }): Promise<User | null> {
        if (!username && !email && !id)
            throw new Error('Username or email or id must be given');

        return await this.database.user.findFirst({
            where: {
                OR: [
                    { email: { equals: email, mode: 'insensitive' } },
                    { username: username },
                    { id: id },
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
        const defaultUserName = convertTextToSlug(user.email.split("@")[0]);

        return await this.database.user.create({
            data: {
                ...user,
                username: defaultUserName,
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
