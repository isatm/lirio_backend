import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';

import type { Request } from 'express';

import { NotificationsService } from './notifications.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get()
  findAll(@Req() request: Request) {
    const user = request.user as { id: string };

    return this.notificationsService.findAll(user.id);
  }

  @Get('unread-count')
  countUnread(@Req() request: Request) {
    const user = request.user as { id: string };

    return this.notificationsService.countUnread(user.id);
  }

  @Patch('read-all')
  markAllAsRead(@Req() request: Request) {
    const user = request.user as { id: string };

    return this.notificationsService.markAllAsRead(user.id);
  }

  @Patch(':id/read')
  markAsRead(
    @Param('id') id: string,
    @Req() request: Request,
  ) {
    const user = request.user as { id: string };

    return this.notificationsService.markAsRead(id, user.id);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Req() request: Request,
  ) {
    const user = request.user as { id: string };

    return this.notificationsService.remove(id, user.id);
  }
}