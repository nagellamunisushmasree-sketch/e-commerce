
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/,
        /^http:\/\/\d+\.\d+\.\d+\.\d+(?::\d+)?$/,
      ];
      const isAllowed = !origin || allowedOrigins.some((pattern) => pattern.test(origin));

      callback(null, isAllowed);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
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
