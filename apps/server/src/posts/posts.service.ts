import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { DatabaseService } from '@server/database/database.service';
import { Post as PostEntity, Prisma } from '@prisma/client';
import { AuthorNotFoundException } from '@server/common/exceptions/exceptions';

@Injectable()
export class PostsService {
    constructor(private readonly database: DatabaseService) {}

    async create(data: CreatePostDto) {
        try {
            return await this.database.post.create({
                data: data,
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2003') {
                    throw new AuthorNotFoundException(data.author_id);
                }
            }
            throw new Error('An unexpected error occurred');
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
