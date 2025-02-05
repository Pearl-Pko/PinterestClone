import {Pin, Post, User} from "@prisma/client";
import { Exclude, Expose, Type } from "class-transformer";
import {IsDate, IsOptional, IsString, MaxLength} from "class-validator";
import { PartialType, PickType } from "nestjs-mapped-types";
import { PostEntity } from "./post";
import { UserEntity } from "./user";

export class PinEntity implements Pin {
    @IsString()
    id: string;

    @IsString()
    user_id: string;

    @IsString()
    board_id: string;

    @IsString()
    post_id: string;

    @Expose({groups: ['pin.private'] })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    private_note: string | null;

    @IsDate()
    created_at: Date;

    @IsDate()
    updated_at: Date;

    @Type(() => PostEntity)
    post?: Post

    @Type(() => UserEntity)
    user?: User
}

export class CreatePinDto extends PickType(PinEntity, ["board_id", "post_id", "private_note"]) {
    @Expose()
    private_note: string | null;
}

// export class UpdatePinDto extends PartialType(PickType(PinEntity, ["post_id"]))