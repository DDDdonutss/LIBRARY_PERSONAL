import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { trimString } from '../../common/transforms/trim-string.js';
import { BookStatus } from '../../generated/prisma/enums.js';

export const DEFAULT_PAGE_LIMIT = 10;
export const MAX_PAGE_LIMIT = 100;

/**
 * Batas atas `page` (90071992547409). @IsInt menerima angka sebesar 1e20,
 * dan offset (page - 1) * limit sebesar itu melewati batas int64 sehingga
 * Prisma melempar error (500). Batas ini dipilih agar offset terbesar
 * ((MAX_PAGE - 1) * MAX_PAGE_LIMIT) tetap bilangan bulat aman JavaScript,
 * sehingga nilai yang dikirim ke database selalu tepat (tanpa pembulatan).
 */
export const MAX_PAGE = Math.floor(Number.MAX_SAFE_INTEGER / MAX_PAGE_LIMIT);

/** Query string untuk GET /books, mis. ?page=2&limit=10&search=clean&status=READING */
export class QueryBooksDto {
  // Query string selalu berupa teks; @Type mengubahnya menjadi number.
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_LIMIT)
  limit: number = DEFAULT_PAGE_LIMIT;

  /** Pencarian judul, tidak peka huruf besar/kecil, cocok sebagian. */
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(200)
  search?: string;

  @IsOptional()
  @IsEnum(BookStatus)
  status?: BookStatus;

  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
