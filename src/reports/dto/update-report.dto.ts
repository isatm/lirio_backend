import { IsIn, IsOptional } from 'class-validator';

export const REPORT_STATUSES = ['PENDING', 'RESOLVED', 'DISMISSED'] as const;
export const REPORT_ACTIONS = ['DELETE_POST', 'DELETE_USER'] as const;

export class UpdateReportDto {
  @IsIn(REPORT_STATUSES, { message: 'El estado del reporte no es válido' })
  status: (typeof REPORT_STATUSES)[number];

  @IsOptional()
  @IsIn(REPORT_ACTIONS, { message: 'La acción no es válida' })
  action?: (typeof REPORT_ACTIONS)[number];
}