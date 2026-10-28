import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsersModule } from './users/users.module.js';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsModule } from './posts/posts.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { GarmentsModule } from './garments/garments.module.js';
import { ReportsModule } from './reports/reports.module.js';
import { OutfitsModule } from './outfits/outfits.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRoot(process.env.MONGODB_URI!),

    UsersModule,

    PostsModule,

    CategoriesModule,

    GarmentsModule,
    ReportsModule,

    OutfitsModule,
  ],
})
export class AppModule {}
