import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './module/app.module';
import { ValidationPipe } from '@nestjs/common';
import { AuthGuard } from './guard/auth.guard';

async function start() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('/beta');
  app.useGlobalPipes( new ValidationPipe({ transform: true }) );
  app.useGlobalGuards(new AuthGuard(app.get(Reflector)));
  app.enableCors({
    origin: process.env.CORS_URL,
    methods: ['OPTIONS', 'GET', 'PUT', 'POST', 'DELETE', 'PATCH'],
    preflightContinue: false
  });

  await app.listen(process.env.PORT, '0.0.0.0');
}

start();
