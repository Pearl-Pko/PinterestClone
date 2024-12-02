import { PostEntity } from "@schema/post";
import { Transform } from "class-transformer";
import { IsInstance, IsNotEmpty } from "class-validator";
import { OmitType } from "nestjs-mapped-types";


export class CreatePostWebDto extends OmitType(PostEntity, [
  "author_id",
  "updated_at",
  "created_at",
  "id",
  "content_uri",
  "expiresAt",
  "status",
]) {
  content: FileList;
}
