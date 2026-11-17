# Jobdesk Panji
# Backend, Database & Integration Developer

**Project:** Personal Library Management  
**Version:** 1.8  
**Status:** Final — Baseline Tanggung Jawab (v1.1–v1.8 menyinkronkan dengan hasil implementasi backend; lihat Riwayat Revisi)  
**Role:** Team Lead, Backend Developer, Database Developer, Integration Developer

---

## 1. Role Overview

Panji bertanggung jawab terhadap pengembangan backend, database, autentikasi, API, dan integrasi sistem Personal Library Management.

Panji juga bertanggung jawab mengoordinasikan pekerjaan tim, memastikan implementasi mengikuti PRD, dan menjaga agar integrasi frontend dan backend berjalan sesuai kontrak API.

## 2. Main Responsibilities

### A. Backend Development
Mengembangkan backend menggunakan NestJS.

Tanggung jawab:
- Inisialisasi proyek NestJS.
- Mengatur struktur module.
- Membuat controller dan service.
- Membuat REST API.
- Mengimplementasikan DTO.
- Mengatur validasi request.
- Menangani error dan exception.
- Menjaga konsistensi respons API.

### B. Database Development
Mengelola PostgreSQL dan Prisma.

Tanggung jawab:
- Menyiapkan database PostgreSQL.
- Mengintegrasikan Prisma.
- Membuat Prisma schema.
- Membuat migration.
- Membuat seed kategori global.
- Mengatur relasi User, Book, dan Category.
- Memastikan integritas data.

### C. Authentication & Authorization
Mengimplementasikan sistem autentikasi.

Tanggung jawab:
- Register.
- Login.
- Password hashing.
- JWT generation.
- JWT strategy dan guard.
- Current user endpoint.
- Proteksi endpoint privat.
- Validasi kepemilikan data.

### D. Book Management API
Mengimplementasikan:
- Create Book.
- Get Books.
- Get Book Detail.
- Update Book.
- Delete Book.
- Search berdasarkan judul.
- Filter status.
- Filter kategori.
- Pagination.
- Statistik koleksi (total, per status, per kategori) untuk dashboard.

### E. Category API
Mengimplementasikan:
- Endpoint `GET /categories`.
- Pengambilan kategori global.
- Validasi kategori saat buku dibuat atau diperbarui.
- Seed kategori awal.

### F. Integration
Bertanggung jawab menghubungkan backend dengan frontend yang dikerjakan X.

Tanggung jawab:
- Menyediakan API Contract.
- Menjelaskan request dan response.
- Menyediakan konfigurasi base URL.
- Menangani CORS.
- Membantu debugging integrasi.
- Memastikan API dapat digunakan frontend.

### G. Team Lead
- Membagi pekerjaan dan prioritas.
- Menjaga kesesuaian implementasi dengan PRD.
- Mengelola workflow GitHub.
- Melakukan review Pull Request.
- Mengidentifikasi hambatan teknis.
- Menjaga dokumentasi proyek.

## 3. Technology Stack

| Technology | Responsibility |
|---|---|
| NestJS | Backend framework |
| PostgreSQL | Relational database |
| Prisma | ORM |
| JWT | Authentication |
| class-validator | DTO validation |
| Bruno | API testing manual/CLI (`backend/bruno/`) |
| Vitest + supertest | E2E test otomatis (`backend/test/`) dan unit test (`backend/src/**/*.spec.ts`) |
| Git & GitHub | Version control (https://github.com/DDDdonutss/LIBRARY_PERSONAL) |

## 4. Database Design

### User
- id
- name
- email
- passwordHash
- createdAt
- updatedAt

### Book
- id
- title
- author
- status
- userId
- categoryId
- createdAt
- updatedAt

### Category
- id
- name
- createdAt
- updatedAt

### Relationships
- User memiliki banyak Book.
- Book dimiliki satu User.
- Category dapat digunakan banyak Book.
- Book memiliki nol atau satu Category.

### Database Constraints
- Email unik.
- Nama kategori unik.
- UserId wajib.
- CategoryId nullable.
- Status menggunakan enum.
- Foreign key harus valid.

### Implementasi (Prisma schema)
- Semua ID bertipe UUID (`@db.Uuid`).
- Status default `WANT_TO_READ`.
- Hapus user → buku ikut terhapus (`onDelete: Cascade`).
- Hapus kategori → `categoryId` buku menjadi `null` (`onDelete: SetNull`).
- Index: `Book.userId`, `Book.categoryId`, dan `(userId, status)` untuk filter.
- Migration awal: `prisma/migrations/20261113060551_init`.

## 5. Backend Functional Requirements

Base path: `/api/v1` (lokal: `http://localhost:3001/api/v1`).

| ID | Requirement | Endpoint | Status |
|---|---|---|---|
| BE-01 | Register | POST /api/v1/auth/register | ✅ |
| BE-02 | Login | POST /api/v1/auth/login | ✅ |
| BE-03 | Current User | GET /api/v1/auth/me | ✅ |
| BE-04 | Create Book | POST /api/v1/books | ✅ |
| BE-05 | Get Books | GET /api/v1/books | ✅ |
| BE-06 | Get Book Detail | GET /api/v1/books/:id | ✅ |
| BE-07 | Update Book | PATCH /api/v1/books/:id | ✅ |
| BE-08 | Delete Book | DELETE /api/v1/books/:id | ✅ |
| BE-09 | Get Categories | GET /api/v1/categories | ✅ |
| BE-10 | Book Statistics (dashboard) | GET /api/v1/books/stats | ✅ |

Semua endpoint buku memerlukan autentikasi. `GET /categories` juga memerlukan autentikasi (dikonfirmasi tim 2026-11-15, issue #11: kategori tidak dibutuhkan sebelum login). Daftar 6 kategori seed (Fiction, Science, Technology, History, Education, Other) bersifat final.

## 6. Security Requirements

### Authentication
- Gunakan JWT untuk autentikasi.
- Password harus di-hash.
- Jangan mengembalikan password atau passwordHash.
- Endpoint privat harus menggunakan JWT Guard.
- Token milik user yang sudah dihapus ditolak (401) di semua endpoint privat (issue #15).
- Login dan register dibatasi per IP dengan `@nestjs/throttler` (`AUTH_RATE_LIMIT_PER_MINUTE`, default 5 per menit; issue #14).

### Authorization
Setiap query terhadap buku harus mempertimbangkan pemiliknya.

Contoh konsep:

```typescript
where: {
  id: bookId,
  userId: authenticatedUser.id
}
```

Jangan menggunakan userId dari request body untuk menentukan pemilik buku.

### Logout
Gunakan pendekatan stateless. Frontend menghapus token. Backend tidak membuat blacklist atau refresh token pada versi ini.

## 7. API Contract Responsibility

Panji harus menyediakan dokumentasi berikut. **Status: tersedia lengkap di `docs/API-CONTRACT.md`.**

### Authentication
- Register request dan response.
- Login request dan response.
- Current user response.

### Books
- Create request dan response.
- List response.
- Detail response.
- Update request dan response.
- Delete response.
- Stats response (dashboard).

### Categories
- Category list response.

### Query Parameters
- page
- limit
- search
- status
- categoryId

### Error Handling
Gunakan HTTP status yang sesuai:
- 200 OK — GET, login, PATCH, DELETE
- 201 Created — register, create book
- 400 Bad Request — validasi gagal, field tidak dikenal, ID bukan UUID, kategori tidak ada
- 401 Unauthorized — token tidak ada/tidak valid, kredensial salah
- 404 Not Found — buku tidak ada **atau milik user lain**
- 409 Conflict — email sudah terdaftar
- 500 Internal Server Error — kesalahan tak terduga

## 8. Backend Structure (aktual)

Rancangan awal di versi 1.0 diikuti; struktur di bawah adalah hasil implementasi.

```text
backend/
├── bruno/                       # Koleksi Bruno: 01 Auth, 02 Categories, 03 Books, 04 Ownership, 05 Stats, 06 Hardening
├── prisma/
│   ├── schema.prisma
│   ├── migrations/              # 20261113060551_init
│   └── seed.ts                  # Seed kategori global (npm run db:seed)
├── prisma7.config.ts            # Konfigurasi Prisma 7 (schema, migration, seed, DATABASE_URL)
├── test/
│   └── app.e2e-spec.ts          # E2E test (npm run test:e2e)
├── src/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.service.spec.ts  # Unit test normalisasi email (npm test)
│   │   ├── auth.module.ts
│   │   ├── jwt.config.ts        # Validasi JWT_SECRET, JWT_EXPIRES_IN
│   │   ├── jwt.config.spec.ts   # Unit test JWT_EXPIRES_IN (npm test)
│   │   ├── rate-limit.config.ts # Validasi AUTH_RATE_LIMIT_PER_MINUTE (+ spec)
│   │   ├── dto/                 # register.dto.ts, login.dto.ts
│   │   ├── strategies/          # jwt.strategy.ts (+ spec: user terhapus → 401)
│   │   ├── guards/              # jwt-auth.guard.ts
│   │   ├── decorators/          # current-user.decorator.ts
│   │   └── interfaces/          # authenticated-user.interface.ts
│   ├── books/
│   │   ├── books.controller.ts
│   │   ├── books.service.ts
│   │   ├── books.service.spec.ts  # Unit test statistik (npm test)
│   │   ├── books.module.ts
│   │   └── dto/                 # create-book, update-book, query-books (+ spec batas page)
│   ├── categories/
│   │   ├── categories.controller.ts
│   │   ├── categories.service.ts
│   │   └── categories.module.ts
│   ├── common/
│   │   └── transforms/          # trim-string.ts (dipakai DTO auth dan books)
│   ├── prisma/
│   │   ├── prisma.service.ts
│   │   ├── prisma.module.ts
│   │   ├── prisma-exception.filter.ts       # Filter global: error Prisma → 409/400/404
│   │   └── prisma-exception.filter.spec.ts  # Unit test pemetaan error (npm test)
│   ├── generated/prisma/        # Prisma Client hasil generate (tidak di-commit)
│   ├── app.module.ts
│   ├── app.setup.ts             # Prefix /api/v1, CORS, ValidationPipe, filter error Prisma
│   └── main.ts
├── .env                         # Tidak di-commit
├── .env.example
└── package.json
```

## 9. Environment Variables

Variabel yang dipakai (lihat `backend/.env.example`):

| Variabel | Wajib | Default | Keterangan |
|---|---|---|---|
| `DATABASE_URL` | Ya | — | Koneksi PostgreSQL |
| `JWT_SECRET` | Ya | — | Minimal 32 karakter; aplikasi menolak start bila kosong/terlalu pendek |
| `JWT_EXPIRES_IN` | Tidak | `1d` | Masa berlaku token. Angka saja = detik (`3600`), atau angka + satuan `s`/`m`/`h`/`d`; format lain membuat aplikasi menolak start |
| `PORT` | Tidak | `3001` | Port backend |
| `CORS_ORIGIN` | Tidak | `http://localhost:3000` | Origin frontend, pisahkan dengan koma bila lebih dari satu |
| `AUTH_RATE_LIMIT_PER_MINUTE` | Tidak | `5` | Batas percobaan login dan register per menit per IP (dihitung terpisah); bilangan bulat positif, nilai lain → aplikasi menolak start |

Integrasi NestJS Observe (beserta `OBSERVE_APP_KEY`/`OBSERVE_APP_SECRET`) dihapus pada 2026-11-15 (GitHub issue #10).

Ketentuan:
- `.env` tidak boleh di-commit. ✅ Ter-ignore Git dan tidak pernah ada di riwayat commit.
- `.env.example` harus disediakan. ✅ `backend/.env.example` (satu file per aplikasi; frontend akan memiliki miliknya sendiri).
- Jangan menaruh credential asli di GitHub. ✅ Riwayat sudah diaudit sebelum push.
- Gunakan secret yang aman di lingkungan deployment.

## 10. Implementation Phases

### Status dan Pemetaan

Penomoran phase di dokumen ini berbeda dengan `MASTER-PROMPT.md` (Phase 0–9; dokumen internal, tidak disertakan di repository). Pemetaan dan status per 2026-11-15:

| Phase (Jobdesk) | Phase (MASTER-PROMPT) | Status |
|---|---|---|
| 1 — Project Preparation | 0, 1 | ✅ Selesai |
| 2 — Backend Setup | 2 | ✅ Selesai |
| 3 — Database | 3 | ✅ Selesai |
| 4 — Authentication | 4 | ✅ Selesai |
| 5 — Book Management | 5 | ✅ Selesai |
| 6 — Category | 6 | ✅ Selesai (daftar kategori final, issue #11) |
| 7 — Integration | 8 | ⏳ Backend siap (CORS, API Contract); menunggu frontend |
| 8 — Testing & Documentation | 7, 9 | ✅ Testing dan dokumentasi backend selesai; finalisasi menunggu integrasi |

Urutan pengerjaan aktual: Category API dikerjakan **sebelum** Book Management, karena validasi `categoryId` pada buku membutuhkan kategori. Rincian bukti setiap phase ada di `docs/IMPLEMENTATION-LOG.md`.

### Phase 1 — Project Preparation
- Memahami PRD.
- Memahami ERD.
- Memahami API Contract.
- Menyiapkan repository.
- Menyiapkan struktur backend.

### Phase 2 — Backend Setup
- Membuat NestJS project.
- Mengatur konfigurasi.
- Menghubungkan PostgreSQL.
- Mengintegrasikan Prisma.

### Phase 3 — Database
- Membuat schema.
- Membuat migration.
- Membuat seed kategori.
- Menguji koneksi database.

### Phase 4 — Authentication
- Register.
- Password hashing.
- Login.
- JWT.
- Current user.
- Guard.

### Phase 5 — Book Management
- Create.
- Read.
- Update.
- Delete.
- Search.
- Filter.
- Pagination.

### Phase 6 — Category
- Global category.
- Seed.
- Get categories.
- Validasi categoryId.

### Phase 7 — Integration
- Menyiapkan API untuk X.
- Menguji komunikasi frontend-backend.
- Memperbaiki CORS.
- Debugging integrasi.

### Phase 8 — Testing & Documentation
- API testing.
- Ownership testing.
- Authentication testing.
- README.
- Dokumentasi teknis.

## 11. Testing Checklist

Semua item diverifikasi dengan koleksi Bruno (`backend/bruno/`, 82 request / 129 tes), e2e test (`npm run test:e2e`, 51 tes), dan unit test (`npm test`, 52 tes: statistik, `JWT_EXPIRES_IN`, `AUTH_RATE_LIMIT_PER_MINUTE`, validasi token, normalisasi email, batas `page`, pemetaan error Prisma). Bukti per item ada di `docs/IMPLEMENTATION-LOG.md`.

### Authentication
- [x] Register berhasil.
- [x] Email duplikat ditolak. *(termasuk beda huruf besar/kecil dan request bersamaan)*
- [x] Password di-hash. *(bcrypt cost 12, dicek di database)*
- [x] Login berhasil.
- [x] Password salah ditolak.
- [x] Token invalid ditolak. *(tanpa token, rusak, tanda tangan palsu, kedaluwarsa, milik user yang sudah dihapus)*
- [x] Percobaan login/register berlebihan dibatasi. *(429 setelah batas per menit per IP; login dan register dihitung terpisah)*
- [x] Konfigurasi JWT tidak valid ditolak saat startup. *(`JWT_SECRET` < 32 karakter, format `JWT_EXPIRES_IN` tidak dikenal)*
- [x] Email berspasi di awal/akhir di-trim sebelum validasi.
- [x] Current user berjalan.

### Books
- [x] Create berhasil.
- [x] Get list berhasil.
- [x] Get detail berhasil.
- [x] Update berhasil.
- [x] Delete berhasil.
- [x] Search berhasil. *(`%`, `_`, `\` dicari apa adanya)*
- [x] Filter berhasil.
- [x] Pagination berhasil. *(termasuk batas atas `page`: di luar rentang → 400, bukan 500)*
- [x] Statistik koleksi benar (per status, per kategori) dan hanya menghitung buku user sendiri.

### Data Ownership
- [x] Pengguna A hanya melihat buku miliknya.
- [x] Pengguna A tidak dapat membaca buku pengguna B.
- [x] Pengguna A tidak dapat mengubah buku pengguna B.
- [x] Pengguna A tidak dapat menghapus buku pengguna B.

### Category
- [x] Kategori tersedia.
- [x] Semua pengguna mendapatkan kategori yang sama.
- [x] CategoryId tidak valid ditolak.

## 12. Definition of Done

- [x] Backend NestJS berjalan.
- [x] PostgreSQL terhubung.
- [x] Prisma berjalan.
- [x] Schema dan migration tersedia.
- [x] Kategori global tersedia.
- [x] Authentication berjalan.
- [x] JWT Guard berjalan.
- [x] CRUD buku berjalan.
- [x] Ownership berjalan.
- [x] Search dan filter berjalan.
- [x] Pagination berjalan.
- [x] API Contract sesuai implementasi.
- [ ] Frontend dapat menggunakan API. *(menunggu frontend)*
- [x] Dokumentasi backend tersedia.

## 13. Working Principles

1. Jangan mengerjakan semua fitur sekaligus.
2. Kerjakan berdasarkan phase.
3. Uji setiap fitur sebelum berpindah tahap.
4. Jangan mengubah database schema tanpa mempertimbangkan dampak relasi.
5. Jangan mengubah API Contract tanpa menginformasikan X.
6. Gunakan Git branch untuk pekerjaan terpisah.
7. Gunakan Pull Request untuk menggabungkan pekerjaan.
8. Pastikan kode dapat dipahami dan dijelaskan kembali oleh Panji.

### Penerapan Alur Git

Pekerjaan backend dibagi ke branch bertumpuk dan digabung lewat Pull Request berurutan (merge commit, bukan squash/rebase):

| Urutan | Branch | Isi |
|---|---|---|
| 1 | `feature/backend-setup` | Prisma, schema, migration |
| 2 | `feature/backend-auth` | Register, login, JWT, `/auth/me`, CORS |
| 3 | `feature/backend-categories` | Seed dan endpoint kategori |
| 4 | `feature/backend-books` | CRUD buku, ownership, e2e test, README backend |
| 5 | `docs/sync-project-docs` | Sinkronisasi dokumen |
| 6 | `fix/register-name-trim` | Nama register di-trim sebelum validasi (bug spasi saja) |
| 7 | `feature/backend-book-stats` | Endpoint statistik `GET /books/stats` untuk dashboard (permintaan mentor) |
| 8 | `fix/book-stats-review` | Perbaikan temuan code review pada endpoint statistik |

PR 1–7 di-merge ke `main` pada 2026-11-14, PR 8 pada 2026-11-15. Branch 8 dibuat dari `main` setelah merge PR 7.

Mulai 2026-11-15, pekerjaan yang masih terbuka dilacak sebagai GitHub Issue (#9–#16); PR yang menyelesaikan issue mencantumkan `Closes #<nomor>`. Temuan audit kode 2026-11-17 dilacak sebagai #22 (hardening backend, branch `fix/backend-hardening`, PR #24) dan #23 (unit test dan CI). Issue #15 (token milik user terhapus, opsi a) dikerjakan di branch `fix/jwt-deleted-user` bersama perbaikan hasil review PR #24 (PR #25). Issue #14 (rate limiting) dikerjakan di branch `feature/auth-rate-limit`. Issue dan PR dapat dibuat dari terminal dengan GitHub CLI (`gh`).

**Prinsip utama:** Panji bertanggung jawab memastikan backend aman, database konsisten, API jelas, dan integrasi frontend-backend berjalan.

## Riwayat Revisi

| Versi | Tanggal | Perubahan |
|---|---|---|
| 1.0 | 2026-11-13 | Baseline awal |
| 1.1 | 2026-11-13 | Sinkronisasi dengan implementasi: endpoint dengan base path dan status, detail schema, struktur backend aktual, environment variable aktual, pemetaan phase, checklist dan DoD, alur Git |
| 1.2 | 2026-11-14 | Status merge PR 1–5, branch perbaikan nama, folder `common/`, jumlah tes; BE-10 statistik koleksi (`GET /books/stats`) untuk dashboard atas permintaan mentor |
| 1.3 | 2026-11-14 | PR 6–7 di-merge; branch perbaikan hasil review; unit test pertama (`books.service.spec.ts`); jumlah tes |
| 1.4 | 2026-11-15 | §9: variabel `OBSERVE_*` dihapus bersama integrasi NestJS Observe (issue #10) |
| 1.5 | 2026-11-15 | §5 dan §10: daftar kategori final dan proteksi JWT `GET /categories` dikonfirmasi (issue #11); jumlah tes e2e |
| 1.6 | 2026-11-17 | Hardening hasil audit kode (issue #22, #16): §8 file baru (`jwt.config.spec.ts`, `prisma-exception.filter.ts`, folder Bruno `06 Hardening`); §9 format `JWT_EXPIRES_IN`; §11 jumlah tes dan item checklist baru; §13 issue #22–#23 |
| 1.7 | 2026-11-17 | Issue #15 (opsi a): §6 token milik user terhapus ditolak; §8 file spec baru; §11 jumlah tes dan checklist token; §13 branch `fix/jwt-deleted-user` |
| 1.8 | 2026-11-17 | Issue #14: §6 rate limiting login/register; §8 `rate-limit.config.ts`; §9 `AUTH_RATE_LIMIT_PER_MINUTE`; §11 jumlah tes dan checklist; §13 branch `feature/auth-rate-limit` |
