import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type GarmentTypeDocument = HydratedDocument<GarmentType>;

@Schema({
  timestamps: true,
})
export class GarmentType {
  @Prop({
    required: true,
    trim: true,
  })
  name: string;
}

export const GarmentTypeSchema = SchemaFactory.createForClass(GarmentType);
