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
import {
    CreatePostDto,
    GetAllPosts,
    PostEntity,
    UpdatePostDto,
} from '@schema/post';
import { AccessTokenDTO } from '@schema/auth';
import { FileInterceptor } from '@nestjs/platform-express';
import { FormDataRequest, MemoryStoredFile } from 'nestjs-form-data';
import { PaginatedResponse } from '@schema/util';
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
    async update(
        @Param('id') id: string,
        @Body() updatePostDto: UpdatePostDto,
    ) {
        return await this.postsService.update(id, updatePostDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string): Promise<PostEntity> {
        return await this.postsService.remove(id);
    }

    @Patch(':id/publish')
    async publishPost(@Param('id') id: string): Promise<PostEntity> {
        return await this.postsService.publish(id);
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
        );
        
        return {
            page: query.page,
            totalCount: totalCount,
            limit: query.limit,
            data: posts,
        };
    }
}
