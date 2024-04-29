import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/exceptions/http.exceptions';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // exception
  app.useGlobalFilters(new HttpExceptionFilter());
  // swager
  const config = new DocumentBuilder()
    .setTitle('Spo Api')
    .setDescription('The Spo API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // validation을 위한 decorator가 없는 속성 제거
      transform: true, // 요청에서 넘어온 자료를 자동 형변환 ex) /board/12 url id 값을 '12' => 12 number로 바꿔줌
    }),
  );

  app.enableCors({
    origin: [
      'http://43.201.117.252',
      'http://localhost:3000',
      'https://kauth.kakao.com',
      'http://uhs-spo.kro.kr',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  await app.listen(3001);
}
bootstrap();
