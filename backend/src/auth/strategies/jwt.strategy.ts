import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service.js';
import type {
  AuthenticatedUser,
  JwtPayload,
} from '../interfaces/authenticated-user.interface.js';
import { getJwtSecret } from '../jwt.config.js';

/**
 * Strategy 'jwt': membaca token dari header `Authorization: Bearer <token>`,
 * memverifikasi tanda tangan dan masa berlakunya, lalu memanggil validate().
 * Token invalid atau kedaluwarsa otomatis menghasilkan 401.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getJwtSecret(),
    });
  }

  /**
   * Nilai yang dikembalikan di sini menjadi `request.user`.
   *
   * Token bertanda tangan valid tetap ditolak (401) bila user pemiliknya
   * sudah tidak ada (issue #15), sehingga semua endpoint yang dilindungi
   * memperlakukannya sama seperti `GET /auth/me`. Satu query primary key
   * per request terautentikasi.
   */
  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
