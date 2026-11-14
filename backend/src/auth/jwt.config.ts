import type { JwtModuleOptions } from '@nestjs/jwt';

const MIN_JWT_SECRET_LENGTH = 32;

type JwtExpiresIn = NonNullable<JwtModuleOptions['signOptions']>['expiresIn'];

/**
 * Membaca JWT_SECRET dari environment. Dipakai oleh JwtModule (membuat token)
 * dan JwtStrategy (memverifikasi token), sehingga keduanya selalu memakai
 * secret yang sama. Melempar error bila secret tidak aman, agar aplikasi
 * gagal start (fail-fast) alih-alih gagal saat request pertama.
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < MIN_JWT_SECRET_LENGTH) {
    throw new Error(
      `JWT_SECRET must be set and at least ${MIN_JWT_SECRET_LENGTH} characters long`,
    );
  }

  return secret;
}

export function getJwtExpiresIn(): JwtExpiresIn {
  return (process.env.JWT_EXPIRES_IN ?? '1d') as JwtExpiresIn;
}
