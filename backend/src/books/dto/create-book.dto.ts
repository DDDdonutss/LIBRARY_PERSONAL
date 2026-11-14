import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { trimString } from '../../common/transforms/trim-string.js';
import { BookStatus } from '../../generated/prisma/enums.js';

export class CreateBookDto {
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  author: string;

  /** Opsional; default WANT_TO_READ (diatur di schema database). */
  @IsOptional()
  @IsEnum(BookStatus)
  status?: BookStatus;

  /** Opsional; `null` atau tidak dikirim berarti buku tanpa kategori. */
  @IsOptional()
  @IsUUID()
  categoryId?: string | null;
}
