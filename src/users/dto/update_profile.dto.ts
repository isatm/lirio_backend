import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString({ message: 'Debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MinLength(3, { message: 'Mínimo 3 caracteres' })
  @MaxLength(50, { message: 'Máximo 50 caracteres' })
  user_name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Correo inválido' })
  @MaxLength(100, { message: 'Máximo 100 caracteres' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Debe ser un texto' })
  @MaxLength(200, { message: 'Máximo 200 caracteres' })
  bio?: string;
}