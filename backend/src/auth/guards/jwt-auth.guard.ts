import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Pasang dengan @UseGuards(JwtAuthGuard) pada endpoint privat. */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
