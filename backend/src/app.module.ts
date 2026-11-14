import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';

import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { BooksModule } from './books/books.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ObserveModule.forRoot({
      // Jangan kirim telemetri dari test (Vitest mengeset NODE_ENV=test).
      enabled: process.env.NODE_ENV !== 'test',
      appKey: process.env.OBSERVE_APP_KEY ?? 'YOUR_APP_KEY',
      appSecret: process.env.OBSERVE_APP_SECRET ?? 'YOUR_APP_SECRET',
      serviceId: 'backend',
    }),
    PrismaModule,
    AuthModule,
    CategoriesModule,
    BooksModule,
  ],
})
export class AppModule {}
