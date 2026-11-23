import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

export enum NotificationType {
  LIKE = 'LIKE',
  SAVE = 'SAVE',
  FOLLOW = 'FOLLOW',
}

@Schema({
  timestamps: true,
})
export class Notification {
  @Prop({
    required: true,
  })
  recipient_id: string;

  @Prop({
    required: true,
  })
  sender_id: string;

  @Prop({
    required: true,
    enum: NotificationType,
  })
  type: NotificationType;

  @Prop({
    required: false,
  })
  post_id?: string;

  @Prop({
    required: true,
    trim: true,
  })
  message: string;

  @Prop({
    default: false,
  })
  is_read: boolean;
}

export const NotificationSchema =
  SchemaFactory.createForClass(Notification);

NotificationSchema.index({
  recipient_id: 1,
  createdAt: -1,
});