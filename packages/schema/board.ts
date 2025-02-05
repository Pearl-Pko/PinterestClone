import {Board} from "@prisma/client";
import {
    IsBoolean,
    IsDate,
    IsOptional,
    IsString,
    MaxLength,
} from "class-validator";
import {
    OmitType,
    PartialType,
    PickType,
    IntersectionType,
} from "nestjs-mapped-types";
import {UserEntity} from "./user";
import {Type} from "class-transformer";

export class BoardEntity implements Board {
    @IsString()
    id: string;

    @IsString()
    user_id: string;

    @IsOptional()
    @IsString()
    banner_id: string | null;

    @IsOptional()
    deletedAt: Date | null;

    @IsOptional()
    @IsString()
    description: string | null;

    @IsString()
    name: string;

    @IsOptional()
    @IsBoolean()
    private: boolean;

    @IsDate()
    created_at: Date;

    @IsDate()
    updated_at: Date;

    @Type(() => UserEntity)
    user?: UserEntity;

}
export class CreateBoardDto extends PickType(BoardEntity, [
    "name",
    "description",
    "private",
]) {}

export class UpdateBoardDto extends PartialType(
    IntersectionType(CreateBoardDto, PickType(BoardEntity, ["banner_id"]))
) {}
