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
import { CreateUserDto, KakaoLoginDto, LoginDto } from './dto/req.dto';
import { KakaoLoginResDto, LoginResDto } from './dto/res.dto';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SpoUser } from '../../entity/spo_user.entity';
import { LocalAuthGuard } from '../../auth/local-auth.guard';
import { SuccessInterceptor } from '../../common/interceptor/success.interceptor';
@ApiTags('Auth')
@UseInterceptors(SuccessInterceptor)
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
    type: SpoUser,
  })
  singUp(@Body() reqBody: CreateUserDto): Promise<SpoUser> {
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
  async login(@Request() req): Promise<LoginResDto> {
    return this.authService.login(req.user);
  }
}
