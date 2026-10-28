import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class OutfitItemDto {
  @IsMongoId({ message: 'La prenda no es válida' })
  post_id: string;
}

export class CreateOutfitDto {
  @IsString({ message: 'Debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(80, { message: 'Máximo 80 caracteres' })
  name: string;

  @IsOptional()
  @IsBoolean({ message: 'La visibilidad debe ser verdadera o falsa' })
  is_public?: boolean;

  @IsArray({ message: 'Las prendas deben ser una lista' })
  @ArrayMinSize(2, { message: 'Un outfit necesita al menos 2 prendas' })
  @ArrayMaxSize(3, { message: 'Un outfit admite como máximo 3 prendas' })
  @ValidateNested({ each: true })
  @Type(() => OutfitItemDto)
  items: OutfitItemDto[];
}
