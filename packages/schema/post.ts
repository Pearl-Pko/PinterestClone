import {OmitType, PartialType, IntersectionType} from "nestjs-mapped-types";
import {Post, PostStatus} from "@prisma/client";
import {
    ArrayMinSize,
    IsArray,
    IsDate,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUrl,
    IsUUID,
} from "class-validator";
import {PaginatedQuery} from "./util";
import {UserEntity} from "./user";
import { Expose, Type } from "class-transformer";

type OptionalNullableProperties<T> = {
    [K in keyof T as null extends T[K] ? never : K]: T[K];
} & {
    [K in keyof T as null extends T[K] ? K : never]?: T[K];
};

type NullablePost = OptionalNullableProperties<Post>;

export class PostEntity implements NullablePost {
    @IsString()
    id: string;

    @IsOptional()
    title?: string | null | undefined;

    @IsUrl()
    content_uri: string;

    @IsUrl({}, {message: "Link must be a url"})
    @IsOptional()
    external_link?: string | null | undefined;

    @IsOptional()
    description?: string | null | undefined;

    @IsOptional()
    tags?: string | null | undefined;

    @IsString()
    author_id: string;

    @IsEnum(PostStatus)
    @IsOptional()
    status: PostStatus;

    @IsDate()
    @IsOptional()
    expiresAt?: Date | null | undefined;

    @IsDate()
    created_at: Date;

    @IsDate()
    updated_at: Date;

    @Expose()
    @Type(() => UserEntity)
    author?: UserEntity;

    constructor(partial: Partial<PostEntity>) {
        Object.assign(this, partial);
        console.log("happen");
    }
}

export class CreatePostDto extends OmitType(PostEntity, [
    "author_id",
    "updated_at",
    "created_at",
    "id",
    "content_uri",
    "expiresAt",
    "status",
    "author"
]) {
    
}

export class GetAllPosts extends PaginatedQuery {
    @IsEnum(PostStatus)
    @IsOptional()
    status: PostStatus = "posted";
}

export class GetUserPosts extends PaginatedQuery {
    @IsUUID()
    userId: string;
}

export class BatchPosts {
    @IsArray()
    @ArrayMinSize(1)
    @IsUUID("all", {each: true})
    postIds: string[];
}

export class BatchEditPosts extends IntersectionType(
    PartialType(
        OmitType(PostEntity, [
            "author_id",
            "updated_at",
            "created_at",
            "id",
            "content_uri",
            "expiresAt",
            "status",
        ])
    ),
    BatchPosts
) {}
