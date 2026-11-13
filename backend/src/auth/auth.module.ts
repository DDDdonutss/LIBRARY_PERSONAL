import { Module } from '@nestjs/common';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

const MIN_JWT_SECRET_LENGTH = 32;

type JwtExpiresIn = NonNullable<JwtModuleOptions['signOptions']>['expiresIn'];

@Module({
  imports: [
    // registerAsync: konfigurasi dibaca saat aplikasi start, sehingga aplikasi
    // langsung gagal (fail-fast) bila JWT_SECRET tidak dikonfigurasi dengan benar.
    JwtModule.registerAsync({
      useFactory: (): JwtModuleOptions => {
        const secret = process.env.JWT_SECRET;

        if (!secret || secret.length < MIN_JWT_SECRET_LENGTH) {
          throw new Error(
            `JWT_SECRET must be set and at least ${MIN_JWT_SECRET_LENGTH} characters long`,
          );
        }

        return {
          secret,
          signOptions: {
            expiresIn: (process.env.JWT_EXPIRES_IN ?? '1d') as JwtExpiresIn,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
