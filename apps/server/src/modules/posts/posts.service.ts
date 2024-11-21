import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '@server/modules/database/database.service';
import { AuthorNotFoundException } from '@server/common/exceptions/exceptions';
import { CreatePostDto, PostEntity, UpdatePostDto } from '@schema/post';
import { PostStatus, Prisma } from '@prisma/client';
import { S3Service } from '../s3/s3.service';
import { addDays } from 'date-fns';
@Injectable()
export class PostsService {
    constructor(
        private readonly database: DatabaseService,
        private readonly s3Service: S3Service,
    ) {}

    async create(data: CreatePostDto, userId: string): Promise<PostEntity> {
        const { content, ...rest } = data;

        const uri = await this.s3Service.uploadFile(
            content,
            `posts/${userId}/${Date.now()}`,
        );

        const draftExpiry = addDays(Date.now(), 30);

        try {
            return await this.database.post.create({
                data: {
                    ...rest,
                    content_uri: uri,
                    expiry: draftExpiry,
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
            return await this.database.post.update({
                where: {
                    id: id,
                },
                data: {
                    status: 'posted',
                    expiry: null,
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

    async getAllUserPosts(userId: string, status: PostStatus) {
        try {
            return await this.database.post.findMany({
                where: {
                    author_id: userId,
                    status: status,
                },
            });
        } catch (error) {
            throw error;
        }
    }
}
