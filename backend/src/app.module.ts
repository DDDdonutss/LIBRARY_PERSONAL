import { Module } from '@nestjs/common';

import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { BooksModule } from './books/books.module.js';

@Module({
  imports: [PrismaModule, AuthModule, CategoriesModule, BooksModule],
})
export class AppModule {}
