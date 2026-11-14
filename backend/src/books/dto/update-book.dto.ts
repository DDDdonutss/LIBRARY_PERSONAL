import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { trimString } from '../../common/transforms/trim-string.js';
import { BookStatus } from '../../generated/prisma/enums.js';

// Field yang boleh tidak dikirim, tetapi TIDAK boleh null.
// (@IsOptional() meloloskan null, padahal kolom title/author/status wajib terisi.)
const isPresent = (_object: object, value: unknown) => value !== undefined;

/** Semua field opsional; hanya field yang dikirim yang diubah. */
export class UpdateBookDto {
  @ValidateIf(isPresent)
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title?: string;

  @ValidateIf(isPresent)
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  author?: string;

  @ValidateIf(isPresent)
  @IsEnum(BookStatus)
  status?: BookStatus;

  /** Kirim `null` untuk menghapus kategori dari buku. */
  @IsOptional()
  @IsUUID()
  categoryId?: string | null;
}
