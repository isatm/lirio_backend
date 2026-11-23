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
    default: '',
    trim: true,
  })
  bio?: string;

  @Prop({
    default: '',
  })
  avatar_url?: string;

  @Prop({
    default: '',
  })
  avatar_public_id?: string;

  @Prop({
    default: '',
  })
  banner_url?: string;

  @Prop({
    default: '',
  })
  banner_public_id?: string;

  /**
   * Color sólido de portada. Cuando tiene valor, el usuario no tiene foto
   * de portada: elegirlo la borró (ver updateProfile).
   */
  @Prop({
    default: '',
  })
  banner_color?: string;

  @Prop({
    type: [String],
    default: [],
  })
  preferred_categories?: string[];
  
  @Prop({
  required: true,
  enum: ['USER', 'ADMIN'],
  default: 'USER',
})
role: string;

  @Prop({
    type: Date,
  })
  last_login?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);