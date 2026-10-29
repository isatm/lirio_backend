import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

const toArray = ({ value }: { value: unknown }) =>
  value === undefined || value === null || Array.isArray(value) ? value : [value];

export class CreatePostDto {
  @IsString({ message: 'Debe ser un texto' })
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @MaxLength(100, { message: 'Máximo 100 caracteres' })
  title: string;

  @IsString({ message: 'Debe ser un texto' })
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @MaxLength(500, { message: 'Máximo 500 caracteres' })
  description: string;

  @Transform(toArray)
  @IsArray({ message: 'Las categorías deben ser una lista' })
  @ArrayNotEmpty({ message: 'Selecciona al menos un estilo' })
  @IsMongoId({ each: true, message: 'La categoría no es válida' })
  category_ids: string[];

  @IsMongoId({ message: 'Tipo de prenda no válido' })
  @IsNotEmpty({ message: 'El tipo de prenda es obligatorio' })
  garment_type_id: string;
}