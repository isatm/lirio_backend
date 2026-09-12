import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';

import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { User, UserSchema } from './schema/user.schema.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    PassportModule,
    AuthModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}