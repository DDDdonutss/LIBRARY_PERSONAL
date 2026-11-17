import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy.js';

/**
 * Issue #15 (opsi a): token yang tanda tangannya valid tetap ditolak bila
 * user pemiliknya sudah tidak ada, di semua endpoint yang dilindungi JWT.
 */

const USER = { id: 'user-1', email: 'user@example.com' };

function setup(found: typeof USER | null) {
  const findUnique = vi.fn().mockResolvedValue(found);
  const prisma = { user: { findUnique } };
  const strategy = new JwtStrategy(prisma as never);
  return { strategy, findUnique };
}

describe('JwtStrategy.validate', () => {
  beforeEach(() => {
    vi.stubEnv('JWT_SECRET', 'x'.repeat(32));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('user masih ada → identitas diambil dari database, bukan dari payload', async () => {
    const { strategy, findUnique } = setup(USER);

    await expect(
      strategy.validate({ sub: USER.id, email: 'lama@example.com' }),
    ).resolves.toEqual(USER);
    expect(findUnique).toHaveBeenCalledWith({
      where: { id: USER.id },
      select: { id: true, email: true },
    });
  });

  it('user sudah dihapus → 401', async () => {
    const { strategy } = setup(null);

    await expect(
      strategy.validate({ sub: USER.id, email: USER.email }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
