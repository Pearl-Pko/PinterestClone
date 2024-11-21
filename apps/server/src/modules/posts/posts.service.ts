import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '@server/modules/database/database.service';
import { AuthorNotFoundException } from '@server/common/exceptions/exceptions';
import {
    CreatePostDto,
    GetAllPosts,
    PostEntity,
    UpdatePostDto,
} from '@schema/post';
import { PostStatus, Prisma } from '@prisma/client';
import { S3Service } from '../s3/s3.service';
import { addDays } from 'date-fns';
import { Cron, CronExpression } from '@nestjs/schedule';
@Injectable()
export class PostsService {
    private logger = new Logger('Post');

    constructor(
        private readonly database: DatabaseService,
        private readonly s3Service: S3Service,
    ) {}

    async create(data: CreatePostDto, userId: string): Promise<PostEntity> {
        const { content, ...rest } = data;

        const uri = await this.s3Service.uploadFile(
            content,
            `posts/${userId}/${Date.now()}`,
            [{ Key: 'status', Value: 'draft' }],
        );

        const draftExpiry = addDays(Date.now(), 30);

        try {
            return await this.database.post.create({
                data: {
                    ...rest,
                    content_uri: uri,
                    expiresAt: draftExpiry,
                    author: {
                        connect: {
                            id: userId,
                        },
                    },
                },
            });
        } catch (error) {
            console.log(error.code);
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new AuthorNotFoundException(userId);
                }
            }
            throw error;
            // throw new Error('An unexpected error occurred');
        }
    }

    async update(id: string, data: UpdatePostDto): Promise<PostEntity> {
        try {
            return await this.database.post.update({
                where: {
                    id: id,
                },
                data: data,
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                // Handle the "Record does not exist" error
                if (error.code === 'P2025') {
                    throw new NotFoundException(
                        `Post with id '${id}' not found`,
                    );
                }
            }
            throw error;
        }
    }

    async remove(id: string): Promise<PostEntity> {
        try {
            return await this.database.post.delete({
                where: {
                    id: id,
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new NotFoundException(
                        `Post with id '${id}' not found`,
                    );
                }
            }
            throw error;
        }
    }

    async publish(id: string): Promise<PostEntity> {
        try {
            const data = await this.database.post.update({
                where: {
                    id: id,
                },
                data: {
                    status: 'posted',
                    expiresAt: null,
                },
            });

            const match = data.content_uri.match(/public.+/);
            const key = match?.[0];
            if (key) {
                await this.s3Service.modifyTag(key, [
                    { Key: 'status', Value: 'posted' },
                ]);
            }
            return data;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new NotFoundException(
                        `Post with id '${id}' not found`,
                    );
                }
            }
            throw error;
        }
    }

    async getAllUserPosts(userId: string, query: GetAllPosts) {
        try {
            const filter: Prisma.PostWhereInput = {
                author_id: userId,
                status: query.status,
                OR: [{ status: 'posted' }, { expiresAt: { gte: new Date() } }],
            };
            const posts = await this.database.post.findMany({
                where: filter,
                skip: (query.page - 1) * query.limit,
                take: query.limit,
                orderBy: {
                    created_at: 'desc',
                },
            });
            const totalCount = await this.database.post.count({
                where: filter,
            });
            return { posts, totalCount };
        } catch (error) {
            throw error;
        }
    }

    @Cron(CronExpression.EVERY_DAY_AT_5PM)
    async cleanupOldDrafts() {
        try {
            const { count } = await this.database.post.deleteMany({
                where: {
                    status: 'draft',
                    expiresAt: { lt: new Date() },
                },
            });
            this.logger.log(`Cleaned up ${count} records`);
        } catch (error) {
            throw error;
        }
    }
}
