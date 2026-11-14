import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  // Semua endpoint berada di bawah /api/v1 (PRD §9), mis. /api/v1/auth/register
  app.setGlobalPrefix('api/v1');

  // Izinkan frontend (origin lain) memanggil API dari browser.
  // CORS_ORIGIN bisa berisi beberapa origin dipisah koma.
  app.enableCors({
    origin: (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
      .split(',')
      .map((origin) => origin.trim()),
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 3001 agar tidak bentrok dengan Next.js (frontend) yang default di 3000
  await app.listen(process.env.PORT ?? 3001);
}

await bootstrap();
