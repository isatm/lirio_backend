import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { NotificationType } from './schema/notification.schema.js';
import { User, UserDocument } from '../users/schema/user.schema.js';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

const TITLES: Record<NotificationType, string> = {
  [NotificationType.LIKE]: 'Nuevo me gusta',
  [NotificationType.COMMENT]: 'Nuevo comentario',
  [NotificationType.FOLLOW]: 'Nuevo seguidor',
};

/**
 * Entrega el aviso al teléfono registrado del destinatario a través de Expo
 * Push. Expo es quien habla con FCM; aquí solo se manda el mensaje.
 */
@Injectable()
export class ExpoPushService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  /**
   * Nunca lanza: un push caído no debe romper el like, el comentario ni el
   * seguimiento que lo originó.
   */
  async send(
    recipientId: string,
    senderId: string,
    type: NotificationType,
    message: string,
    postId?: string,
  ): Promise<void> {
    const [recipient, sender] = await Promise.all([
      this.userModel.findById(recipientId).select('push_token'),
      this.userModel.findById(senderId).select('user_name'),
    ]);

    const pushToken = recipient?.push_token;

    if (!pushToken) return;

    try {
      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...(process.env.EXPO_ACCESS_TOKEN
            ? { Authorization: `Bearer ${process.env.EXPO_ACCESS_TOKEN}` }
            : {}),
        },
        body: JSON.stringify({
          to: pushToken,
          title: TITLES[type],
          body: `${sender?.user_name ?? 'Alguien'} ${message}`,
          data: {
            type,
            ...(postId ? { postId } : {}),
          },
          sound: 'default',
          channelId: 'default',
        }),
      });

      const payload = (await response.json()) as {
        data?: { status?: string; details?: { error?: string } };
      };

      // Expo aceptó el mensaje pero el teléfono ya no existe: se limpia para
      // no seguir intentando en cada aviso.
      if (payload.data?.details?.error === 'DeviceNotRegistered') {
        await this.userModel.updateOne(
          { _id: recipientId },
          { $set: { push_token: '' } },
        );
      }
    } catch (error) {
      console.error('No se pudo contactar a Expo Push:', error);
    }
  }
}
