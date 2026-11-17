import { Module } from '@nestjs/common';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import {
  minutes,
  ThrottlerModule,
  type ThrottlerModuleOptions,
} from '@nestjs/throttler';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { getJwtExpiresIn, getJwtSecret } from './jwt.config.js';
import { getAuthRateLimitPerMinute } from './rate-limit.config.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';

@Module({
  imports: [
    PassportModule,
    // registerAsync: konfigurasi dibaca saat aplikasi start, sehingga aplikasi
    // langsung gagal (fail-fast) bila JWT_SECRET atau JWT_EXPIRES_IN tidak valid.
    JwtModule.registerAsync({
      useFactory: (): JwtModuleOptions => ({
        secret: getJwtSecret(),
        signOptions: { expiresIn: getJwtExpiresIn() },
      }),
    }),
    // Rate limiting login/register (issue #14): batas per menit per IP,
    // dipakai lewat @UseGuards(ThrottlerGuard) di AuthController. Hitungan
    // disimpan in-memory per proses aplikasi.
    ThrottlerModule.forRootAsync({
      useFactory: (): ThrottlerModuleOptions => ({
        throttlers: [{ ttl: minutes(1), limit: getAuthRateLimitPerMinute() }],
        errorMessage: 'Terlalu banyak percobaan. Coba lagi nanti.',
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
