import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { Prisma, Session, User } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SessionService {
    constructor(
        private usersService: UsersService,
        private databaseService: DatabaseService,
    ) {}

    async createSession(session: Prisma.SessionUncheckedCreateInput) {
        const { user_id, ...rest } = session;

        await this.databaseService.session.create({
            data: {
                ...rest,
                user: {
                    connect: {
                        id: user_id,
                    },
                },
            },
        });
    }

    async verifySession(
        userId: string,
        tokenId: string,
        refreshToken: string,
    ): Promise<User> {
        const session = await this.databaseService.session.findUnique({
            where: { id: tokenId },
            include: { user: true },
        });

        if (!session) {
            throw new UnauthorizedException('Refresh token not found');
        }

        const tokenMatches = await bcrypt.compare(
            refreshToken,
            session.token_hash,
        );

        if (!tokenMatches) {
            throw new UnauthorizedException('Refresh token is not valid');
        }

        return session.user;
    }

    async deleteSession(tokenId: string): Promise<boolean> {
        try {
            await this.databaseService.session.delete({
                where: {
                    id: tokenId,
                },
            });
            return true;
        } catch (error) {
            // console.error(error);
            return false;
        }
    }

    async invalidateUserSessions(userId: string): Promise<boolean> {
        try {
            await this.databaseService.session.deleteMany({where: {user_id: userId}})
            return true;
        }
        catch (error) {
            // console.log(error);
            return false 
        }
    }

    async compareHash() {
        return;
    }


}
