const DEFAULT_AUTH_RATE_LIMIT_PER_MINUTE = 5;

/**
 * Jumlah maksimal request ke `POST /auth/login` dan `POST /auth/register`
 * per menit per IP, dari AUTH_RATE_LIMIT_PER_MINUTE (default 5). Login dan
 * register dihitung terpisah. Nilai harus bilangan bulat positif; nilai lain
 * membuat aplikasi gagal start agar pembatasan tidak diam-diam mati.
 */
export function getAuthRateLimitPerMinute(): number {
  const value =
    process.env.AUTH_RATE_LIMIT_PER_MINUTE ??
    String(DEFAULT_AUTH_RATE_LIMIT_PER_MINUTE);
  const trimmed = value.trim();
  const limit = /^\d+$/.test(trimmed) ? Number(trimmed) : Number.NaN;

  if (!Number.isSafeInteger(limit) || limit < 1) {
    throw new Error(
      `AUTH_RATE_LIMIT_PER_MINUTE must be a positive whole number; got "${value}"`,
    );
  }

  return limit;
}
