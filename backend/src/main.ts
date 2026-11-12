
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/,
    credentials: true,
  });

  const uploadsDirectory = join(process.cwd(), 'uploads');
  mkdirSync(uploadsDirectory, { recursive: true });
  app.useStaticAssets(uploadsDirectory, { prefix: '/uploads' });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT || 3000);

  console.log('Server running on http://localhost:3000');
}

void bootstrap();
