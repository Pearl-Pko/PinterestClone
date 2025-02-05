import {
    Controller,
    Get,
    Body,
    Patch,
    Param,
    Post,
    Delete,
    NotFoundException,
    UseInterceptors,
    UploadedFile,
    Query,
    ClassSerializerInterceptor,
    SerializeOptions,
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
import { PinEntity } from '@schema/pin';
import {
    Expose,
    instanceToPlain,
    plainToClassFromExist,
    plainToInstance,
    Type,
} from 'class-transformer';
import { Post as _Post } from '@prisma/client';

class PostEntityApiResponse extends ApiResponse<PostEntity> {
    @Type(() => PostEntity)
    data?: PostEntity | undefined;
}

class PostEntityPaginatedResponse extends PaginatedResponse<PostEntity> {
    @Type(() => PostEntity)
    data: PostEntity[];
}

// @UseInterceptors(ClassSerializerInterceptor)
@Controller('posts')
export class PostsController {
    constructor(private readonly postsService: PostsService) {}

    @Post()
    @FormDataRequest({ storage: MemoryStoredFile })
    @SerializeOptions({
        groups: ['user.embed'],
        type: PostEntityApiResponse,
    })
    async create(
        @User<AccessTokenDTO>() token: AccessTokenDTO,
        @Body() createPostDto: CreatePostDto,
    ): Promise<PostEntityApiResponse> {
        return {
            message: 'Post created successfully',
            status: 'success',
            data: await this.postsService.create(createPostDto, token.sub),
        };
    }

    @Patch('batch-edit')
    async batchUpdate(
        @Body() posts: BatchEditPosts,
        @User<AccessTokenDTO>() token: AccessTokenDTO,
    ): Promise<PostEntityApiResponse> {
        const { postIds, ...updatePostDto } = posts;
        const payload = await this.postsService.batchEdit(
            token.sub,
            updatePostDto,
            postIds,
        );
        return {
            message: `Successfully edited ${payload.count} out of ${posts.postIds.length} posts`,
            status: 'success',
        };
    }

    @Patch('batch-publish')
    async batchPublish(
        @Body() posts: BatchPosts,
        @User<AccessTokenDTO>() token: AccessTokenDTO,
    ): Promise<PostEntityApiResponse> {
        const count = await this.postsService.batchPublish(
            token.sub,
            posts.postIds,
        );

        return {
            message: `Successfully published ${count} out of ${posts.postIds.length} posts`,
            status: 'success',
        };
    }

    @Delete('batch-delete')
    async batchDelete(
        @Body() posts: BatchPosts,
        @User<AccessTokenDTO>() token: AccessTokenDTO,
    ): Promise<PostEntityApiResponse> {
        const count = await this.postsService.batchDelete(
            token.sub,
            posts.postIds,
        );

        return {
            message: `Successfully deleted ${count.count} out of ${posts.postIds.length} posts`,
            status: 'success',
        };
    }

    @Patch(':id')
    @FormDataRequest({ storage: MemoryStoredFile })
    @SerializeOptions({
        groups: ['user.embed'],
        type: PostEntityApiResponse,
    })
    async update(
        @Param('id') id: string,
        @User<AccessTokenDTO>() token: AccessTokenDTO,
        @Body() updatePostDto: UpdatePostDto,
    ): Promise<PostEntityApiResponse> {
        return {
            message: 'Post updated successfully',
            status: 'success',
            data: await this.postsService.update(id, token.sub, updatePostDto),
        };
    }

    @Delete(':id')
    async remove(
        @Param('id') id: string,
        @User<AccessTokenDTO>() token: AccessTokenDTO,
    ): Promise<PostEntityApiResponse> {
        await this.postsService.remove(id, token.sub);
        return {
            message: 'Post deleted successfully',
            status: 'success',
        };
    }

    @Patch(':id/publish')
    @SerializeOptions({
        groups: ['user.embed'],
        type: PostEntityApiResponse,
    })
    async publishPost(
        @Param('id') id: string,
        @User<AccessTokenDTO>() token: AccessTokenDTO,
    ): Promise<PostEntityApiResponse> {
        return {
            message: 'Post published successsfully',
            status: 'success',
            data: await this.postsService.publish(id, token.sub),
        };
    }

    @Get(':id')
    @SerializeOptions({
        groups: ['user.embed'],
        type: PostEntityApiResponse,
    })
    @UseInterceptors(ClassSerializerInterceptor)
    async getPost(
        @Param('id') id: string,
        @User<AccessTokenDTO>() token: AccessTokenDTO,
    ) {
        const post = await this.postsService.getOnePost(id, token.sub);
        return {
            message: 'ds',
            status: 'success',
            data: post,
        };
    }

    @Get('/user/:userId')
    @SerializeOptions({
        type: PostEntityPaginatedResponse,
        groups: ['user.embed'],
    })
    async getAllPostsForAUser(
        @Param('userId') userId: string,
        @Query() query: PaginatedQuery,
    ): Promise<PostEntityPaginatedResponse> {
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
    @SerializeOptions({
        groups: ['user.embed'],
        type: PostEntityPaginatedResponse,
    })
    async getAllUserPosts(
        @User<AccessTokenDTO>() token: AccessTokenDTO,
        @Query() query: GetAllPosts,
    ): Promise<PostEntityPaginatedResponse> {
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
