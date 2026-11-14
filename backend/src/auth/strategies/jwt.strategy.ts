import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
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
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getJwtSecret(),
    });
  }

  // Nilai yang dikembalikan di sini menjadi `request.user`.
  validate(payload: JwtPayload): AuthenticatedUser {
    return { id: payload.sub, email: payload.email };
  }
}
