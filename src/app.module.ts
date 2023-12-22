import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggingMiddleware } from './common/middleware/logging.middleware';
import { AuthModule } from './routes/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import DatabaseLogger from './common/logger/databaseLogger';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { BatchService } from './routes/batch/batch.service';
import { BatchModule } from './routes/batch/batch.module';

@Module({
  imports: [
    AuthModule,
    BatchModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.production',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'mariadb',
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          port: configService.get<number>('DB_PORT'),
          host: configService.get<string>('DB_HOST'),
          database: configService.get<string>('DB_NAME'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          charset: 'utf8mb4',
          collation: 'utf8mb4_unicode_ci',
          synchronize: false,
          logger: new DatabaseLogger(),
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService, BatchService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
