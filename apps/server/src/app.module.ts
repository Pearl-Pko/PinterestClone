import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { DatabaseModule } from './modules/database/database.module';
import { PostsModule } from './modules/posts/posts.module';

@Module({
  imports: [ConfigModule.forRoot(), UsersModule, DatabaseModule, PostsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
