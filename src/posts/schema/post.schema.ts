import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export const GARMENT_TYPES = ['SHIRT', 'PANTS', 'SHOES'] as const;
export type GarmentType = (typeof GARMENT_TYPES)[number];

export type PostDocument = HydratedDocument<Post>;

@Schema({
  timestamps: true,
})
export class Post {
  @Prop({
    required: true,
    trim: true,
  })
  title: string;

  @Prop({
    required: true,
  })
  image: string;

  @Prop({
    required: true,
    trim: true,
  })
  description: string;

  @Prop({
    required: true,
  })
  user_id: string;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'Category' }],
    required: true,
  })
  category_ids: Types.ObjectId[];

  @Prop({
    type: [String],
    default: [],
  })
  liked_by: string[];

  @Prop({
    type: [String],
    default: [],
  })
  saved_by: string[];

  @Prop({
    type: String,
    enum: GARMENT_TYPES,
    required: true,
  })
  garment_type: GarmentType;
}

export const PostSchema = SchemaFactory.createForClass(Post);
