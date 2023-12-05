import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthService } from '../routes/auth/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'pwd',
    });
  }

  async validate(username: string, password: string) {
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new HttpException(
        '아이디나 비밀번호가 잘못됐습니다.',
        HttpStatus.UNAUTHORIZED,
      );
    } else {
      return user;
    }
  }
}
