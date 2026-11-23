import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  Notification,
  NotificationDocument,
  NotificationType,
} from './schema/notification.schema.js';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
  ) {}

  async create(
    recipientId: string,
    senderId: string,
    type: NotificationType,
    message: string,
    postId?: string,
  ) {
    if (recipientId === senderId) return null;

    return this.notificationModel.create({
      recipient_id: recipientId,
      sender_id: senderId,
      type,
      message,
      post_id: postId,
      is_read: false,
    });
  }

  async findAll(userId: string) {
    return this.notificationModel
      .find({ recipient_id: userId })
      .sort({ createdAt: -1 });
  }

  async countUnread(userId: string) {
    const count = await this.notificationModel.countDocuments({
      recipient_id: userId,
      is_read: false,
    });

    return { count };
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.notificationModel.findById(notificationId);

    if (!notification) {
      throw new NotFoundException('Notificación no encontrada');
    }

    if (notification.recipient_id !== userId) {
      throw new ForbiddenException(
        'No puedes modificar esta notificación',
      );
    }

    notification.is_read = true;
    await notification.save();

    return {
      message: 'Notificación marcada como leída',
      notification,
    };
  }

  async markAllAsRead(userId: string) {
    await this.notificationModel.updateMany(
      {
        recipient_id: userId,
        is_read: false,
      },
      {
        $set: { is_read: true },
      },
    );

    return {
      message: 'Todas las notificaciones fueron marcadas como leídas',
    };
  }

  async remove(notificationId: string, userId: string) {
    const notification = await this.notificationModel.findById(notificationId);

    if (!notification) {
      throw new NotFoundException('Notificación no encontrada');
    }

    if (notification.recipient_id !== userId) {
      throw new ForbiddenException(
        'No puedes eliminar esta notificación',
      );
    }

    await this.notificationModel.findByIdAndDelete(notificationId);

    return {
      message: 'Notificación eliminada correctamente',
    };
  }
}