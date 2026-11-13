import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  // Semua endpoint berada di bawah /api/v1 (PRD §9), mis. /api/v1/auth/register
  app.setGlobalPrefix('api/v1');

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
