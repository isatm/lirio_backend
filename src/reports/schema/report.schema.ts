import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ReportDocument = HydratedDocument<Report>;

@Schema({
  timestamps: true,
})
export class Report {
  @Prop({
    required: true,
  })
  reporter_id: string;

  @Prop({
    required: true,
    enum: ['POST', 'USER'],
  })
  target_type: string;

  @Prop({
    required: true,
  })
  target_id: string;

  @Prop({
    required: true,
    enum: [
      'SPAM',
      'INAPPROPRIATE',
      'HARASSMENT',
      'FAKE_ACCOUNT',
      'COPYRIGHT',
      'OTHER',
    ],
  })
  reason: string;

  @Prop({
    default: '',
    trim: true,
  })
  description?: string;

  @Prop({
    required: true,
    enum: ['PENDING', 'RESOLVED', 'DISMISSED'],
    default: 'PENDING',
  })
  status: string;
}

export const ReportSchema = SchemaFactory.createForClass(Report);