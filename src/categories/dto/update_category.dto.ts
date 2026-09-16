import {
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString({ message: 'Debe ser un texto' })
  @MinLength(2, { message: 'Mínimo 2 caracteres' })
  @MaxLength(50, { message: 'Máximo 50 caracteres' })
  name?: string;
}