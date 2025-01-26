import { EditProfileDto as _EditProfileDto } from '@schema/user';
import { IsOptional } from 'class-validator';
import {
    HasMimeType,
    IsFile,
    MaxFileSize,
    MemoryStoredFile,
} from 'nestjs-form-data';

export class EditProfileDto extends _EditProfileDto {
    @IsOptional()
    @IsFile()
    @MaxFileSize(1e6, { message: 'Max file size is 1mb' })
    @HasMimeType('image/*', { message: 'Display photo must be an image' })
    displayPhoto?: MemoryStoredFile;
}
