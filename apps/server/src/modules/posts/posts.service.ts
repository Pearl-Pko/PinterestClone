import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '@server/modules/database/database.service';
import { Post as PostEntity, Prisma } from '@prisma/client';
import { AuthorNotFoundException } from '@server/common/exceptions/exceptions';
import { CreatePostDto, UpdatePostDto } from '@schema/post';
@Injectable()
export class PostsService {
    constructor(private readonly database: DatabaseService) {}

    async create(data: Prisma.PostUncheckedCreateInput): Promise<PostEntity> {
        const {author_id, ...rest} = data;

        try {
            return await this.database.post.create({
                "data": {
                    ...rest,
                    author: {
                        connect: {
                            id: data.author_id,
                        },
                    },
                },
            });
        } catch (error) {
            console.log(error.code);
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new AuthorNotFoundException(data.author_id);
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
