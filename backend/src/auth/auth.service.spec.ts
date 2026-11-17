import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { Prisma } from '../generated/prisma/client.js';
import { AuthService } from './auth.service.js';

/**
 * Normalisasi email (trim + huruf kecil) adalah invariant AuthService, bukan
 * hanya tugas DTO: pemanggil yang tidak melewati ValidationPipe tetap tidak
 * boleh menyimpan atau mencari email berspasi.
 */

function setup() {
  const findUnique = vi.fn().mockResolvedValue(null);
  const create = vi
    .fn()
    .mockImplementation(({ data }: { data: { name: string; email: string } }) =>
      Promise.resolve({
        id: 'user-1',
        name: data.name,
        email: data.email,
        createdAt: new Date(),
      }),
    );
  const prisma = { user: { findUnique, create } };
  const jwtService = { signAsync: vi.fn().mockResolvedValue('token') };

  const service = new AuthService(prisma as never, jwtService as never);
  return { service, findUnique, create };
}

describe('AuthService: normalisasi email', () => {
  it('register menyimpan email yang di-trim dan berhuruf kecil', async () => {
    const { service, findUnique, create } = setup();

    await service.register({
      name: 'User',
      email: '  User@Example.COM ',
      password: 'password123',
    });

    expect(findUnique).toHaveBeenCalledWith({
      where: { email: 'user@example.com' },
    });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ email: 'user@example.com' }),
      }),
    );
  });

  it('login mencari email yang di-trim dan berhuruf kecil', async () => {
    const { service, findUnique } = setup();

    await expect(
      service.login({ email: ' User@Example.COM ', password: 'password123' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { email: 'user@example.com' } }),
    );
  });
});

/**
 * Perilaku AuthService di luar normalisasi email (issue #23): validasi batas
 * bcrypt, duplikat (termasuk race P2002), pesan login yang seragam, dan
 * passwordHash yang tidak pernah dikembalikan.
 */
describe('AuthService', () => {
  const PASSWORD = 'password123';
  const USER = {
    id: 'user-1',
    name: 'User',
    email: 'user@example.com',
    createdAt: new Date('2026-11-17T00:00:00.000Z'),
  };
  // Lebih dari 72 byte UTF-8 walau hanya 37 karakter ("é" = 2 byte).
  const TOO_LONG_PASSWORD = 'é'.repeat(37);
  let passwordHash: string;

  beforeAll(async () => {
    // Cost rendah agar test cepat; compare() membaca cost dari hash.
    passwordHash = await hash(PASSWORD, 4);
  });

  function setup() {
    const prisma = {
      user: { findUnique: vi.fn(), create: vi.fn() },
    };
    const jwtService = { signAsync: vi.fn().mockResolvedValue('token') };
    const service = new AuthService(prisma as never, jwtService as never);
    return { service, prisma, jwtService };
  }

  const prismaError = (code: string) =>
    new Prisma.PrismaClientKnownRequestError(`Prisma error ${code}`, {
      code,
      clientVersion: 'test',
    });

  describe('register', () => {
    const dto = { name: 'User', email: USER.email, password: PASSWORD };

    it('berhasil: menyimpan hash bcrypt (bukan password asli) dan mengembalikan token', async () => {
      const { service, prisma, jwtService } = setup();
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(USER);

      const result = await service.register(dto);

      expect(result).toEqual({
        message: 'Registrasi berhasil',
        user: USER,
        accessToken: 'token',
      });
      const { data, select } = prisma.user.create.mock.calls[0][0];
      expect(data.passwordHash).not.toBe(PASSWORD);
      await expect(compare(PASSWORD, data.passwordHash)).resolves.toBe(true);
      expect(select).not.toHaveProperty('passwordHash');
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: USER.id,
        email: USER.email,
      });
    });

    it('password > 72 byte → 400 sebelum menyentuh database', async () => {
      const { service, prisma } = setup();

      await expect(
        service.register({ ...dto, password: TOO_LONG_PASSWORD }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('email sudah terdaftar → 409 tanpa membuat user', async () => {
      const { service, prisma } = setup();
      prisma.user.findUnique.mockResolvedValue({ ...USER, passwordHash });

      await expect(service.register(dto)).rejects.toThrow(
        new ConflictException('Email sudah terdaftar'),
      );
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('race: P2002 saat create (lolos pengecekan bersamaan) → 409', async () => {
      const { service, prisma } = setup();
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockRejectedValue(prismaError('P2002'));

      await expect(service.register(dto)).rejects.toThrow(
        new ConflictException('Email sudah terdaftar'),
      );
    });

    it('error database lain diteruskan apa adanya', async () => {
      const { service, prisma } = setup();
      const error = prismaError('P1001');
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockRejectedValue(error);

      await expect(service.register(dto)).rejects.toBe(error);
    });
  });

  describe('login', () => {
    const INVALID = new UnauthorizedException('Email atau password salah');

    it('berhasil: mengembalikan user tanpa passwordHash dan token', async () => {
      const { service, prisma } = setup();
      prisma.user.findUnique.mockResolvedValue({ ...USER, passwordHash });

      const result = await service.login({
        email: USER.email,
        password: PASSWORD,
      });

      expect(result).toEqual({
        message: 'Login berhasil',
        user: USER,
        accessToken: 'token',
      });
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('password salah → 401 dengan pesan generik', async () => {
      const { service, prisma } = setup();
      prisma.user.findUnique.mockResolvedValue({ ...USER, passwordHash });

      await expect(
        service.login({ email: USER.email, password: 'password-salah' }),
      ).rejects.toThrow(INVALID);
    });

    it('email tidak terdaftar → 401 dengan pesan yang sama', async () => {
      const { service, prisma } = setup();
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'tidak.ada@example.com', password: PASSWORD }),
      ).rejects.toThrow(INVALID);
    });

    it('password > 72 byte → 401 tanpa menyentuh database', async () => {
      const { service, prisma } = setup();

      await expect(
        service.login({ email: USER.email, password: TOO_LONG_PASSWORD }),
      ).rejects.toThrow(INVALID);
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('getCurrentUser', () => {
    it('user ada → data publik user', async () => {
      const { service, prisma } = setup();
      prisma.user.findUnique.mockResolvedValue(USER);

      await expect(service.getCurrentUser(USER.id)).resolves.toEqual(USER);
      expect(prisma.user.findUnique.mock.calls[0][0].select).not.toHaveProperty(
        'passwordHash',
      );
    });

    it('user sudah tidak ada → 401', async () => {
      const { service, prisma } = setup();
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getCurrentUser(USER.id)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });
});
