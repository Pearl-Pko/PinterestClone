import { OmitType, PartialType } from "@nestjs/mapped-types";
import {Post} from "@prisma/client"
import { IsDate, IsNotEmpty, IsOptional, IsUUID } from "class-validator"


  type OptionalNullableProperties<T> = {
    [K in keyof T as null extends T[K] ? never : K]: T[K]

  } & {
    [K in keyof T as null extends T[K] ? K : never]?: T[K]
  };

type Diddy = OptionalNullableProperties<Post> 

export class PostEntity implements Diddy {
    author_id: string;
    created_at: Date;
    description?: string | null | undefined;
    external_link?: string | null | undefined;
    id: string;
    image_url: string;
    tags?: string | null | undefined;
    title?: string | null | undefined;
    updated_at: Date;
}

export class CreatePostDto extends OmitType(PostEntity, ["author_id", "updated_at", "created_at", "id"]) {}

export class UpdatePostDto extends PartialType(CreatePostDto) {}