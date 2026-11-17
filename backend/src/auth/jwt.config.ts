const MIN_JWT_SECRET_LENGTH = 32;

const DEFAULT_JWT_EXPIRES_IN = '1d';

/** Jumlah detik per satuan yang diterima JWT_EXPIRES_IN. */
const SECONDS_PER_UNIT = {
  s: 1,
  m: 60,
  h: 60 * 60,
  d: 24 * 60 * 60,
} as const;

type TimeUnit = keyof typeof SECONDS_PER_UNIT;

// Bilangan bulat, opsional diikuti satu satuan: "3600", "60s", "15m", "12h", "7d".
const JWT_EXPIRES_IN_PATTERN = /^(\d+)([smhd])?$/i;

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

/**
 * Masa berlaku token dalam DETIK, dari JWT_EXPIRES_IN (default "1d").
 *
 * Nilai environment selalu string, dan jsonwebtoken membaca string angka
 * tanpa satuan sebagai milidetik ("60" = 60 ms, token langsung kedaluwarsa).
 * Mengirim angka detik menghilangkan ambiguitas itu. Format yang tidak
 * dikenal membuat aplikasi gagal start, bukan gagal saat register/login.
 */
export function getJwtExpiresIn(): number {
  const value = process.env.JWT_EXPIRES_IN ?? DEFAULT_JWT_EXPIRES_IN;
  const match = JWT_EXPIRES_IN_PATTERN.exec(value.trim());

  let seconds = Number.NaN;
  if (match) {
    const [, amount, unit = 's'] = match;
    seconds = Number(amount) * SECONDS_PER_UNIT[unit.toLowerCase() as TimeUnit];
  }

  if (!Number.isSafeInteger(seconds) || seconds <= 0) {
    throw new Error(
      `JWT_EXPIRES_IN must be a positive whole number of seconds (e.g. "3600") ` +
        `or a number with unit s, m, h, or d (e.g. "15m", "1d"); got "${value}"`,
    );
  }

  return seconds;
}
