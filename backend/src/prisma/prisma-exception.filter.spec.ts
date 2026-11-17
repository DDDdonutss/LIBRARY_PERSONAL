import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { toHttpException } from './prisma-exception.filter.js';

/**
 * Filter global hanya jaring pengaman: error Prisma yang dikenali tetapi tidak
 * ditangani service tidak boleh menjadi 500. Kode lain dibiarkan (tetap 500).
 */

const prismaError = (code: string) =>
  new Prisma.PrismaClientKnownRequestError(`Prisma error ${code}`, {
    code,
    clientVersion: 'test',
  });

describe('toHttpException', () => {
  it('P2002 (unique constraint) → 409', () => {
    const exception = toHttpException(prismaError('P2002'));

    expect(exception).toBeInstanceOf(ConflictException);
    expect(exception?.message).toBe('Data sudah ada');
  });

  it('P2003 (foreign key) → 400', () => {
    const exception = toHttpException(prismaError('P2003'));

    expect(exception).toBeInstanceOf(BadRequestException);
    expect(exception?.message).toBe('Data terkait tidak ditemukan');
  });

  it('P2025 (record tidak ditemukan) → 404', () => {
    const exception = toHttpException(prismaError('P2025'));

    expect(exception).toBeInstanceOf(NotFoundException);
    expect(exception?.message).toBe('Data tidak ditemukan');
  });

  it('kode lain tidak dipetakan (tetap 500 lewat filter bawaan)', () => {
    expect(toHttpException(prismaError('P1001'))).toBeUndefined();
  });
});
