import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Correo inválido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  @MaxLength(100, { message: 'Máximo 100 caracteres' })
  email: string;

  @IsString({ message: 'Debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MinLength(3, { message: 'Mínimo 3 caracteres' })
  @MaxLength(50, { message: 'Máximo 50 caracteres' })
  user_name: string;

  @IsString({ message: 'Debe ser un texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(6, { message: 'Mínimo 6 caracteres' })
  @MaxLength(128, { message: 'Máximo 128 caracteres' })
  password: string;

  @IsEnum(['USER', 'ADMIN'], { message: 'Rol inválido' })
  role: 'USER' | 'ADMIN';
}