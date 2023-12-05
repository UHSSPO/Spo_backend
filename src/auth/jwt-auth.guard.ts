import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JsonWebTokenError } from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: any, status: any) {
    if (info instanceof JsonWebTokenError) {
      throw new HttpException(
        '유효하지 않은 토큰입니다.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return super.handleRequest(err, user, info, context, status);
  }
}
