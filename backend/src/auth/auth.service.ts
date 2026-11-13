import {
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash } from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterDto } from './dto/register.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // 1. Normalisasi email
    const email = registerDto.email.trim().toLowerCase();

    // 2. Periksa apakah email sudah digunakan
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email sudah terdaftar');
    }

    // 3. Pastikan password tidak melebihi batas bcrypt
    if (Buffer.byteLength(registerDto.password, 'utf8') > 72) {
      throw new ConflictException(
        'Password melebihi batas ukuran yang didukung',
      );
    }

    // 4. Hash password sebelum disimpan
    const passwordHash = await hash(registerDto.password, 12);

    // 5. Simpan pengguna ke database
    const user = await this.prisma.user.create({
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
