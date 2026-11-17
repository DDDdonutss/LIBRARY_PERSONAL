import { getAuthRateLimitPerMinute } from './rate-limit.config.js';

/**
 * Batas percobaan login/register per menit per IP (issue #14). Nilai yang
 * tidak valid harus membuat aplikasi gagal start, bukan diam-diam mematikan
 * atau melonggarkan pembatasan.
 */
describe('getAuthRateLimitPerMinute', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('default 5 bila AUTH_RATE_LIMIT_PER_MINUTE tidak diisi', () => {
    vi.stubEnv('AUTH_RATE_LIMIT_PER_MINUTE', undefined);

    expect(getAuthRateLimitPerMinute()).toBe(5);
  });

  it.each([
    ['1', 1],
    ['10', 10],
    [' 100 ', 100],
  ])('"%s" → %i', (value, limit) => {
    vi.stubEnv('AUTH_RATE_LIMIT_PER_MINUTE', value);

    expect(getAuthRateLimitPerMinute()).toBe(limit);
  });

  it.each(['', '0', '-5', '2.5', 'abc', '10/m', '99999999999999999999'])(
    '"%s" ditolak (aplikasi gagal start)',
    (value) => {
      vi.stubEnv('AUTH_RATE_LIMIT_PER_MINUTE', value);

      expect(() => getAuthRateLimitPerMinute()).toThrow(
        'AUTH_RATE_LIMIT_PER_MINUTE',
      );
    },
  );
});
