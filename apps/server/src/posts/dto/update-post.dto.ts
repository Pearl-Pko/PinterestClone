import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';

export class UpdatePostDto extends PartialType(
    OmitType(CreatePostDto, ['author_id'] as const),
) {}
