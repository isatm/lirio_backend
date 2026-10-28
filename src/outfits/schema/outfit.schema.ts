import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

import {
  GARMENT_TYPES,
  type GarmentType,
} from '../../posts/schema/post.schema.js';

export type OutfitDocument = HydratedDocument<Outfit>;

@Schema({
  _id: false,
})
export class OutfitItem {
  @Prop({
    type: Types.ObjectId,
    ref: 'Post',
    required: true,
  })
  post_id: Types.ObjectId;

  @Prop({
    type: String,
    enum: GARMENT_TYPES,
    required: true,
  })
  garment_type: GarmentType;
}

export const OutfitItemSchema = SchemaFactory.createForClass(OutfitItem);

@Schema({
  timestamps: true,
})
export class Outfit {
  @Prop({
    required: true,
    trim: true,
  })
  name: string;

  @Prop({
    required: true,
  })
  user_id: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  is_public: boolean;

  @Prop({
    type: [OutfitItemSchema],
    default: [],
  })
  items: OutfitItem[];

  createdAt?: Date;
  updatedAt?: Date;
}

export const OutfitSchema = SchemaFactory.createForClass(Outfit);
