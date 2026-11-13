import { type INestApplication, ValidationPipe } from '@nestjs/common';

/**
 * Konfigurasi global aplikasi. Dipakai oleh main.ts dan e2e test,
 * sehingga test menguji aplikasi dengan konfigurasi yang sama persis.
 */
export function configureApp(app: INestApplication): void {
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
}
