import {
  type ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  type HttpException,
  NotFoundException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '../generated/prisma/client.js';

/**
 * Jaring pengaman untuk error Prisma yang tidak ditangani service.
 *
 * Service tetap menerjemahkan kasus yang ia pahami dengan pesan domain
 * (mis. "Email sudah terdaftar", "Buku tidak ditemukan"). Filter ini hanya
 * mencegah sisa error yang dikenali — mis. foreign key gagal karena kategori
 * atau user terhapus di tengah request — berakhir sebagai 500. Kode lain
 * diteruskan ke filter bawaan NestJS (500, dicatat di log).
 */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter extends BaseExceptionFilter {
  override catch(
    exception: Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost,
  ): void {
    super.catch(toHttpException(exception) ?? exception, host);
  }
}

export function toHttpException(
  error: Prisma.PrismaClientKnownRequestError,
): HttpException | undefined {
  switch (error.code) {
    case 'P2002': // unique constraint
      return new ConflictException('Data sudah ada');
    case 'P2003': // foreign key
      return new BadRequestException('Data terkait tidak ditemukan');
    case 'P2025': // record yang dibutuhkan tidak ditemukan
      return new NotFoundException('Data tidak ditemukan');
    default:
      return undefined;
  }
}
