import {
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  new_password: string;
}