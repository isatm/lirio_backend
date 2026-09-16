import {
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class UpdatePostDto {
  @IsOptional()
  @IsString({ message: 'Debe ser un texto' })
  @MaxLength(100, { message: 'Máximo 100 caracteres' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Debe ser un texto' })
  @IsUrl({}, { message: 'URL inválida' })
  image?: string;

  @IsOptional()
  @IsString({ message: 'Debe ser un texto' })
  @MaxLength(500, { message: 'Máximo 500 caracteres' })
  description?: string;
}