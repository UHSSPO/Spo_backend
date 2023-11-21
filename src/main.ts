import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3001);
  app.enableCors({
    origin: ['http://3.34.126.21', 'http://localhost:3000'],
    credentials: true,
  });

}
bootstrap();
