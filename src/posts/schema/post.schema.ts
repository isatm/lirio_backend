import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

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
}

export const PostSchema = SchemaFactory.createForClass(Post);