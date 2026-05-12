import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv'
import cookieParser = require('cookie-parser');
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  dotenv.config()
  const app = await NestFactory.create(AppModule, {
    rawBody: true
  });

  app.use(cookieParser())

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true
  })

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true
  }))

  await app.listen(process.env.PORT ?? 3001); 
}
bootstrap();