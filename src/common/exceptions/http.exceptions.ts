import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();
    const stack = exception.stack;

    if (!(exception instanceof HttpException)) {
      exception = new InternalServerErrorException();
    }

    const status = exception.getStatus();
    const response: any = (exception as HttpException).getResponse();

    const log = {
      timeStamp: new Date(),
      url: req.url,
      response,
      stack,
    };
    this.logger.error(log);

    res.status((exception as HttpException).getStatus()).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: req.url,
      message: response.message ? response.message : response,
    });
  }
}
