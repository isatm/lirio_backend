import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';

import { CategoriesController } from './categories.controller.js';
import { CategoriesService } from './categories.service.js';

import {
  Category,
  CategorySchema,
} from './schema/category.schema.js';

import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Category.name,
        schema: CategorySchema,
      },
    ]),

    AuthModule,
  ],

  controllers: [CategoriesController],

  providers: [CategoriesService],
})
export class CategoriesModule {}