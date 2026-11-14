import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CategoriesService } from './categories.service.js';

// Dilindungi JWT (keputusan tim, GitHub issue #11): kategori hanya dibutuhkan
// di form buku setelah login, dan tidak ada kebutuhan mengambilnya sebelum login.
@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }
}
