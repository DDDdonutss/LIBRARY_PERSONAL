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
import { BookStatus } from '../../generated/prisma/enums.js';
import { trimString } from './create-book.dto.js';

export const DEFAULT_PAGE_LIMIT = 10;
export const MAX_PAGE_LIMIT = 100;

/** Query string untuk GET /books, mis. ?page=2&limit=10&search=clean&status=READING */
export class QueryBooksDto {
  // Query string selalu berupa teks; @Type mengubahnya menjadi number.
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
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
