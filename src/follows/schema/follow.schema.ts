import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

import { User } from '../../users/schema/user.schema.js';

export type FollowDocument = HydratedDocument<Follow>;

@Schema({ timestamps: true })
export class Follow {
  /** Usuario que sigue. */
    @Prop({ type: Types.ObjectId, ref: User.name, required: true })
    follower: Types.ObjectId;

  /** Usuario que es seguido. */
    @Prop({ type: Types.ObjectId, ref: User.name, required: true })
    following: Types.ObjectId;
}

export const FollowSchema = SchemaFactory.createForClass(Follow);

// Evita seguir dos veces a la misma cuenta y acelera el estado del botón.
FollowSchema.index({ follower: 1, following: 1 }, { unique: true });

// Acelera la lista de seguidores y su contador.
FollowSchema.index({ following: 1, createdAt: -1 });

// Acelera la lista de seguidos y su contador.
FollowSchema.index({ follower: 1, createdAt: -1 });