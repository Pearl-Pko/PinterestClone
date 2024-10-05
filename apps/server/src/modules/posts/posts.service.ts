import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '@server/modules/database/database.service';
import { AuthorNotFoundException } from '@server/common/exceptions/exceptions';
import { CreatePostDto, PostEntity, UpdatePostDto } from '@schema/post';
import { Prisma } from '@prisma/client';
@Injectable()
export class PostsService {
    constructor(private readonly database: DatabaseService) {}

    async create(data: CreatePostDto, userId: string): Promise<PostEntity> {
        try {
            return await this.database.post.create({
                data: {
                    ...data,
                    image_url: "ew",
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
            // Re-throw any other errors
            throw new Error('An unexpected error occurred');
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
            throw new Error('An unexpected error occurred');
        }
    }
}
