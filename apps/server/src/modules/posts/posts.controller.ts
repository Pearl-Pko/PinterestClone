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
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { User } from '@server/decorators/user';
import {CreatePostDto, PostEntity, UpdatePostDto} from "@schema/post"
import { AccessTokenDTO } from '@schema/auth';
import { FileInterceptor } from '@nestjs/platform-express';
import { FormDataRequest, MemoryStoredFile } from 'nestjs-form-data';
@Controller('posts')
export class PostsController {
    constructor(private readonly postsService: PostsService) {}

    @Post()
    @FormDataRequest({storage: MemoryStoredFile})
    async create(@User<AccessTokenDTO>() token: AccessTokenDTO,  @Body() createPostDto: CreatePostDto): Promise<PostEntity> {
        return await this.postsService.create(createPostDto, token.sub);
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
