import { Module } from '@nestjs/common';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { getJwtExpiresIn, getJwtSecret } from './jwt.config.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';

@Module({
  imports: [
    PassportModule,
    // registerAsync: konfigurasi dibaca saat aplikasi start, sehingga aplikasi
    // langsung gagal (fail-fast) bila JWT_SECRET tidak dikonfigurasi dengan benar.
    JwtModule.registerAsync({
      useFactory: (): JwtModuleOptions => ({
        secret: getJwtSecret(),
        signOptions: { expiresIn: getJwtExpiresIn() },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
