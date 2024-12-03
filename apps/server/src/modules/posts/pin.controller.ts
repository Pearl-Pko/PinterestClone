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
import { PaginatedQuery, PaginatedResponse } from '@schema/util';
import {
    ClassTransformOptions,
    instanceToPlain,
    plainToClass,
    plainToInstance,
} from 'class-transformer';
import { BoardService } from './board.service';

@Controller('pin')
export class PinController {
    constructor(
        private readonly pinService: PinService,
        private readonly boardService: BoardService,
    ) {}

    @Post()
    async create(
        @User<AccessTokenDTO>() token: AccessTokenDTO,
        @Body() createPinDto: CreatePinDto,
    ) {
        return await this.pinService.create(token.sub, createPinDto);
    }

    @Get(':id')
    async get(
        @Param('id') id: string,
        @User<AccessTokenDTO>() token: AccessTokenDTO,
    ) {
        const pin = await this.pinService.getPin(id, token.sub);

        const transformOptions: ClassTransformOptions = {
            groups: token.sub === pin.user_id ? ['user'] : [],
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

        return sanitizedPin;
    }

    @Delete(':id')
    async remove(
        @Param('id') id: string,
        @User<AccessTokenDTO>() token: AccessTokenDTO,
    ) {
        return await this.pinService.removePin(id, token.sub);
    }

    @Get()
    async getAllPins(
        @User<AccessTokenDTO>() token: AccessTokenDTO,
        @Query() query: PaginatedQuery,
    ): Promise<PaginatedResponse<PinEntity>> {
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
        const { pins, totalCount } = await this.pinService.getPinsInBoard(
            boardId,
            token.sub,
            query,
        );

        const transformOptions: ClassTransformOptions = {
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
