import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    NotFoundException,
    UseInterceptors,
    UploadedFile,
    Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { User } from '@server/decorators/user';
import { GetAllPosts, GetUserPosts, PostEntity } from '@schema/post';
import { AccessTokenDTO } from '@schema/auth';
import { FileInterceptor } from '@nestjs/platform-express';
import { FormDataRequest, MemoryStoredFile } from 'nestjs-form-data';
import { PaginatedResponse } from '@schema/util';
import { CreatePostDto, UpdatePostDto } from './dto';
@Controller('posts')
export class PostsController {
    constructor(private readonly postsService: PostsService) {}

    @Post()
    @FormDataRequest({ storage: MemoryStoredFile })
    async create(
        @User<AccessTokenDTO>() token: AccessTokenDTO,
        @Body() createPostDto: CreatePostDto,
    ): Promise<PostEntity> {
        return await this.postsService.create(createPostDto, token.sub);
    }

    @Patch(':id')
    @FormDataRequest({ storage: MemoryStoredFile })
    async update(
        @Param('id') id: string,
        @User<AccessTokenDTO>() token: AccessTokenDTO,
        @Body() updatePostDto: UpdatePostDto,
    ) {
        return await this.postsService.update(id, token.sub, updatePostDto);
    }

    @Delete(':id')
    async remove(
        @Param('id') id: string,
        @User<AccessTokenDTO>() token: AccessTokenDTO,
    ): Promise<PostEntity> {
        return await this.postsService.remove(id, token.sub);
    }

    @Patch(':id/publish')
    async publishPost(
        @Param('id') id: string,
        @User<AccessTokenDTO>() token: AccessTokenDTO,
    ): Promise<PostEntity> {
        return await this.postsService.publish(id, token.sub);
    }

    @Get(':id')
    async getPost(
        @Param('id') id: string,
        @User<AccessTokenDTO>() token: AccessTokenDTO,
    ) {
        return await this.postsService.getOnePost(id, token.sub);
    }

    async getAllPostsForAUser(
        @Query() query: GetUserPosts,
        @User<AccessTokenDTO>() token: AccessTokenDTO,
    ): Promise<PaginatedResponse<PostEntity>> {
        const { posts, totalCount } = await this.postsService.getAllUserPosts(
            token.sub,
            query,
            'posted'
        );

        return {
            page: query.page,
            totalCount: totalCount,
            limit: query.limit,
            data: posts,
        };
    }

    @Get()
    async getAllUserPosts(
        @User<AccessTokenDTO>() token: AccessTokenDTO,
        @Query() query: GetAllPosts,
    ): Promise<PaginatedResponse<PostEntity>> {
        console.log('status', query.status);
        const { posts, totalCount } = await this.postsService.getAllUserPosts(
            token.sub,
            query,
            query.status
        );

        return {
            page: query.page,
            totalCount: totalCount,
            limit: query.limit,
            data: posts,
        };
    }
}
