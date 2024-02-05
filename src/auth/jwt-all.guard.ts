import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAllGuard extends AuthGuard('all') {
  handleRequest(err: any, user: any) {
    return user;
  }
}
