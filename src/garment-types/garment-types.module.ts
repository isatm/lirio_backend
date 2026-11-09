import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';

import { GarmentTypesController } from './garment-types.controller.js';
import { GarmentTypesService } from './garment-types.service.js';

import {
  GarmentType,
  GarmentTypeSchema,
} from './schema/garment-type.schema.js';

import { Post, PostSchema } from '../posts/schema/post.schema.js';
import { Outfit, OutfitSchema } from '../outfits/schema/outfit.schema.js';

import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: GarmentType.name,
        schema: GarmentTypeSchema,
      },
      {
        name: Post.name,
        schema: PostSchema,
      },
      {
        name: Outfit.name,
        schema: OutfitSchema,
      },
    ]),

    AuthModule,
  ],

  controllers: [GarmentTypesController],

  providers: [GarmentTypesService],

  exports: [GarmentTypesService],
})
export class GarmentTypesModule {}
