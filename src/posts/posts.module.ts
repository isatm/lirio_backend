import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';

import { PostsController } from './posts.controller.js';
import { PostsService } from './posts.service.js';

import {
  Post,
  PostSchema,
} from './schema/post.schema.js';

import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Post.name,
        schema: PostSchema,
      },
    ]),

    AuthModule,
  ],

  controllers: [PostsController],

  providers: [PostsService],
})
export class PostsModule {}