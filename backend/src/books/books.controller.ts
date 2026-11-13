import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface.js';
import { BooksService } from './books.service.js';
import { CreateBookDto } from './dto/create-book.dto.js';
import { QueryBooksDto } from './dto/query-books.dto.js';
import { UpdateBookDto } from './dto/update-book.dto.js';

// Semua endpoint buku membutuhkan login (PRD §7 aturan 3).
@Controller('books')
@UseGuards(JwtAuthGuard)
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateBookDto) {
    return this.booksService.create(user.id, dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: QueryBooksDto,
  ) {
    return this.booksService.findAll(user.id, query);
  }

  // ParseUUIDPipe: ID yang bukan UUID langsung ditolak 400,
  // sebelum sampai ke database (kolom id bertipe UUID).
  @Get(':id')
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.booksService.findOne(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBookDto,
  ) {
    return this.booksService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.booksService.remove(user.id, id);
  }
}
