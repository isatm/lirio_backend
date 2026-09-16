import {
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdatePasswordDto {
  @IsString({ message: 'Debe ser un texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(6, { message: 'Mínimo 6 caracteres' })
  @MaxLength(128, { message: 'Máximo 128 caracteres' })
  new_password: string;
}