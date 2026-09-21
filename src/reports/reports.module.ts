import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';

import { ReportsController } from './reports.controller.js';
import { ReportsService } from './reports.service.js';

import {
  Report,
  ReportSchema,
} from './schema/report.schema.js';

import {
  Post,
  PostSchema,
} from '../posts/schema/post.schema.js';

import {
  User,
  UserSchema,
} from '../users/schema/user.schema.js';

import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Report.name,
        schema: ReportSchema,
      },
      {
        name: Post.name,
        schema: PostSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),

    AuthModule,
  ],

  controllers: [ReportsController],

  providers: [ReportsService],
})
export class ReportsModule {}