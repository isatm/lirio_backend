import {
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsMongoId,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

import { GARMENT_TYPES, type GarmentType } from '../schema/post.schema.js';

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

  @IsOptional()
  @IsArray({ message: 'Las categorías deben ser una lista' })
  @ArrayNotEmpty({ message: 'Selecciona al menos un estilo' })
  @IsMongoId({ each: true, message: 'La categoría no es válida' })
  category_ids?: string[];

  @IsOptional()
  @IsIn(GARMENT_TYPES, { message: 'Tipo de prenda no válido' })
  garment_type?: GarmentType;
}