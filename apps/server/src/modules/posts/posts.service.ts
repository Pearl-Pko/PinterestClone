import {
    HttpException,
    HttpStatus,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '@server/modules/database/database.service';
import { AuthorNotFoundException } from '@server/common/exceptions/exceptions';
import { GetAllPosts, PostEntity } from '@schema/post';
import { PostStatus, Prisma } from '@prisma/client';
import { S3Service } from '../s3/s3.service';
import { addDays } from 'date-fns';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CreatePostDto, UpdatePostDto } from './dto';
import { PaginatedQuery } from '@schema/util';
import { DescribeJobCommand } from '@aws-sdk/client-s3-control';
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

    async update(
        id: string,
        userId: string,
        data: UpdatePostDto,
    ): Promise<PostEntity> {
        try {
            const post = await this.getOnePost(id, userId, true);
            const { content, ...rest } = data;

            let uri = post.content_uri;

            if (content && post.status == 'draft') {
                uri = await this.s3Service.uploadFile(
                    content,
                    `posts/${userId}/${Date.now()}`,
                    [{ Key: 'status', Value: post.status }],
                );
                const match = post.content_uri.match(/public.+/);
                const key = match?.[0];
                if (key) {
                    await this.s3Service.deleteFile(key);
                    console.log('old key', key);
                }
            }

            const updatedPost = await this.database.post.update({
                where: {
                    id: id,
                },
                data: { ...rest, content_uri: uri },
            });
            return updatedPost;
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

    async remove(id: string, userId: string): Promise<PostEntity> {
        try {
            const post = await this.getOnePost(id, userId, true);

            const match = post.content_uri.match(/public.+/);
            const key = match?.[0];
            if (key) {
                await this.s3Service.deleteFile(key);
            }

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

    async publish(id: string, userId: string): Promise<PostEntity> {
        try {
            const post = await this.getOnePost(id, userId, true);

            if (post.status === 'posted') {
                throw new HttpException(
                    'This post has already been published',
                    HttpStatus.CONFLICT,
                );
            }

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

    async getOnePost(id: string, userId: string, mutation: boolean = false) {
        const post = await this.database.post.findUnique({
            where: {
                id: id,
            },
        });

        if (!post) {
            throw new NotFoundException(`Post with id '${id}' not found`);
        }

        if (post.status === 'draft' && post.author_id != userId) {
            throw new HttpException(
                'You do not have permission to access this resource',
                HttpStatus.FORBIDDEN,
            );
        }

        if (mutation && post.author_id != userId) {
            throw new HttpException(
                'You do not have permission to access this resource',
                HttpStatus.FORBIDDEN,
            );
        }

        return post;
    }

    async getAllUserPosts(
        userId: string,
        query: PaginatedQuery,
        status: PostStatus,
    ) {
        try {
            const filter: Prisma.PostWhereInput = {
                author_id: userId,
                status: status,
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

    async batchEdit(userId: string, data: UpdatePostDto, postIds: string[]) {
        return await this.database.post.updateMany({
            data: data,
            where: {
                id: { in: postIds },
                author_id: userId,
            },
        });
    }

    async batchDelete(userId: string, postIds: string[]) {
        return await this.database.post.deleteMany({
            where: {
                id: { in: postIds },
                author_id: userId,
            },
        });
    }

    async batchPublish(userId: string, postIds: string[]) {
        const query: Prisma.PostWhereInput = {
            author_id: userId,
            id: { in: postIds },
            status: 'draft',
        };

        const posts = await this.database.post.findMany({
            where: query,
        });

        const content_keys = posts.map(
            (post) => post.content_uri.match(/public.+/)?.[0] || '',
        );

        const { count } = await this.database.post.updateMany({
            where: query,
            data: {
                status: 'posted',
                expiresAt: null,
            },
        });

        if (posts.length > 0) {
            // run asynchronously in the background
            this.s3Service.bulkApplyTags(content_keys, [
                { Key: 'status', Value: 'posted' },
            ]);
        }
        return count;
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

    async duplicatePosts(userId: string, id: string) {
        const post = await this.getOnePost(id, userId, true);

        const match = post.content_uri.match(/public.+/);
        const key = match?.[0];

        if (!key) throw Error(`Invalid conntent uri for post ${post.id}`);

        const destinationKey = `posts/${userId}/${Date.now()}`;

        const newUri = await this.s3Service.CopyObject(key, destinationKey, [
            { Key: 'status', Value: post.status },
        ]);

        const draftExpiry = addDays(Date.now(), 30);

        try {
            return await this.database.post.create({
                data: {
                    title: post.title,
                    description: post.description,
                    external_link: post.external_link,
                    status: post.status,
                    tags: post.tags,
                    content_uri: newUri,
                    expiresAt: post.status == 'draft' ? draftExpiry : null,
                    author: {
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
}
