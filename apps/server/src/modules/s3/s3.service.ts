import {
    CopyObjectCommand,
    DeleteObjectCommand,
    PutBucketLifecycleConfigurationCommand,
    PutObjectCommand,
    PutObjectTaggingCommand,
    S3Client,
    Tag,
} from '@aws-sdk/client-s3';
import {
    CreateJobCommand,
    DescribeJobCommand,
    S3ControlClient,
    S3Tag,
} from '@aws-sdk/client-s3-control';
import {
    Injectable,
    Logger,
    OnApplicationBootstrap,
    OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MemoryStoredFile } from 'nestjs-form-data';

@Injectable()
export class S3Service {
    private s3Client: S3Client;
    private s3ControlClient: S3ControlClient;
    private bucketName: string | undefined;
    private logger = new Logger('S3');

    constructor(private configService: ConfigService) {
        this.s3Client = new S3Client({
            region: this.configService.get<string>('AWS_REGION'),
        });
        this.s3ControlClient = new S3ControlClient({
            region: this.configService.get<string>('AWS_REGION'),
        });
        this.bucketName = this.configService.get<string>('BUCKET_NAME');
    }

    async uploadFile(file: MemoryStoredFile, key: string, tags?: S3Tag[]) {
        key = 'public/' + key;

        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: file.buffer,

            ContentType: file.mimetype,
            Tagging: tags ? tags.map((tag) => `${tag.Key}=${tag.Value}`).join('&') : "",
        });

        try {
            const data = await this.s3Client.send(command);
            return `https://${this.bucketName}.s3.amazonaws.com/${key}`;
        } catch (error) {
            throw new Error(`Failed to upload file: ${error.message}`);
        }
    }

    async CopyObject(sourceKey: string, destinationKey: string, tags: S3Tag[]) {
        destinationKey = 'public/' + destinationKey;

        const command = new CopyObjectCommand({
            Bucket: this.bucketName,
            CopySource: `${this.bucketName}/${sourceKey}`,
            Key: destinationKey,
            Tagging: tags.map((tag) => `${tag.Key}=${tag.Value}`).join('&'),
        });

        try {
            const data = await this.s3Client.send(command);
            return `https://${this.bucketName}.s3.amazonaws.com/${destinationKey}`;
        } catch (error) {
            throw error;
        }
    }

    async modifyTag(key: string, tags: S3Tag[]) {
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

    async deleteFile(key: string) {
        const command = new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });

        try {
            const data = await this.s3Client.send(command);
            await this.s3Client.send(command);
            return true;
        } catch (error) {
            throw new Error(`Failed to delete file: ${error.message}`);
        }
    }

    async bulkApplyTags(keys: string[], tags: S3Tag[]) {
        // const command2 = new DescribeJobCommand({
        //     JobId: "8223d56c-d33f-4c4f-a397-73b7e3e947fd",
        //     AccountId:  "533267411861"
        // })
        // const job = await this.s3ControlClient.send(command2);
        // console.log("job", job.Job)
        // return ;
        const manifest = keys
            .map((key) => `${this.bucketName},${keys}`)
            .join('\n');
        const key = `manifest/${Date.now()}`;
        const manifestETag = await this.uploadManifest(key, manifest);

        const command = new CreateJobCommand({
            AccountId: this.configService.get<string>('AWS_ACCOUNT_ID')!,
            Operation: {
                S3PutObjectTagging: {
                    TagSet: tags,
                },
            },
            ConfirmationRequired: false,
            Report: {
                Enabled: false,
            },
            Priority: 1,
            Manifest: {
                Location: {
                    ObjectArn: `arn:aws:s3:::${this.bucketName}/${key}`,
                    ETag: manifestETag,
                },
                Spec: {
                    Format: 'S3BatchOperations_CSV_20180820',
                    Fields: ['Bucket', 'Key'],
                },
            },
            RoleArn: this.configService.get<string>('BATCH_S3_ROLE'),
        });
        try {
            const response = await this.s3ControlClient.send(command);
            console.log('response', response.JobId);
            this.logger.log(`Batch job created ${response.JobId}`);
        } catch (error) {
            throw error;
        }
    }

    async uploadManifest(key: string, manifest: string) {

        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            ContentType: 'text/csv',
            Body: manifest,
        });

        try {
            const response = await this.s3Client.send(command);
            return response.ETag;
        } catch (error) {
            throw error;
        }
    }
}
