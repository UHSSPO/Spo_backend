import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, KakaoLoginDto } from './dto/create-user.dto';
import { KakaoLoginResDto } from './dto/res.dto';
import { ApiResponse } from '@nestjs/swagger';
import { Spo_User } from '../../entity/spo_user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/kakao-login')
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: KakaoLoginResDto,
  })
  async getKakaoInfo(
    @Body() reqBody: KakaoLoginDto,
  ): Promise<KakaoLoginResDto> {
    return await this.authService.kakaoLogin(
      reqBody.apikey,
      reqBody.redirectUri,
      reqBody.code,
    );
  }

  @Post('/sign-up')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: Spo_User,
  })
  singUp(@Body() reqBody: CreateUserDto): Promise<Spo_User> {
    return this.authService.signUp(reqBody);
  }
}
