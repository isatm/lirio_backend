
import {
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateGarmentDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  color?: string;
}
