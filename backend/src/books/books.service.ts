import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
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
