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
import { User, UserDocument } from '../users/schema/user.schema.js';
import { ExpoPushService } from './expo-push.service.js';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly expoPush: ExpoPushService,
  ) {}

  async create(
    recipientId: string,
    senderId: string,
    type: NotificationType,
    message: string,
    postId?: string,
  ) {
    if (recipientId === senderId) return null;

    const notification = await this.notificationModel.create({
      recipient_id: recipientId,
      sender_id: senderId,
      type,
      message,
      post_id: postId,
      is_read: false,
    });

    // El aviso in-app ya quedó guardado; el push va en paralelo y no lo bloquea.
    void this.expoPush
      .send(recipientId, senderId, type, message, postId)
      .catch(() => {});

    return notification;
  }

  /** Notificaciones del usuario con los datos del remitente resueltos. */
  async findAll(userId: string) {
    const notifications = await this.notificationModel
      .find({ recipient_id: userId })
      .sort({ createdAt: -1 });

    const senderIds = [...new Set(notifications.map((item) => item.sender_id))];

    const senders = await this.userModel
      .find({ _id: { $in: senderIds } })
      .select('user_name avatar_url');

    const sendersMap = new Map(
      senders.map((sender) => [sender._id.toString(), sender]),
    );

    return notifications.map((notification) => {
      const sender = sendersMap.get(notification.sender_id);

      return {
        ...notification.toObject(),
        sender: {
          user_name: sender?.user_name ?? 'Usuario',
          avatar_url: sender?.avatar_url ?? '',
        },
      };
    });
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

  /** Borra las notificaciones de un usuario que se elimina de la app. */
  async removeAllByUser(userId: string) {
    await this.notificationModel.deleteMany({
      $or: [{ recipient_id: userId }, { sender_id: userId }],
    });
  }
}