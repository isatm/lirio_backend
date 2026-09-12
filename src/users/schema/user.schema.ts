import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
})
export class User {
  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email: string;

  @Prop({
    required: true,
    unique: true,
    trim: true,
  })
  user_name: string;

  @Prop({
    required: true,
  })
  password: string;
  
  @Prop({
  required: true,
  enum: ['USER', 'ADMIN'],
  default: 'USER',
})
role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);