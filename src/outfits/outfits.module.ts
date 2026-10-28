import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module.js';
import { Post, PostSchema } from '../posts/schema/post.schema.js';

import { OutfitsController } from './outfits.controller.js';
import { OutfitsService } from './outfits.service.js';
import { Outfit, OutfitSchema } from './schema/outfit.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Outfit.name,
        schema: OutfitSchema,
      },
      {
        name: Post.name,
        schema: PostSchema,
      },
    ]),
    AuthModule,
  ],
  controllers: [OutfitsController],
  providers: [OutfitsService],
})
export class OutfitsModule {}
