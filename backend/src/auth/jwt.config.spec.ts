import { getJwtExpiresIn } from './jwt.config.js';

/**
 * JWT_EXPIRES_IN dari environment selalu berupa string. jsonwebtoken membaca
 * string angka tanpa satuan sebagai MILIDETIK ("60" = 60 ms), sehingga
 * getJwtExpiresIn() wajib mengembalikan jumlah DETIK dan menolak format yang
 * tidak dikenal saat startup.
 */
describe('getJwtExpiresIn', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('default 1 hari (86400 detik) bila JWT_EXPIRES_IN tidak diisi', () => {
    vi.stubEnv('JWT_EXPIRES_IN', undefined);

    expect(getJwtExpiresIn()).toBe(86_400);
  });

  it.each([
    ['60', 60],
    ['3600', 3_600],
    ['60s', 60],
    ['15m', 900],
    ['12h', 43_200],
    ['1d', 86_400],
    ['7d', 604_800],
    ['1D', 86_400],
    [' 1h ', 3_600],
  ])('"%s" → %i detik', (value, seconds) => {
    vi.stubEnv('JWT_EXPIRES_IN', value);

    expect(getJwtExpiresIn()).toBe(seconds);
  });

  it.each([
    '',
    '0',
    '0s',
    '-60',
    '1.5h',
    '1 dya',
    '1w',
    'abc',
    '99999999999999999999d',
  ])('"%s" ditolak (aplikasi gagal start)', (value) => {
    vi.stubEnv('JWT_EXPIRES_IN', value);

    expect(() => getJwtExpiresIn()).toThrow('JWT_EXPIRES_IN');
  });
});
