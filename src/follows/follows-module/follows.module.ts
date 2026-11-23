import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';

import { FollowsController } from '../follows-controller/follows.controller.js';
import { FollowsService } from '../follows-service/follows.service.js';
import { Follow, FollowSchema } from '../schema/follow.schema.js';
import { User, UserSchema } from '../../users/schema/user.schema.js';
import { AuthModule } from '../../auth/auth.module.js';
import { NotificationsModule } from '../../notifications/notifications.module.js';

@Module({
    imports: [
    MongooseModule.forFeature([
        { name: Follow.name, schema: FollowSchema },
        { name: User.name, schema: UserSchema },
    ]),
    PassportModule,
    AuthModule,
    NotificationsModule,
    ],
    controllers: [FollowsController],
    providers: [FollowsService],
  // Se exporta para limpiar los seguidores al borrar una cuenta.
    exports: [FollowsService],
    })
export class FollowsModule {}