import {
  IsMongoId,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreatePostDto {
  @IsString({ message: 'Debe ser un texto' })
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @MaxLength(100, { message: 'Máximo 100 caracteres' })
  title: string;

  @IsString({ message: 'Debe ser un texto' })
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @MaxLength(500, { message: 'Máximo 500 caracteres' })
  description: string;

  @IsMongoId({ message: 'La categoría no es válida' })
  @IsNotEmpty({ message: 'La categoría es obligatoria' })
  category_id: string;
}