import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { DatabaseModule } from '@server/modules/database/database.module';
import { S3Module } from '../s3/s3.module';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { PinController } from './pin.controller';
import { PinService } from './pin.service';

@Module({
  imports: [S3Module],
  controllers: [PostsController, BoardController, PinController],
  providers: [PostsService, BoardService, PinService],
})
export class PostsModule {}
