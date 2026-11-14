import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { configureApp } from './app.setup.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  configureApp(app);

  // 3001 agar tidak bentrok dengan Next.js (frontend) yang default di 3000
  await app.listen(process.env.PORT ?? 3001);
}

await bootstrap();
