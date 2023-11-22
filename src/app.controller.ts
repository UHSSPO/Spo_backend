import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { SuccessInterceptor } from './common/interceptor/success.interceptor';

@Controller()
@UseInterceptors(SuccessInterceptor) // Interceptor DI
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/error')
  getError(): void {
    throw new HttpException('400 error', HttpStatus.UNAUTHORIZED);
  }

  @Get('/error500')
  getError500(): void {
    throw new HttpException('500 error', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
