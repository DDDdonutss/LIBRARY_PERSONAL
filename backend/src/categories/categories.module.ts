import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller.js';
import { CategoriesService } from './categories.service.js';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService],
  // Diekspor agar BooksModule bisa memvalidasi categoryId.
  exports: [CategoriesService],
})
export class CategoriesModule {}
