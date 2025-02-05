import { PostEntity, CreatePostDto as _CreatePostDto } from "@schema/post";
import { HasMimeType, IsFile, MaxFileSize, MemoryStoredFile } from "nestjs-form-data";
import { OmitType, PartialType } from "nestjs-mapped-types";

export class CreatePostDto extends _CreatePostDto {
    @IsFile()
    @MaxFileSize(1e6, {message: "Max file size is 1mb"})
    @HasMimeType("image/*", {message: "Content must be an image"})
    content: MemoryStoredFile;
  }

export class UpdatePostDto extends PartialType(CreatePostDto) {}
