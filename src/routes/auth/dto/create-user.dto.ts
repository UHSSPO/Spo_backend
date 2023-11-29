import { IsNotEmpty } from 'class-validator';

export class KakaoLoginDto {
  @IsNotEmpty()
  apikey: string;

  @IsNotEmpty()
  redirectUri: string;

  @IsNotEmpty()
  code: string;
}
