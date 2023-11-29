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
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // validation을 위한 decorator가 없는 속성 제거
      forbidNonWhitelisted: true, // whitelist 설정에서 걸리는 request 있다면 request 요청을 막음 (400 error)
      transform: true, // 요청에서 넘어온 자료를 자동 형변환 ex) /board/12 url id 값을 '12' => 12 number로 바꿔줌
    }),
  );

  app.enableCors({
    origin: true, // 모든 origin을 허용하려면 true로 설정
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  // 'http://3.34.126.21',
  //   'http://localhost:3000',
  //   'https://kauth.kakao.com',
  await app.listen(3001);
}
bootstrap();
