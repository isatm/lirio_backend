import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsOptional()
  @IsString({ message: 'El comentario debe ser un texto' })
  @MaxLength(500, { message: 'El comentario no puede exceder 500 caracteres' })
  content?: string;

  @IsOptional()
  @IsString({ message: 'El comentario debe ser un texto' })
  @MaxLength(500, { message: 'El comentario no puede exceder 500 caracteres' })
  text?: string;

  @IsOptional()
  @IsString({ message: 'El comentario debe ser un texto' })
  @MaxLength(500, { message: 'El comentario no puede exceder 500 caracteres' })
  comment?: string;
}
