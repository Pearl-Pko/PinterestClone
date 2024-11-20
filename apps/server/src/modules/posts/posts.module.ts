import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { DatabaseModule } from '@server/modules/database/database.module';
import { S3Module } from '../s3/s3.module';

@Module({
  imports: [S3Module],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
