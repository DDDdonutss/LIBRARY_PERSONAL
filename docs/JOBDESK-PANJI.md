# Jobdesk Panji
# Backend, Database & Integration Developer

**Project:** Personal Library Management  
**Version:** 1.1  
**Status:** Final — Baseline Tanggung Jawab (v1.1 menyinkronkan dengan hasil implementasi backend)  
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
| Vitest + supertest | E2E test otomatis (`backend/test/`) |
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

Semua endpoint buku memerlukan autentikasi. `GET /categories` juga memerlukan autentikasi (keputusan implementasi; dapat dibuka bila frontend membutuhkannya sebelum login).

## 6. Security Requirements

### Authentication
- Gunakan JWT untuk autentikasi.
- Password harus di-hash.
- Jangan mengembalikan password atau passwordHash.
- Endpoint privat harus menggunakan JWT Guard.

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
├── bruno/                       # Koleksi Bruno: 01 Auth, 02 Categories, 03 Books, 04 Ownership
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
│   │   ├── auth.module.ts
│   │   ├── jwt.config.ts        # Validasi JWT_SECRET, JWT_EXPIRES_IN
│   │   ├── dto/                 # register.dto.ts, login.dto.ts
│   │   ├── strategies/          # jwt.strategy.ts
│   │   ├── guards/              # jwt-auth.guard.ts
│   │   ├── decorators/          # current-user.decorator.ts
│   │   └── interfaces/          # authenticated-user.interface.ts
│   ├── books/
│   │   ├── books.controller.ts
│   │   ├── books.service.ts
│   │   ├── books.module.ts
│   │   └── dto/                 # create-book, update-book, query-books
│   ├── categories/
│   │   ├── categories.controller.ts
│   │   ├── categories.service.ts
│   │   └── categories.module.ts
│   ├── prisma/
│   │   ├── prisma.service.ts
│   │   └── prisma.module.ts
│   ├── generated/prisma/        # Prisma Client hasil generate (tidak di-commit)
│   ├── app.module.ts
│   ├── app.setup.ts             # Prefix /api/v1, CORS, ValidationPipe
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
| `JWT_EXPIRES_IN` | Tidak | `1d` | Masa berlaku token |
| `PORT` | Tidak | `3001` | Port backend |
| `CORS_ORIGIN` | Tidak | `http://localhost:3000` | Origin frontend, pisahkan dengan koma bila lebih dari satu |
| `OBSERVE_APP_KEY`, `OBSERVE_APP_SECRET` | Tidak | — | NestJS Observe (opsional) |

Ketentuan:
- `.env` tidak boleh di-commit. ✅ Ter-ignore Git dan tidak pernah ada di riwayat commit.
- `.env.example` harus disediakan. ✅ `backend/.env.example` (satu file per aplikasi; frontend akan memiliki miliknya sendiri).
- Jangan menaruh credential asli di GitHub. ✅ Riwayat sudah diaudit sebelum push.
- Gunakan secret yang aman di lingkungan deployment.

## 10. Implementation Phases

### Status dan Pemetaan

Penomoran phase di dokumen ini berbeda dengan `MASTER-PROMPT.md` (Phase 0–9; dokumen internal, tidak disertakan di repository). Pemetaan dan status per 2026-11-13:

| Phase (Jobdesk) | Phase (MASTER-PROMPT) | Status |
|---|---|---|
| 1 — Project Preparation | 0, 1 | ✅ Selesai |
| 2 — Backend Setup | 2 | ✅ Selesai |
| 3 — Database | 3 | ✅ Selesai |
| 4 — Authentication | 4 | ✅ Selesai |
| 5 — Book Management | 5 | ✅ Selesai |
| 6 — Category | 6 | ✅ Selesai (daftar kategori menunggu konfirmasi tim) |
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

Semua item diverifikasi dengan koleksi Bruno (`backend/bruno/`, 60 request / 91 tes) dan e2e test (`npm run test:e2e`, 26 tes). Bukti per item ada di `docs/IMPLEMENTATION-LOG.md`.

### Authentication
- [x] Register berhasil.
- [x] Email duplikat ditolak. *(termasuk beda huruf besar/kecil dan request bersamaan)*
- [x] Password di-hash. *(bcrypt cost 12, dicek di database)*
- [x] Login berhasil.
- [x] Password salah ditolak.
- [x] Token invalid ditolak. *(tanpa token, rusak, tanda tangan palsu, kedaluwarsa)*
- [x] Current user berjalan.

### Books
- [x] Create berhasil.
- [x] Get list berhasil.
- [x] Get detail berhasil.
- [x] Update berhasil.
- [x] Delete berhasil.
- [x] Search berhasil.
- [x] Filter berhasil.
- [x] Pagination berhasil.

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

**Prinsip utama:** Panji bertanggung jawab memastikan backend aman, database konsisten, API jelas, dan integrasi frontend-backend berjalan.

## Riwayat Revisi

| Versi | Tanggal | Perubahan |
|---|---|---|
| 1.0 | 2026-11-13 | Baseline awal |
| 1.1 | 2026-11-13 | Sinkronisasi dengan implementasi: endpoint dengan base path dan status, detail schema, struktur backend aktual, environment variable aktual, pemetaan phase, checklist dan DoD, alur Git |
