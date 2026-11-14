import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { BookStatus } from '../generated/prisma/enums.js';
import { CategoriesService } from '../categories/categories.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateBookDto } from './dto/create-book.dto.js';
import { QueryBooksDto } from './dto/query-books.dto.js';
import { UpdateBookDto } from './dto/update-book.dto.js';

// Bentuk buku yang dikirim ke frontend. userId sengaja tidak disertakan:
// pemilik selalu user yang sedang login.
const bookSelect = {
  id: true,
  title: true,
  author: true,
  status: true,
  categoryId: true,
  category: { select: { id: true, name: true } },
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.BookSelect;

const BOOK_NOT_FOUND_MESSAGE = 'Buku tidak ditemukan';

// Semua status selalu ada di ringkasan (0 bila tidak ada buku),
// agar frontend tidak perlu menangani key yang hilang.
const BOOK_STATUSES = Object.values(BookStatus);

export interface CategoryStat {
  /** `null` = buku tanpa kategori. */
  categoryId: string | null;
  name: string | null;
  count: number;
}

export interface BookStats {
  total: number;
  byStatus: Record<BookStatus, number>;
  byCategory: CategoryStat[];
}

/**
 * ATURAN KEPEMILIKAN: setiap query buku menyertakan `userId` dari JWT di
 * klausa `where`. Buku milik user lain diperlakukan sama dengan buku yang
 * tidak ada (404), sehingga keberadaannya tidak bocor.
 */
@Injectable()
export class BooksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(userId: string, dto: CreateBookDto) {
    if (dto.categoryId) {
      await this.categoriesService.ensureExists(dto.categoryId);
    }

    return this.prisma.book.create({
      data: {
        title: dto.title,
        author: dto.author,
        status: dto.status,
        categoryId: dto.categoryId ?? null,
        userId, // dari JWT, bukan dari body request
      },
      select: bookSelect,
    });
  }

  async findAll(userId: string, query: QueryBooksDto) {
    const { page, limit, search, status, categoryId } = query;

    const where: Prisma.BookWhereInput = {
      userId,
      ...(search && { title: { contains: search, mode: 'insensitive' } }),
      ...(status && { status }),
      ...(categoryId && { categoryId }),
    };

    // Data halaman ini dan total keseluruhan diambil dalam satu transaksi
    // agar konsisten satu sama lain.
    const [data, total] = await this.prisma.$transaction([
      this.prisma.book.findMany({
        where,
        select: bookSelect,
        // id sebagai pengurut kedua agar urutan stabil antarhalaman.
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.book.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Ringkasan koleksi untuk dashboard: total buku, jumlah per status, dan
   * jumlah per kategori. Dihitung di database (GROUP BY), bukan dengan
   * mengambil semua buku, dan selalu dibatasi `userId` dari JWT.
   */
  async getStats(userId: string): Promise<BookStats> {
    const [statusRows, categoryRows] = await this.prisma.$transaction([
      this.prisma.book.groupBy({
        by: ['status'],
        where: { userId },
        _count: { _all: true },
      }),
      this.prisma.book.groupBy({
        by: ['categoryId'],
        where: { userId },
        _count: { _all: true },
      }),
    ]);

    const byStatus = Object.fromEntries(
      BOOK_STATUSES.map((status) => [status, 0]),
    ) as Record<BookStatus, number>;
    for (const row of statusRows) {
      byStatus[row.status] = row._count._all;
    }

    // Nama kategori diambil sekali untuk semua id yang muncul.
    const categoryIds = categoryRows
      .map((row) => row.categoryId)
      .filter((id): id is string => id !== null);
    const categories =
      categoryIds.length === 0
        ? []
        : await this.prisma.category.findMany({
            where: { id: { in: categoryIds } },
            select: { id: true, name: true },
          });
    const nameById = new Map(categories.map((c) => [c.id, c.name]));

    const byCategory = categoryRows
      .map<CategoryStat>((row) => ({
        categoryId: row.categoryId,
        name: row.categoryId ? (nameById.get(row.categoryId) ?? null) : null,
        count: row._count._all,
      }))
      .sort(compareCategoryStats);

    const total = statusRows.reduce((sum, row) => sum + row._count._all, 0);

    return { total, byStatus, byCategory };
  }

  async findOne(userId: string, id: string) {
    const book = await this.prisma.book.findFirst({
      where: { id, userId },
      select: bookSelect,
    });

    if (!book) {
      throw new NotFoundException(BOOK_NOT_FOUND_MESSAGE);
    }

    return book;
  }

  async update(userId: string, id: string, dto: UpdateBookDto) {
    const data: Prisma.BookUncheckedUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.author !== undefined) data.author = dto.author;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.categoryId !== undefined) data.categoryId = dto.categoryId;

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('Tidak ada data yang diubah');
    }

    if (dto.categoryId) {
      await this.categoriesService.ensureExists(dto.categoryId);
    }

    try {
      return await this.prisma.book.update({
        where: { id, userId },
        data,
        select: bookSelect,
      });
    } catch (error) {
      throw toNotFoundIfMissing(error);
    }
  }

  async remove(userId: string, id: string) {
    try {
      await this.prisma.book.delete({
        where: { id, userId },
        select: { id: true },
      });
    } catch (error) {
      throw toNotFoundIfMissing(error);
    }

    return { message: 'Buku berhasil dihapus', id };
  }
}

/** Terbanyak lebih dulu; bila sama, nama A–Z; buku tanpa kategori paling akhir. */
function compareCategoryStats(a: CategoryStat, b: CategoryStat): number {
  if (a.count !== b.count) return b.count - a.count;
  if (a.name === null) return 1;
  if (b.name === null) return -1;
  return a.name.localeCompare(b.name);
}

/** P2025 = record yang di-update/delete tidak ditemukan (atau bukan milik user). */
function toNotFoundIfMissing(error: unknown): unknown {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2025'
  ) {
    return new NotFoundException(BOOK_NOT_FOUND_MESSAGE);
  }
  return error;
}
