import { UnauthorizedException } from '@nestjs/common';
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
