import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LoggingMiddleware } from './common/middleware/logging.middleware';
import { AuthModule } from './routes/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import DatabaseLogger from './common/logger/databaseLogger';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { BatchModule } from './routes/batch/batch.module';
import { StockModule } from './routes/stock/stock.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { SuccessInterceptor } from './common/interceptor/success.interceptor';
import { UserModule } from './routes/user/user.module';
import { BoardModule } from './routes/board/board.module';
import { VirtualModule } from './routes/virtual/virtual.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    AuthModule,
    BatchModule,
    StockModule,
    UserModule,
    BoardModule,
    ChatModule,
    VirtualModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.production',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
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
        timezone: 'Z',
        bigNumberStrings: false,
        logger: new DatabaseLogger(),
      }),
    }),
    MongooseModule.forRoot(
      'mongodb+srv://swkim:iTFXEkpLHxu2sdJG@spo.lcnbgw9.mongodb.net/?retryWrites=true&w=majority&appName=spo',
    ),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: SuccessInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
