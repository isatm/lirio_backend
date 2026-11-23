import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

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
export type CommentWithId = Comment & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

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
    type: Types.ObjectId,
    ref: 'GarmentType',
    required: true,
  })
  garment_type_id: Types.ObjectId;

  @Prop({
    type: [CommentSchema],
    default: [],
  })
  comments: CommentWithId[];
}

export const PostSchema = SchemaFactory.createForClass(Post);