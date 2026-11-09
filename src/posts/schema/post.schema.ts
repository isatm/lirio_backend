import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export const GARMENT_TYPES = ['SHIRT', 'PANTS', 'SHOES'] as const;
export type GarmentType = (typeof GARMENT_TYPES)[number];

@Schema({
  timestamps: true,
})
export class Comment {
  @Prop({
    required: true,
  })
  user_id: string;

  @Prop({
    required: true,
    trim: true,
  })
  content: string;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

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
    type: [CommentSchema],
    default: [],
  })
  comments: Comment[];

  @Prop({
    type: String,
    enum: GARMENT_TYPES,
    required: true,
  })
  garment_type_id: Types.ObjectId;
}

export const PostSchema = SchemaFactory.createForClass(Post);
