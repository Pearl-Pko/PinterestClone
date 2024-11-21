import { OmitType, PartialType } from "nestjs-mapped-types";
import {Post, PostStatus} from "@prisma/client"
import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, IsUUID } from "class-validator"
import { HasMimeType, IsFile, MaxFileSize, MemoryStoredFile } from "nestjs-form-data";
import { PaginatedQuery } from "./util";

  type OptionalNullableProperties<T> = {
    [K in keyof T as null extends T[K] ? never : K]: T[K]

  } & {
    [K in keyof T as null extends T[K] ? K : never]?: T[K]
  };

type NullablePost = OptionalNullableProperties<Post> 

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
}

export class CreatePostDto extends OmitType(PostEntity, ["author_id", "updated_at", "created_at", "id", "content_uri", "expiresAt", "status"]) {
  @IsFile()
  @MaxFileSize(1e6, {message: "Max file size is 1mb"})
  @HasMimeType("image/*", {message: "Content must be an image"})
  content: MemoryStoredFile;
}

export class UpdatePostDto extends PartialType(CreatePostDto) {}

export class GetAllPosts extends PaginatedQuery {
  @IsEnum(PostStatus)
  @IsOptional()
  status: PostStatus = "posted"
}