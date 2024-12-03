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
    BatchEditPosts,
    BatchPosts,
    GetAllPosts,
    GetUserPosts,
    PostEntity,
} from '@schema/post';
import { AccessTokenDTO } from '@schema/auth';
import { FileInterceptor } from '@nestjs/platform-express';
import { FormDataRequest, MemoryStoredFile } from 'nestjs-form-data';
import { ApiResponse, PaginatedQuery, PaginatedResponse } from '@schema/util';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';
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

    @Patch('batch-edit')
    async batchUpdate(
        @Body() posts: BatchEditPosts,
        @User<AccessTokenDTO>() token: AccessTokenDTO,
    ): Promise<ApiResponse> {
        const { postIds, ...updatePostDto } = posts;
        const payload = await this.postsService.batchEdit(
            token.sub,
            updatePostDto,
            postIds,
        );
        return {
            message: `Successfully edited ${payload.count} out of ${posts.postIds.length} posts`,
            status: true,
        };
    }

    @Patch('batch-publish')
    async batchPublish(
        @Body() posts: BatchPosts,
        @User<AccessTokenDTO>() token: AccessTokenDTO,
    ): Promise<ApiResponse> {
        const count = await this.postsService.batchPublish(
            token.sub,
            posts.postIds,
        );

        return {
            message: `Successfully published ${count} out of ${posts.postIds.length} posts`,
            status: true,
        };
    }

    @Delete('batch-delete')
    async batchDelete(
        @Body() posts: BatchPosts,
        @User<AccessTokenDTO>() token: AccessTokenDTO,
    ): Promise<ApiResponse> {
        const count = await this.postsService.batchDelete(
            token.sub,
            posts.postIds,
        );

        return {
            message: `Successfully deleted ${count.count} out of ${posts.postIds.length} posts`,
            status: true,
        };
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

    @Get('/user/:userId')
    async getAllPostsForAUser(
        @Param('userId') userId: string,
        @Query() query: PaginatedQuery,
    ): Promise<PaginatedResponse<PostEntity>> {
        const { posts, totalCount } = await this.postsService.getAllUserPosts(
            userId,
            query,
            'posted',
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
        const { posts, totalCount } = await this.postsService.getAllUserPosts(
            token.sub,
            query,
            query.status,
        );

        return {
            page: query.page,
            totalCount: totalCount,
            limit: query.limit,
            data: posts,
        };
    }

    @Post(':id/duplicate')
    async duplicatePosts(
        @User<AccessTokenDTO>() token: AccessTokenDTO,
        @Param('id') postId: string,
    ) {
        return await this.postsService.duplicatePosts(token.sub, postId);
    }
}
