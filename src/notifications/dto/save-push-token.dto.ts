import { IsOptional, IsString, Matches } from 'class-validator';

export class SavePushTokenDto {
  @IsOptional()
  @IsString()
  @Matches(/^(Expo(nent)?PushToken)\[[^\]]+\]$/, {
    message: 'El token de Expo no tiene un formato válido',
  })
  token: string | null;
}