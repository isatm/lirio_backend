import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';

import { PostsController } from './posts.controller.js';
import { PostsService } from './posts.service.js';

import {
  Post,
  PostSchema,
} from './schema/post.schema.js';

import { User, UserSchema } from '../users/schema/user.schema.js';
import { Category, CategorySchema } from '../categories/schema/category.schema.js';

import { AuthModule } from '../auth/auth.module.js';

import { CloudinaryService } from './cloudinary/cloudinary.service.js';
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Post.name,
        schema: PostSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Category.name,
        schema: CategorySchema,
      },
    ]),

    AuthModule,
  ],

  controllers: [PostsController],

  providers: [PostsService, CloudinaryService],

  exports: [PostsService],
})
export class PostsModule {}