// Bentuk data dari backend, sesuai docs/API-CONTRACT.md.

export type BookStatus = 'WANT_TO_READ' | 'READING' | 'COMPLETED';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string; // ISO 8601 UTC
}

// POST /auth/register dan POST /auth/login
export interface AuthResponse {
  message: string;
  user: User;
  accessToken: string;
}

// GET /categories mengembalikan Category[]
export interface Category {
  id: string;
  name: string;
}

// GET /books/:id, POST /books, PATCH /books/:id
export interface Book {
  id: string;
  title: string;
  author: string;
  status: BookStatus;
  categoryId: string | null;
  category: Category | null;
  createdAt: string;
  updatedAt: string;
}

// GET /books
export interface BookList {
  data: Book[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// DELETE /books/:id
export interface DeleteBookResponse {
  message: string;
  id: string;
}

// GET /books/stats
export interface BookStats {
  total: number;
  byStatus: Record<BookStatus, number>;
  byCategory: {
    categoryId: string | null;
    name: string | null;
    count: number;
  }[];
}

// Isi respons bila request gagal
export interface ApiErrorBody {
  statusCode: number;
  message: string | string[];
  error?: string;
}
