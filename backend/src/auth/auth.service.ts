import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import type { JwtPayload } from './interfaces/authenticated-user.interface.js';

// bcrypt hanya memproses 72 byte pertama dari password.
const BCRYPT_MAX_PASSWORD_BYTES = 72;

// Field user yang aman dikirim ke frontend (tanpa passwordHash).
const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

type PublicUser = Prisma.UserGetPayload<{ select: typeof publicUserSelect }>;

// Pesan yang sama untuk email tidak terdaftar dan password salah,
// agar tidak membocorkan informasi mana yang keliru.
const INVALID_CREDENTIALS_MESSAGE = 'Email atau password salah';

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
    if (exceedsBcryptLimit(registerDto.password)) {
      throw new BadRequestException(
        'Password melebihi batas ukuran yang didukung',
      );
    }

    // 2. Normalisasi email
    const email = normalizeEmail(registerDto.email);

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
    let user: PublicUser;
    try {
      user = await this.prisma.user.create({
        data: {
          name: registerDto.name.trim(),
          email,
          passwordHash,
        },
        select: publicUserSelect,
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

    // 6. Buat JWT dan kembalikan data tanpa passwordHash
    return {
      message: 'Registrasi berhasil',
      user,
      accessToken: await this.createAccessToken(user),
    };
  }

  async login(loginDto: LoginDto) {
    // Password yang melebihi batas bcrypt tidak mungkin terdaftar.
    if (exceedsBcryptLimit(loginDto.password)) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    const userWithHash = await this.prisma.user.findUnique({
      where: { email: normalizeEmail(loginDto.email) },
      select: { ...publicUserSelect, passwordHash: true },
    });

    if (
      !userWithHash ||
      !(await compare(loginDto.password, userWithHash.passwordHash))
    ) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    // Buang passwordHash sebelum data dikirim ke frontend.
    const { passwordHash: _passwordHash, ...user } = userWithHash;

    return {
      message: 'Login berhasil',
      user,
      accessToken: await this.createAccessToken(user),
    };
  }

  async getCurrentUser(userId: string): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: publicUserSelect,
    });

    // Token valid tetapi user sudah tidak ada: perlakukan sebagai tidak terautentikasi.
    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }

  private createAccessToken(user: PublicUser): Promise<string> {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    return this.jwtService.signAsync(payload);
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function exceedsBcryptLimit(password: string): boolean {
  return Buffer.byteLength(password, 'utf8') > BCRYPT_MAX_PASSWORD_BYTES;
}
