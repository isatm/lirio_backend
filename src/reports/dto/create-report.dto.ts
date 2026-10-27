import {
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export const REPORT_TARGET_TYPES = ['POST', 'USER'] as const;
export const REPORT_REASONS = [
  'SPAM',
  'INAPPROPRIATE',
  'HARASSMENT',
  'FAKE_ACCOUNT',
  'COPYRIGHT',
  'OTHER',
] as const;

export class CreateReportDto {
  @IsIn(REPORT_TARGET_TYPES, { message: 'El tipo de objetivo no es válido' })
  @IsNotEmpty({ message: 'El tipo de objetivo es obligatorio' })
  target_type: (typeof REPORT_TARGET_TYPES)[number];

  @IsMongoId({ message: 'El objetivo del reporte no es válido' })
  @IsNotEmpty({ message: 'El objetivo del reporte es obligatorio' })
  target_id: string;

  @IsIn(REPORT_REASONS, { message: 'El motivo del reporte no es válido' })
  @IsNotEmpty({ message: 'El motivo del reporte es obligatorio' })
  reason: (typeof REPORT_REASONS)[number];

  @IsOptional()
  @IsString({ message: 'Debe ser un texto' })
  @MaxLength(500, { message: 'Máximo 500 caracteres' })
  description?: string;
}