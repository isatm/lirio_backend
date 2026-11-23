import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { NotificationsController } from './notifications.controller.js';
import { NotificationsService } from './notifications.service.js';
import { ExpoPushService } from './expo-push.service.js';
import { AuthModule } from '../auth/auth.module.js';
import { User, UserSchema } from '../users/schema/user.schema.js';

import {
  Notification,
  NotificationSchema,
} from './schema/notification.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Notification.name,
        schema: NotificationSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
    ]), AuthModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, ExpoPushService],
  exports: [NotificationsService],
})
export class NotificationsModule {}