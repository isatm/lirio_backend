import {
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateCommentDto {
  @IsString({ message: 'El comentario debe ser un texto' })
  @IsNotEmpty({ message: 'El comentario no puede estar vacío' })
  @MaxLength(500, {
    message: 'El comentario no puede exceder 500 caracteres',
  })
  content!: string;
}