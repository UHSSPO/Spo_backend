import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, KakaoLoginDto } from './dto/create-user.dto';
import { KakaoLoginResDto, LoginResDto } from './dto/res.dto';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { Spo_User } from '../../entity/spo_user.entity';
import LoginDto from './dto/login.dto';
import { LocalAuthGuard } from '../../auth/local-auth.guard';

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

  @Post('/login')
  @UseGuards(LocalAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: LoginResDto,
  })
  @ApiBody({ type: LoginDto })
  async login(@Request() req): Promise<any> {
    return this.authService.login(req.user);
  }
}
