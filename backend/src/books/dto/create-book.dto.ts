import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { BookStatus } from '../../generated/prisma/enums.js';

/** Menghapus spasi di awal/akhir string; nilai selain string dibiarkan. */
export const trimString = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

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
