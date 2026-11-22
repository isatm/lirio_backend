import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { BANNER_PALETTE } from '../banner-palette.js';

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

  @IsOptional()
  @IsString({ message: 'Debe ser un texto' })
  @IsIn(BANNER_PALETTE, { message: 'Color de portada no válido' })
  banner_color?: string;
}