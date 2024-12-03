import {Pin} from "@prisma/client";
import { Exclude, Expose } from "class-transformer";
import {IsDate, IsOptional, IsString, MaxLength} from "class-validator";
import { PartialType, PickType } from "nestjs-mapped-types";

export class PinEntity implements Pin {
    @IsString()
    id: string;

    @IsString()
    user_id: string;

    @IsString()
    board_id: string;

    @IsString()
    post_id: string;

    @Expose({groups: ['user'], toClassOnly: true, })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    private_note: string | null;

    @IsDate()
    created_at: Date;

    @IsDate()
    updated_at: Date;
}

export class CreatePinDto extends PickType(PinEntity, ["board_id", "post_id", "private_note"]) {}

// export class UpdatePinDto extends PartialType(PickType(PinEntity, ["post_id"]))