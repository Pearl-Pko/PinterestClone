import {
    PutBucketLifecycleConfigurationCommand,
    PutObjectCommand,
    PutObjectTaggingCommand,
    S3Client,
    Tag,
} from '@aws-sdk/client-s3';
import {
    Injectable,
    OnApplicationBootstrap,
    OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MemoryStoredFile } from 'nestjs-form-data';

type Tags = { Key: string; Value: string }[];
@Injectable()
export class S3Service {
    private s3Client: S3Client;
    private bucketName: string | undefined;

    constructor(private configService: ConfigService) {
        this.s3Client = new S3Client({
            region: this.configService.get<string>('AWS_REGION'),
        });
        this.bucketName = this.configService.get<string>('BUCKET_NAME');
    }

    async uploadFile(file: MemoryStoredFile, key: string, tags: Tags) {
        key = 'public/' + key;

        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: file.buffer,

            ContentType: file.mimetype,
            Tagging: tags.map((tag) => `${tag.Key}=${tag.Value}`).join('&'),
        });

        try {
            const data = await this.s3Client.send(command);
            return `https://${this.bucketName}.s3.amazonaws.com/${key}`;
        } catch (error) {
            throw new Error(`Failed to upload file: ${error.message}`);
        }
    }

    async modifyTag(key: string, tags: Tags) {
        const command = new PutObjectTaggingCommand({
            Bucket: this.bucketName,
            Tagging: {
                TagSet: tags,
            },
            Key: key,
        });
        try {
            const data = await this.s3Client.send(command);
            return true;
        } catch (error) {
            throw new Error(`Failed to upload file: ${error.message}`);
        }
    }
}
