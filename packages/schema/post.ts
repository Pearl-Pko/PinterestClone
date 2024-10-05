import { OmitType, PartialType } from "nestjs-mapped-types";
import {Post} from "@prisma/client"
import { IsDate, IsNotEmpty, IsOptional, IsString, IsUrl, IsUUID } from "class-validator"


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
  image_url: string;

  @IsUrl({}, {message: "Link must be a url"})
  @IsOptional()
  external_link?: string | null | undefined;

  @IsOptional()
  description?: string | null | undefined;

  @IsOptional()
  tags?: string | null | undefined;

  @IsString()
  author_id: string;

  @IsDate()
  created_at: Date;

  @IsDate()
  updated_at: Date;
}

export class CreatePostDto extends OmitType(PostEntity, ["author_id", "updated_at", "created_at", "id", "image_url"]) {}

export class UpdatePostDto extends PartialType(CreatePostDto) {}