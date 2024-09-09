import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { DatabaseModule } from '@server/modules/database/database.module';

@Module({
  imports: [],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
