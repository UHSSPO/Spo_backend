// import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Controller } from '@nestjs/common';
// import { KakaoLoginDto } from './dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // @Post('/kakao-login')
  // async getKakaoInfo(@Body() reqBody: KakaoLoginDto) {
  //   return await this.authService.kakaoLogin(
  //     reqBody.apikey,
  //     reqBody.redirectUri,
  //     reqBody.code,
  //   );
  // }
}
