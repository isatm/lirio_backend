import {
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  image?: string;

  @IsOptional()
  @IsString()
  description?: string;
}