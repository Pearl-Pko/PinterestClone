import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    SerializeOptions,
    UseInterceptors,
} from '@nestjs/common';
import { BoardService } from './board.service';
import { FormDataRequest, MemoryStoredFile } from 'nestjs-form-data';
import { AccessTokenDTO } from '@schema/auth';
import { User } from '@server/decorators/user';
import { BoardEntity, CreateBoardDto, UpdateBoardDto } from '@schema/board';
import { PinService } from './pin.service';
import { ApiResponse, PaginatedQuery, PaginatedResponse } from '@schema/util';
import { Type } from 'class-transformer';
import { Board } from '@prisma/client';
class BoardEntityApiResponse extends ApiResponse<Board | Board[]> {
    @Type(() => BoardEntity)
    data?: Board | Board[] | undefined;
}

@SerializeOptions({
    groups: ['user.embed'],
    type: BoardEntityApiResponse,
})
@Controller('board')
export class BoardController {
    constructor(
        private readonly boardService: BoardService,
        private readonly pinService: PinService,
    ) {}

    @Post()
    async create(
        @User<AccessTokenDTO>() token: AccessTokenDTO,
        @Body() createBoardDto: CreateBoardDto,
    ): Promise<ApiResponse<Board>> {
        return {
            status: 'success',
            message: 'Board created successfully',
            data: await this.boardService.create(createBoardDto, token.sub),
        };
    }

    @Patch(':id')
    async edit(
        @Param('id') id: string,
        @User<AccessTokenDTO>() token: AccessTokenDTO,
        @Body() updateBoardDto: UpdateBoardDto,
    ): Promise<ApiResponse<Board>> {
        return {
            message: 'Board edited successfully',
            status: 'success',
            data: await this.boardService.edit(id, token.sub, updateBoardDto),
        };
    }

    @Delete(':id')
    async delete(
        @Param('id') id: string,
        @User<AccessTokenDTO>() token: AccessTokenDTO,
    ): Promise<ApiResponse<Board>> {
        return {
            message: 'Board deleted successfully',
            status: 'success',
            data: await this.boardService.deleteBoard(id, token.sub),
        };
    }

    @Patch(':id/restore')
    async restore(
        @Param('id') id: string,
        @User<AccessTokenDTO>() token: AccessTokenDTO,
    ): Promise<ApiResponse<Board>> {
        return {
            message: 'Board restored successfully',
            status: 'success',
            data: await this.boardService.restoreBoard(id, token.sub),
        };
    }

    @Get()
    async getAllBoards(
        @User<AccessTokenDTO>() token: AccessTokenDTO,
        @Query() query: PaginatedQuery,
    ): Promise<PaginatedResponse<Board>> {
        const { boards, totalCount } = await this.boardService.getBoards(
            token.sub,
            query,
            true,
        );

        return {
            page: query.page,
            totalCount: totalCount,
            limit: query.limit,
            data: boards,
        };
    }

    @Get('user/:userId')
    async getAllBoardsForAUser(
        @Param('userId') userId: string,
        @Query() query: PaginatedQuery,
    ) {
        const { boards, totalCount } = await this.boardService.getBoards(
            userId,
            query,
            false,
        );

        return {
            page: query.page,
            totalCount: totalCount,
            limit: query.limit,
            data: boards,
        };
    }

    @Get(':id')
    async getBoard(
        @Param('id') id: string,
        @User<AccessTokenDTO>() token: AccessTokenDTO,
    ): Promise<ApiResponse<Board>> {
        return {
            status: 'success',
            message: 'Board returned successfully',
            data: await this.boardService.getOneBoard(id, token.sub),
        };
    }

    @Get(':id/pins')
    async getPinsInBoard() {}
}
