import {
  BadRequestException,
  ConflictException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import {
  PrismaExceptionFilter,
  toHttpException,
} from './prisma-exception.filter.js';

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

describe('PrismaExceptionFilter', () => {
  function setup() {
    const reply = vi.fn();
    const httpAdapter = {
      isHeadersSent: vi.fn().mockReturnValue(false),
      reply,
      end: vi.fn(),
    };
    const response = {};
    const host = { getArgByIndex: vi.fn().mockReturnValue(response) };
    const filter = new PrismaExceptionFilter(httpAdapter as never);
    return { filter, host: host as never, reply, response };
  }

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('error yang dipetakan tetap dicatat di log server (warning berisi kode Prisma)', () => {
    // Error ini berarti ada kasus yang tidak ditangani service; tanpa log,
    // penyebabnya tidak bisa dilacak karena client hanya menerima pesan umum.
    const warn = vi
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => undefined);
    const { filter, host, reply, response } = setup();

    filter.catch(prismaError('P2003'), host);

    expect(reply).toHaveBeenCalledWith(
      response,
      expect.objectContaining({
        statusCode: 400,
        message: 'Data terkait tidak ditemukan',
      }),
      400,
    );
    expect(warn).toHaveBeenCalledOnce();
    expect(String(warn.mock.calls[0][0])).toContain('P2003');
  });

  it('kode lain diteruskan ke filter bawaan: 500 dan dicatat sebagai error', () => {
    const error = vi
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    const { filter, host, reply, response } = setup();

    filter.catch(prismaError('P1001'), host);

    expect(reply).toHaveBeenCalledWith(
      response,
      { statusCode: 500, message: 'Internal server error' },
      500,
    );
    expect(error).toHaveBeenCalled();
  });
});
