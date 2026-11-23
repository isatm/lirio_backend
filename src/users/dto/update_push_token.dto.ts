import { IsString, Matches, ValidateIf } from 'class-validator';

export class UpdatePushTokenDto {
  /** null = este teléfono deja de recibir avisos push. */
  @ValidateIf((dto: UpdatePushTokenDto) => dto.token !== null)
  @IsString({ message: 'El token debe ser un texto' })
  @Matches(/^Expo(nent)?PushToken\[\S+\]$/, {
    message: 'Token push no válido',
  })
  token: string | null;
}
