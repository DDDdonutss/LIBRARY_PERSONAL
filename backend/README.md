# Personal Library Management — Backend

REST API untuk aplikasi Personal Library Management: autentikasi JWT, kategori global, dan manajemen koleksi buku per user.

**Stack:** NestJS 12 · PostgreSQL · Prisma 7 · JWT (passport-jwt) · class-validator

Kontrak API lengkap (endpoint, request, response, error): [`docs/API-CONTRACT.md`](../docs/API-CONTRACT.md).

---

## 1. Prasyarat

| Kebutuhan | Versi |
|---|---|
| Node.js | 22.12 atau lebih baru (diuji dengan Node 26) |
| npm | Bawaan Node.js |
| PostgreSQL | 14 atau lebih baru (diuji dengan PostgreSQL 18) |

## 2. Instalasi

**0. Clone repository**

```bash
git clone https://github.com/DDDdonutss/PENYIMPAN_BUKU.git
cd PENYIMPAN_BUKU/backend
```

Semua perintah berikutnya dijalankan di folder `backend/`.

**1. Install dependensi**

```bash
npm install
```

Prisma Client otomatis di-generate setelah install (script `postinstall`).

**2. Siapkan environment**

```bash
cp .env.example .env            # Git Bash / macOS / Linux
copy .env.example .env          # Command Prompt / PowerShell
```

Lalu isi `.env` dengan editor teks (simpan sebagai UTF-8):

| Variabel | Keterangan |
|---|---|
| `DATABASE_URL` | Koneksi PostgreSQL, mis. `postgresql://postgres:password@localhost:5432/personal_library_db?schema=public` |
| `JWT_SECRET` | **Wajib diganti**, minimal 32 karakter. Buat dengan `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `JWT_EXPIRES_IN` | Masa berlaku token, default `1d` |
| `PORT` | Port backend, default `3001` |
| `CORS_ORIGIN` | Origin frontend yang diizinkan, default `http://localhost:3000` |

Aplikasi **menolak start** bila `JWT_SECRET` kosong atau kurang dari 32 karakter. File `.env` tidak boleh di-commit.

**3. Buat database**

```bash
psql -U postgres -c "CREATE DATABASE personal_library_db;"
```

**4. Jalankan migration dan seed kategori**

```bash
npm run db:migrate   # membuat tabel User, Book, Category
npm run db:seed      # mengisi kategori global (aman dijalankan berulang)
```

**5. Jalankan backend**

```bash
npm run start:dev
```

API tersedia di **`http://localhost:3001/api/v1`**. Server siap bila log menampilkan `Nest application successfully started`.

## 3. Script

| Script | Fungsi |
|---|---|
| `npm run start:dev` | Menjalankan backend dengan auto-reload |
| `npm run build` | Build ke `dist/` |
| `npm run start:prod` | Menjalankan hasil build (`node dist/main`) — set environment variable terlebih dahulu |
| `npm run db:migrate` | Menerapkan migration ke database (`prisma migrate deploy`) |
| `npm run db:seed` | Mengisi kategori global |
| `npm run prisma:generate` | Generate ulang Prisma Client (setelah mengubah `schema.prisma`) |
| `npm run lint` | Lint dengan oxlint |
| `npm run format` | Format kode dengan Prettier |
| `npm test` | Unit test (Vitest) — saat ini belum ada unit test |
| `npm run test:e2e` | E2E test: seluruh API terhadap database dari `.env` (lihat §5) |

Saat mengembangkan schema, buat migration baru dengan `npx prisma migrate dev --name <nama_perubahan>`.

## 4. Endpoint

Base URL: `http://localhost:3001/api/v1`. 🔒 = membutuhkan header `Authorization: Bearer <accessToken>`.

| Method | Path | Keterangan |
|---|---|---|
| POST | `/auth/register` | Daftar akun, mengembalikan `accessToken` |
| POST | `/auth/login` | Login, mengembalikan `accessToken` |
| GET | `/auth/me` 🔒 | Data user yang sedang login |
| GET | `/categories` 🔒 | Daftar kategori global |
| POST | `/books` 🔒 | Tambah buku |
| GET | `/books` 🔒 | Daftar buku milik user (`page`, `limit`, `search`, `status`, `categoryId`) |
| GET | `/books/:id` 🔒 | Detail buku |
| PATCH | `/books/:id` 🔒 | Ubah buku (sebagian) |
| DELETE | `/books/:id` 🔒 | Hapus buku |

Logout dilakukan di frontend dengan menghapus token (stateless, tanpa endpoint).

## 5. Pengujian API

### E2E test (otomatis)

```bash
npm run test:e2e
```

Menjalankan 26 test (auth, kategori, buku, kepemilikan data) terhadap aplikasi lengkap dengan konfigurasi yang sama seperti `main.ts`. Server **tidak** perlu dijalankan terlebih dahulu.

- Prasyarat: `.env` terisi, migration diterapkan, dan kategori sudah di-seed.
- Test memakai database dari `DATABASE_URL`. Test membuat user uji sendiri (`e2e.*@example.com`) lalu **menghapus hanya user tersebut** di akhir; data lain tidak disentuh.
- Telemetri NestJS Observe dimatikan selama test (`NODE_ENV=test`).

### Bruno (manual atau CLI)

Koleksi Bruno ada di [`bruno/`](./bruno): 60 request dan 91 tes untuk auth, kategori, buku, dan kepemilikan data.

Dengan backend berjalan dan kategori sudah di-seed:

```bash
cd bruno
npx @usebruno/cli run --env local -r
```

Hasil yang diharapkan: `Status ✓ PASS`. Koleksi dapat dijalankan berulang (email user uji dibuat unik per run). Folder `bruno/` juga bisa dibuka di aplikasi Bruno, lalu pilih environment `local`.

Catatan: setiap run membuat user dan buku uji baru di database.

## 6. Struktur Proyek

```text
backend/
├── bruno/                 # Koleksi pengujian API (Bruno)
├── prisma/
│   ├── schema.prisma      # Model User, Book, Category + enum BookStatus
│   ├── migrations/        # Migration SQL
│   └── seed.ts            # Seed kategori global
├── prisma7.config.ts      # Konfigurasi Prisma (schema, migration, seed, DATABASE_URL)
├── test/
│   └── app.e2e-spec.ts    # E2E test API
└── src/
    ├── auth/              # Register, login, JWT strategy/guard, /auth/me
    ├── books/             # CRUD buku, search, filter, pagination, ownership
    ├── categories/        # GET /categories
    ├── prisma/            # PrismaService (koneksi database)
    ├── generated/prisma/  # Prisma Client hasil generate (tidak di-commit)
    ├── app.module.ts
    ├── app.setup.ts       # Prefix /api/v1, CORS, ValidationPipe (dipakai main.ts dan e2e)
    └── main.ts            # Membuat aplikasi dan listen di PORT
```

## 7. Aturan Keamanan yang Diterapkan

- Password di-hash dengan bcrypt (cost 12); `passwordHash` tidak pernah dikirim di response.
- Semua endpoint buku dan kategori dilindungi JWT.
- Setiap query buku memfilter `userId` dari token. Buku milik user lain menghasilkan 404.
- `userId` dari body request ditolak (400); field yang tidak dikenal juga ditolak.
- Secret disimpan di `.env` (di-ignore Git); `.env.example` hanya berisi placeholder.

## 8. Observability (Opsional)

Proyek ini menyertakan `ObserveModule` dari scaffold NestJS. Untuk menghubungkannya ke NestJS Observe, isi `OBSERVE_APP_KEY` dan `OBSERVE_APP_SECRET` di `.env` (lihat `.env.example`). Tanpa variabel ini aplikasi tetap berjalan normal. Observe tidak aktif saat test (`NODE_ENV=test`). Keberadaan modul ini akan dievaluasi saat finalisasi.
