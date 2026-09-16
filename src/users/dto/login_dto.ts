import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class LoginUserDto {
  @IsEmail({}, { message: 'Correo inválido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  @MaxLength(100, { message: 'Máximo 100 caracteres' })
  email: string;

  @IsString({ message: 'Debe ser un texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MaxLength(128, { message: 'Máximo 128 caracteres' })
  password: string;
}