
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module.js';
import { PostsModule } from '../posts/posts.module.js';

import { GarmentsController } from './garments.controller.js';
import { GarmentsService } from './garments.service.js';
import { Garment, GarmentSchema } from './schema/garment.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Garment.name,
        schema: GarmentSchema,
      },
    ]),
    AuthModule,
    PostsModule,
  ],
  controllers: [GarmentsController],
  providers: [GarmentsService],
})
export class GarmentsModule {}
