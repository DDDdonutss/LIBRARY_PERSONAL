import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Kategori bersifat global: sama untuk semua user (PRD §4.3). */
  findAll() {
    return this.prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Dipakai Book Management untuk memvalidasi categoryId dari request.
   * Kategori yang tidak ada adalah kesalahan input (400), bukan 404,
   * karena resource yang diminta adalah buku, bukan kategori.
   */
  async ensureExists(categoryId: string): Promise<void> {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true },
    });

    if (!category) {
      throw new BadRequestException('Kategori tidak ditemukan');
    }
  }
}
