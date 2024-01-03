import { Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

export class LoggingMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService) {}
  private readonly logger = new Logger();
  use(req: Request, res: Response, next: NextFunction): any {
    const { method, originalUrl } = req;
    const startTime = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const responseTime = Date.now() - startTime;

      const token = req.headers.authorization?.split(' ')[1];
      if (token) {
        try {
          // JWT 디코딩
          const decodedToken = jwt.verify(
            token,
            process.env.JWT_SECRET,
          ) as jwt.JwtPayload;

          // 사용자 정보 추출
          const userEmail = decodedToken.email;

          this.logger.log(
            `[${method}] ${originalUrl}: ${statusCode} - ${responseTime}ms - User: ${userEmail}`,
          );
        } catch (error) {
          this.logger.error('Error decoding JWT:', error);
        }
      } else {
        this.logger.log(
          `[${method}] ${originalUrl}: ${statusCode} - ${responseTime}ms - No JWT found`,
        );
      }
    });
    next();
  }
}
