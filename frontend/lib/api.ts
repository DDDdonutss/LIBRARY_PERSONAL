import { clearToken, getToken } from './auth';
import type {
  ApiErrorBody,
  AuthResponse,
  Book,
  BookList,
  BookStatus,
  Category,
  User,
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const NETWORK_ERROR_MESSAGE = 'Tidak dapat terhubung ke server';
export const GENERIC_ERROR_MESSAGE = 'Terjadi kesalahan, coba lagi';

/** Error dari request API. `status` 0 berarti backend tidak bisa dihubungi. */
export class ApiError extends Error {
  readonly status: number;
  readonly messages: string[];

  constructor(status: number, messages: string[]) {
    super(messages.join(' '));
    this.name = 'ApiError';
    this.status = status;
    this.messages = messages;
  }
}

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

/**
 * Satu-satunya pintu ke backend. Menambahkan token, mengirim/menerima JSON,
 * dan menangani error sesuai tabel "Penanganan respons" (issue #29).
 */
export async function apiFetch<T>(
  path: string,
  options: { method?: Method; body?: unknown } = {},
): Promise<T> {
  if (!API_URL) {
    throw new ApiError(0, [
      'NEXT_PUBLIC_API_URL belum diisi. Salin .env.example menjadi .env.local, lalu jalankan ulang npm run dev.',
    ]);
  }

  const { method = 'GET', body } = options;
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    // Backend mati, alamat salah, atau request diblokir CORS.
    throw new ApiError(0, [NETWORK_ERROR_MESSAGE]);
  }

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    // 401 dari login berarti email/password salah, bukan sesi berakhir.
    if (response.status === 401 && path !== '/auth/login') {
      clearToken();
      window.location.replace('/login');
    }
    throw new ApiError(response.status, messagesFrom(data, response.status));
  }

  return data as T;
}

/** Pesan dari body error backend: `message` bisa string atau array string. */
function messagesFrom(data: unknown, status: number): string[] {
  if (status >= 500) return [GENERIC_ERROR_MESSAGE];

  const message = (data as Partial<ApiErrorBody> | null)?.message;
  if (typeof message === 'string' && message) return [message];
  if (Array.isArray(message)) {
    const texts = message.filter((m): m is string => typeof m === 'string');
    if (texts.length > 0) return texts;
  }
  return [GENERIC_ERROR_MESSAGE];
}

/** Pesan yang siap ditampilkan untuk error apa pun. */
export function errorMessages(error: unknown): string[] {
  return error instanceof ApiError ? error.messages : [GENERIC_ERROR_MESSAGE];
}

// ---------------------------------------------------------------- Auth

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export function register(input: RegisterInput) {
  return apiFetch<AuthResponse>('/auth/register', { method: 'POST', body: input });
}

export function login(input: LoginInput) {
  return apiFetch<AuthResponse>('/auth/login', { method: 'POST', body: input });
}

export function getMe() {
  return apiFetch<User>('/auth/me');
}

// ---------------------------------------------------------- Categories

export function getCategories() {
  return apiFetch<Category[]>('/categories');
}

// --------------------------------------------------------------- Books

/** Body untuk tambah/ubah buku. `categoryId: null` = tanpa kategori. */
export interface BookInput {
  title: string;
  author: string;
  status: BookStatus;
  categoryId: string | null;
}

/** Halaman pertama daftar buku (10 buku terbaru). */
export function getBooks() {
  return apiFetch<BookList>('/books');
}

export function createBook(input: BookInput) {
  return apiFetch<Book>('/books', { method: 'POST', body: input });
}
