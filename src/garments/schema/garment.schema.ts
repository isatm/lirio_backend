
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type GarmentDocument = HydratedDocument<Garment>;

@Schema({
  timestamps: true,
})
export class Garment {
  @Prop({
    required: true,
    trim: true,
  })
  name: string;

  @Prop({
    required: true,
  })
  image: string;

  @Prop({
    required: true,
    trim: true,
  })
  category: string;

  @Prop({
    trim: true,
  })
  color?: string;

  @Prop({
    required: true,
  })
  user_id: string;
}

export const GarmentSchema = SchemaFactory.createForClass(Garment);
