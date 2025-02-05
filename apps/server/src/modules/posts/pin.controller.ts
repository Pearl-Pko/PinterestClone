import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Query,
    SerializeOptions,
    UseInterceptors,
} from '@nestjs/common';
import { PinService } from './pin.service';
import { AccessTokenDTO } from '@schema/auth';
import { CreatePinDto, PinEntity } from '@schema/pin';
import { User } from '@server/decorators/user';
import { ApiResponse, PaginatedQuery, PaginatedResponse } from '@schema/util';
import {
    ClassTransformOptions,
    instanceToPlain,
    plainToClass,
    plainToInstance,
    Type,
} from 'class-transformer';
import { BoardService } from './board.service';
import { Pin } from '@prisma/client';

class PinEntityApiResponse extends ApiResponse<Pin | Pin[]> {
    @Type(() => PinEntity)
    data?: Pin | Pin[] | undefined;
}

// @SerializeOptions({
//     groups: ['user.embed'],
//     type: PinEntityApiResponse,
// })
@Controller('pin')
export class PinController {
    constructor(
        private readonly pinService: PinService,
        private readonly boardService: BoardService,
    ) {}

    @Post()
    @SerializeOptions({
        groups: ['user.embed', 'pin.private'],
        type: PinEntityApiResponse,
    })
    async create(
        @User<AccessTokenDTO>() token: AccessTokenDTO,
        @Body() createPinDto: CreatePinDto,
    ): Promise<ApiResponse<Pin>> {
        console.log('create pin', createPinDto);
        return {
            message: 'Pin created successfully',
            status: 'success',
            data: await this.pinService.create(token.sub, createPinDto),
        };
    }

    @Get(':id')
    async get(
        @Param('id') id: string,
        @User<AccessTokenDTO>() token: AccessTokenDTO,
    ): Promise<ApiResponse<Record<string, any>>> {
        const pin = await this.pinService.getPin(id, token.sub);

        const transformOptions: ClassTransformOptions = {
            groups:
                token.sub === pin.user_id
                    ? ['user.embed', 'pin.private']
                    : ['user.embed'],
        };
        const sanitizedPinInstance = plainToInstance(
            PinEntity,
            pin,
            transformOptions,
        );

        const sanitizedPin = instanceToPlain(
            sanitizedPinInstance,
            transformOptions,
        );

        return {
            status: 'success',
            message: 'Pin retrieved successfully',
            data: sanitizedPin,
        };
    }

    @Delete(':id')
    async remove(
        @Param('id') id: string,
        @User<AccessTokenDTO>() token: AccessTokenDTO,
    ) {
        return await this.pinService.removePin(id, token.sub);
    }

    @Get()
    @SerializeOptions({
        groups: ['user.embed', 'pin.private'],
        type: PinEntityApiResponse,
    })
    async getAllPins(
        @User<AccessTokenDTO>() token: AccessTokenDTO,
        @Query() query: PaginatedQuery,
    ): Promise<PaginatedResponse<Pin>> {
        const { pins, totalCount } = await this.pinService.getAllUserPins(
            token.sub,
            query,
        );
        return {
            page: query.page,
            totalCount: totalCount,
            limit: query.limit,
            data: pins,
        };
    }

    @Get(':boardId/pins')
    async getAllPinsInABoard(
        @Param('boardId') boardId: string,
        @User<AccessTokenDTO>() token: AccessTokenDTO,
        @Query() query: PaginatedQuery,
    ) {
        const board = await this.boardService.getOneBoard(boardId, token.sub);

        const { pins, totalCount } = await this.pinService.getPinsInBoard(
            boardId,
            token.sub,
            query,
        );

        const transformOptions: ClassTransformOptions = {
            groups:
                token.sub === board.user_id
                    ? ['user.embed', 'pin.private']
                    : ['user.embed'],
        };
        const sanitizedPinInstances = plainToInstance(
            PinEntity,
            pins,
            transformOptions,
        );
        const sanitizedPins = instanceToPlain(
            sanitizedPinInstances,
            transformOptions,
        );

        return {
            page: query.page,
            totalCount: totalCount,
            limit: query.limit,
            data: sanitizedPins,
        };
    }
}
