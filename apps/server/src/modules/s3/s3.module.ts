import { Module } from '@nestjs/common';
import { S3Service } from './s3.service';
import { ConfigService } from '@nestjs/config';
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';

@Module({
    providers: [S3Service, ConfigService],
    exports: [S3Service],
})
export class S3Module {
    
}
