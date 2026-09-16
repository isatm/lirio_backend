import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'Correo inválido' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Debe ser un texto' })
  @MinLength(3, { message: 'Mínimo 3 caracteres' })
  user_name?: string;

  @IsOptional()
  @IsEnum(['USER', 'ADMIN'], { message: 'Rol inválido' })
  role?: 'USER' | 'ADMIN';
}