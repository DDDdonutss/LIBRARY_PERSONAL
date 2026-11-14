/**
 * Transformer class-transformer untuk `@Transform()`: menghapus spasi di
 * awal/akhir string sebelum validasi berjalan. Dengan ini `@IsNotEmpty()`
 * menolak nilai yang hanya berisi spasi, dan `@MaxLength()` menghitung
 * panjang nilai yang benar-benar tersimpan.
 *
 * Nilai selain string dibiarkan agar `@IsString()` tetap bisa menolaknya.
 */
export const trimString = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;
