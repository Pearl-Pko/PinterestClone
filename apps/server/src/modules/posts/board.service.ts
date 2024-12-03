import {
    HttpException,
    HttpStatus,
    Injectable,
    NotFoundException,
    Query,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateBoardDto, UpdateBoardDto } from '@schema/board';
import { Pin, Prisma } from '@prisma/client';
import { AuthorNotFoundException } from '@server/common/exceptions/exceptions';
import { PinService } from './pin.service';
import { User } from '@server/decorators/user';
import { AccessTokenDTO } from '@schema/auth';
import { PaginatedQuery } from '@schema/util';

@Injectable()
export class BoardService {
    constructor(private readonly database: DatabaseService) {}

    async create(data: CreateBoardDto, userId: string) {
        try {
            return await this.database.board.create({
                data: {
                    ...data,
                    user: {
                        connect: {
                            id: userId,
                        },
                    },
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new AuthorNotFoundException(userId);
                }
            }
            throw error;
        }
    }

    async edit(id: string, userId: string, data: UpdateBoardDto) {
        const board = await this.getOneBoard(id, userId, true);

        const { banner_id, ...rest } = data;

        if (banner_id) {
            const pin = await this.database.pin.findUnique({
                where: {
                    id: banner_id,
                },
            });
            if (!pin) {
            }
        }

        try {
            return await this.database.board.update({
                where: {
                    id: id,
                },
                data: {
                    ...rest,
                    banner_id,
                },
            });
        } catch (error) {
            console.log(error.code, error.meta);

            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (
                    error.code === 'P2003' &&
                    error?.meta?.field_name == 'Board_banner_id_fkey (index)'
                ) {
                    throw new NotFoundException(
                        `Failed to set banner for board. Pin with id '${banner_id}' not found`,
                    );
                }
            }
            throw error;
        }
    }

    async getOneBoard(id: string, userId: string, mutation: boolean = false, allowDeleted: boolean = false) {
        const board = await this.database.board.findUnique({
            where: {
                id: id,
            },
        });

        if (!board) {
            throw new NotFoundException(`Board with id '${id}' not found`);
        }

        if (board.private && board.user_id != userId) {
            throw new HttpException(
                'You do not have permission to access this resource',
                HttpStatus.FORBIDDEN,
            );
        }

        if (mutation && board.user_id != userId) {
            throw new HttpException(
                'You do not have permission to access this resource',
                HttpStatus.FORBIDDEN,
            );
        }

        if (!allowDeleted && board.deletedAt && board.deletedAt < new Date()) {
            throw new NotFoundException(`Board with id ${board.id} not found`)
        }

        return board;
    }

    async deleteBoard(id: string, userId: string) {
        await this.getOneBoard(id, userId, true);
        return await this.database.board.update({
            where: {
                id: id
            },
            data: {
                deletedAt: new Date()
            }
        })
    }

    async restoreBoard(id: string, userId: string) {
        const board = await this.getOneBoard(id, userId, true, true);

        if (!board.deletedAt) {
            throw new HttpException(
                'This board has not been deleted',
                HttpStatus.CONFLICT,
            );
        }

        if (board.deletedAt > new Date()) {
            throw new NotFoundException(`Board with ${id} not found`)
        }

        return await this.database.board.update({
            where: {
                id: id
            },
            data: {
                deletedAt: null
            }
        })
    }

    async getBoards(userId: string, query: PaginatedQuery, author: boolean = true) {
        const filter: Prisma.BoardWhereInput = {
            user_id: userId,
            ...(!author && { private: false }),
        };
        const boards = await this.database.board.findMany({
            where: filter,
            skip: (query.page - 1) * query.limit,
            take: query.limit,
            orderBy: {
                created_at: 'desc',
            },
        });
        const totalCount = await this.database.board.count({
            where: filter,
        });
        return {boards, totalCount};

    }
}
