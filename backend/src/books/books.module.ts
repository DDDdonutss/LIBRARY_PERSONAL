import { Module } from '@nestjs/common';
import { CategoriesModule } from '../categories/categories.module.js';
import { BooksController } from './books.controller.js';
import { BooksService } from './books.service.js';

@Module({
  imports: [CategoriesModule],
  controllers: [BooksController],
  providers: [BooksService],
})
export class BooksModule {}
