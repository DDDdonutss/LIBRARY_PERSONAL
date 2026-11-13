import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash } from 'bcrypt';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterDto } from './dto/register.dto.js';

// bcrypt hanya memproses 72 byte pertama dari password.
const BCRYPT_MAX_PASSWORD_BYTES = 72;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // 1. Validasi input yang tidak bisa dicek DTO, sebelum menyentuh database.
    //    @MaxLength(72) di DTO menghitung karakter, sedangkan batas bcrypt
    //    dihitung dalam byte (karakter non-ASCII bisa lebih dari 1 byte).
    if (
      Buffer.byteLength(registerDto.password, 'utf8') >
      BCRYPT_MAX_PASSWORD_BYTES
    ) {
      throw new BadRequestException(
        'Password melebihi batas ukuran yang didukung',
      );
    }

    // 2. Normalisasi email
    const email = registerDto.email.trim().toLowerCase();

    // 3. Periksa apakah email sudah digunakan
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email sudah terdaftar');
    }

    // 4. Hash password sebelum disimpan
    const passwordHash = await hash(registerDto.password, 12);

    // 5. Simpan pengguna ke database
    let user: { id: string; name: string; email: string; createdAt: Date };
    try {
      user = await this.prisma.user.create({
        data: {
          name: registerDto.name.trim(),
          email,
          passwordHash,
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      });
    } catch (error) {
      // P2002 = unique constraint gagal. Terjadi bila dua request dengan email
      // yang sama lolos pengecekan langkah 3 secara bersamaan.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email sudah terdaftar');
      }
      throw error;
    }

    // 6. Buat JWT
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    // 7. Kembalikan data tanpa passwordHash
    return {
      message: 'Registrasi berhasil',
      user,
      accessToken,
    };
  }
}
