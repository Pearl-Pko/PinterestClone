import { Injectable, NotFoundException, Query } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreatePinDto } from '@schema/pin';
import { Prisma } from '@prisma/client';
import { PostsService } from './posts.service';
import { BoardService } from './board.service';
import { PaginatedQuery } from '@schema/util';

@Injectable()
export class PinService {
    constructor(
        private readonly database: DatabaseService,
        private readonly postService: PostsService,
        private readonly boardService: BoardService,
    ) {}

    async create(userId: string, data: CreatePinDto) {
        try {
            await this.postService.getOnePost(data.post_id, userId);

            await this.boardService.getOneBoard(data.board_id, userId, true);

            return await this.database.pin.create({
                data: { ...data, user_id: userId },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (
                    error.code === 'P2003' &&
                    error?.meta?.field_name == 'Pin_user_id_fkey (index)'
                ) {
                    throw new NotFoundException(
                        `User with id '${data.post_id}' not found`,
                    );
                }
            }
            throw error;
        }
    }

    async getPin(id: string, userId: string, mutation: boolean = false) {
        const pin = await this.database.pin.findUnique({
            where: {
                id: id,
            },
        });
        if (!pin) {
            throw new NotFoundException(`Pin with id '${id} not found`);
        }

        await this.boardService.getOneBoard(pin.board_id, userId), mutation;

        return pin;
    }

    async removePin(id: string, userId: string) {
        const pin = await this.getPin(id, userId, true);
        return await this.database.pin.delete({
            where: {
                id: id,
            },
        });
    }

    async getAllUserPins(userId: string, query: PaginatedQuery) {
        const filter: Prisma.PinWhereInput = {
            user_id: userId,
        };
        const pins = await this.database.pin.findMany({
            where: filter,
            skip: (query.page - 1) * query.limit,
            take: query.limit,
            orderBy: {
                created_at: 'desc',
            },
        });
        const totalCount = await this.database.pin.count({
            where: filter,
        });
        return { pins, totalCount };
    }

    async getPinsInBoard(
        boardId: string,
        userId: string,
        @Query() query: PaginatedQuery,
    ) {
        const bb = await this.boardService.getOneBoard(boardId, userId);

        console.log("ds", bb);
        const filter: Prisma.PinWhereInput = {
            board_id: boardId,
        };

        const pins = await this.database.pin.findMany({
            where: filter,
            skip: (query.page - 1) * query.limit,
            take: query.limit,
            
            orderBy: {
                created_at: 'desc',
            },
        });
        const totalCount = await this.database.pin.count({
            where: filter,
        });
        return { pins, totalCount };
    }
}
