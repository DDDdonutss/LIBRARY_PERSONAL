import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface.js';

/**
 * Mengambil user yang sedang login dari request (diisi oleh JwtStrategy).
 * Contoh: `findAll(@CurrentUser() user: AuthenticatedUser)`.
 * Hanya dipakai pada endpoint yang dilindungi JwtAuthGuard.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser => {
    const request = context
      .switchToHttp()
      .getRequest<{ user: AuthenticatedUser }>();
    return request.user;
  },
);
