import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  user_name?: string;

  @IsOptional()
  @IsEnum(['USER', 'ADMIN'])
  role?: 'USER' | 'ADMIN';
}