import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { Prisma, Session } from '@prisma/client';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class SessionService {
    constructor(private usersService: UsersService, private databaseService: DatabaseService) {
        
    }


    async createSession(session: Prisma.SessionUncheckedCreateInput) {
        const {userId, ...rest} = session;

        await this.databaseService.session.create({
            data: {...rest, user: {
                connect: {
                    id: session.userId
                }
            }}
        })
    }

    async deleteSession() {

    }
}
