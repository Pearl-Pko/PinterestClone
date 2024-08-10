import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { DatabaseService } from '@server/database/database.service';
import { Post as PostEntity, Prisma } from '@prisma/client';
import { AuthorNotFoundException } from '@server/common/exceptions/exceptions';

@Injectable()
export class PostsService {
    constructor(private readonly database: DatabaseService) {}

    async create(data: CreatePostDto): Promise<PostEntity> {
        try {
            return await this.database.post.create({
                data: data,
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === "P2003") {
                    throw new AuthorNotFoundException(data.author_id);
                }
            }
            throw new Error('An unexpected error occurred');
        }
    }

    findAll() {
        return `This action returns all posts`;
    }

    findOne(id: number) {
        return `This action returns a #${id} post`;
    }

    update(id: number, updatePostDto: UpdatePostDto) {
        return `This action updates a #${id} post`;
    }

    remove(id: number) {
        return `This action removes a #${id} post`;
    }
}
