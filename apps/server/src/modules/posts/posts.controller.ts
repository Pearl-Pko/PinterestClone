import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    NotFoundException,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { Post as PostEntity, Prisma } from '@prisma/client';
import { User } from '@server/decorators/user';
import { AccessToken } from '@server/types/auth';
import {CreatePostDto, UpdatePostDto} from "@schema/post"
@Controller('posts')
export class PostsController {
    constructor(private readonly postsService: PostsService) {}

    @Post()
    async create(@User<AccessToken>() token: AccessToken,  @Body() createPostDto: CreatePostDto): Promise<PostEntity> {
        return await this.postsService.create({...createPostDto, author_id: token.id});
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
        return await this.postsService.update(id, updatePostDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string): Promise<PostEntity> {
        return await this.postsService.remove(id);
    }
}
