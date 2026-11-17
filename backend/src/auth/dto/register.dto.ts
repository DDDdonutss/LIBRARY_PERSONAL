import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { trimString } from '../../common/transforms/trim-string.js';

export class RegisterDto {
  // Trim berjalan SEBELUM validasi, sehingga nama yang hanya berisi spasi
  // ditolak @IsNotEmpty() (tanpa ini nama "   " lolos dan tersimpan "").
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  // Trim sebelum validasi: tanpa ini @IsEmail menolak email hasil salin-tempel
  // yang berspasi di awal/akhir (" user@example.com ").
  @Transform(trimString)
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;
}
