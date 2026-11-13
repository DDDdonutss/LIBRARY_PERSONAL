# Product Requirements Document (PRD)
# Personal Library Management

**Version:** 1.1  
**Status:** Final — Baseline Pengembangan (v1.1 menambahkan keputusan implementasi backend; scope tidak berubah)  
**Project Type:** Full-Stack Web Application  
**Architecture:** Monorepo  
**Team Size:** 2 Developers

---

## 1. Project Overview

### 1.1 Product Description
Personal Library Management adalah aplikasi web untuk mengelola koleksi buku pribadi secara digital.

Pengguna dapat membuat akun, login, menambahkan buku, melihat koleksi, memperbarui informasi buku, menghapus buku, mencari buku, serta mengubah status membaca.

Aplikasi mendukung banyak pengguna dengan koleksi yang terisolasi. Setiap pengguna hanya dapat mengakses dan mengelola buku miliknya sendiri.

### 1.2 Problem Statement
Pengelolaan koleksi buku secara manual dapat menyulitkan pengguna dalam:
- Mencatat buku yang dimiliki.
- Mengetahui buku yang ingin dibaca.
- Memantau buku yang sedang dibaca.
- Mengetahui buku yang sudah selesai dibaca.
- Mencari buku tertentu dalam koleksi.

### 1.3 Product Goals
1. Menyediakan aplikasi pengelolaan koleksi buku pribadi.
2. Memudahkan pencatatan dan pencarian buku.
3. Mengelompokkan buku berdasarkan kategori.
4. Memantau status membaca.
5. Menerapkan autentikasi dan otorisasi menggunakan JWT.
6. Menerapkan integrasi frontend, backend, dan database.

## 2. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js |
| Backend | NestJS |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | JWT |
| API | REST API |
| Validation | DTO + class-validator |
| API Testing | Bruno (`backend/bruno/`) + e2e test Vitest/supertest |
| Version Control | Git & GitHub |

Versi yang dipakai backend: NestJS 12, Prisma 7, PostgreSQL 14+ (diuji dengan 18), Node.js 22.12+ (diuji dengan 26).

## 3. Target Users

Pengguna umum yang ingin mengelola koleksi buku pribadi. Sistem mendukung banyak akun. Setiap akun mempunyai koleksi buku yang terpisah.

## 4. Functional Requirements

### 4.1 Authentication

| ID | Requirement | Description |
|---|---|---|
| FR-01 | Register | Pengguna dapat membuat akun |
| FR-02 | Login | Pengguna dapat masuk menggunakan email dan password |
| FR-03 | Current User | Sistem menyediakan informasi pengguna yang sedang login |
| FR-04 | Logout | Frontend menghapus token autentikasi |

### 4.2 Book Management

| ID | Requirement | Description |
|---|---|---|
| FR-05 | Create Book | Pengguna dapat menambahkan buku |
| FR-06 | Read Books | Pengguna dapat melihat daftar buku miliknya |
| FR-07 | Book Detail | Pengguna dapat melihat detail buku |
| FR-08 | Update Book | Pengguna dapat mengubah informasi buku |
| FR-09 | Delete Book | Pengguna dapat menghapus buku |
| FR-10 | Search | Pengguna dapat mencari berdasarkan judul |
| FR-11 | Filter | Pengguna dapat memfilter berdasarkan status dan kategori |
| FR-12 | Pagination | Sistem menampilkan daftar buku secara bertahap |

### 4.3 Global Category

| ID | Requirement | Description |
|---|---|---|
| FR-13 | Get Categories | Pengguna dapat mengambil daftar kategori global |

Ketentuan:
- Kategori bersifat global.
- Semua pengguna menggunakan daftar kategori yang sama.
- Kategori disediakan melalui database seed.
- Pengguna dapat memilih kategori ketika menambahkan atau mengubah buku.
- Pengguna tidak dapat membuat atau menghapus kategori.

Daftar kategori awal masih perlu disepakati tim. Sementara itu, daftar usulan di bawah sudah dipakai sebagai seed awal (`backend/prisma/seed.ts`) dan dapat diganti tanpa mengubah kode lain.

Usulan kategori (dipakai di seed):
- Fiction
- Science
- Technology
- History
- Education
- Other

## 5. Book Status

| Enum | Description |
|---|---|
| WANT_TO_READ | Ingin dibaca |
| READING | Sedang dibaca |
| COMPLETED | Selesai dibaca |

Buku baru yang dibuat tanpa status otomatis berstatus `WANT_TO_READ`.

## 6. Data Requirements

### 6.1 User

| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| name | String | Nama pengguna |
| email | String | Email unik |
| passwordHash | String | Password yang sudah di-hash |
| createdAt | DateTime | Waktu pembuatan |
| updatedAt | DateTime | Waktu perubahan |

### 6.2 Book

| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| title | String | Judul buku |
| author | String | Penulis |
| status | Enum | Status membaca |
| userId | UUID | Pemilik buku |
| categoryId | UUID? | Kategori, nullable |
| createdAt | DateTime | Waktu pembuatan |
| updatedAt | DateTime | Waktu perubahan |

### 6.3 Category

| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| name | String | Nama kategori unik |
| createdAt | DateTime | Waktu pembuatan |
| updatedAt | DateTime | Waktu perubahan |

### 6.4 Perilaku Relasi (keputusan implementasi)

- Bila user dihapus, seluruh bukunya ikut terhapus (`onDelete: Cascade`).
- Bila kategori dihapus, buku yang memakainya tetap ada dengan `categoryId = null` (`onDelete: SetNull`).
- Aplikasi saat ini tidak menyediakan fitur hapus user maupun hapus kategori; aturan ini menjaga integritas data di level database.

## 7. Business Rules

1. Email pengguna harus unik.
2. Password wajib di-hash sebelum disimpan.
3. Pengguna harus login untuk mengakses endpoint buku.
4. Setiap buku harus memiliki satu pemilik.
5. Pengguna hanya boleh mengakses buku miliknya.
6. `userId` harus diambil dari JWT, bukan dipercaya dari request frontend.
7. Kategori digunakan bersama oleh seluruh pengguna.
8. Buku boleh tidak mempunyai kategori.
9. Status buku hanya boleh menggunakan enum yang ditentukan.
10. Setiap perubahan data harus tersimpan di PostgreSQL.

### Logout Rule
Logout menggunakan pendekatan stateless:
- Frontend menghapus token.
- Backend tidak menggunakan token blacklist.
- Backend tidak menggunakan refresh token.
- Token yang sudah diterbitkan tetap berlaku sampai kedaluwarsa atau ditolak berdasarkan kebijakan autentikasi backend.

## 8. Non-Functional Requirements

### 8.1 Security
- Password menggunakan hashing.
- Endpoint privat dilindungi JWT Guard.
- Data buku diisolasi berdasarkan pengguna.
- Environment variables digunakan untuk konfigurasi rahasia.
- File `.env` tidak boleh masuk repository.

### 8.2 Validation
- Email harus memiliki format valid.
- Password minimal 8 karakter.
- Nama maksimal 100 karakter.
- Judul maksimal 200 karakter.
- Penulis maksimal 150 karakter.
- Status harus termasuk enum yang tersedia.
- Pagination harus memiliki batas yang valid.

Rincian yang ditetapkan saat implementasi:

| Aturan | Nilai |
|---|---|
| Password maksimal | 72 karakter **dan** 72 byte UTF-8 (batas bcrypt) |
| Email maksimal | 255 karakter; disimpan dan dicocokkan dalam huruf kecil |
| Judul, penulis | Tidak boleh kosong setelah spasi di awal/akhir dihapus |
| Nama | Tidak boleh kosong (⚠️ nama berisi spasi saja saat ini masih lolos — lihat Implementation Log, Pekerjaan Tersisa) |
| Pagination | `page` ≥ 1 (default 1); `limit` 1–100 (default 10) |
| Search | Pada judul, tidak peka huruf besar/kecil, cocok sebagian |
| `categoryId` | Harus UUID kategori yang ada, atau kosong/`null` |
| Field tidak dikenal | Ditolak (400), termasuk `userId` dari frontend |

### 8.3 Data Persistence
Data harus tersimpan secara persisten pada PostgreSQL.

## 9. API Scope

Base path: `/api/v1` (lokal: `http://localhost:3001/api/v1`)

Detail request, response, dan error setiap endpoint ada di `docs/API-CONTRACT.md`. Endpoint kategori juga membutuhkan login (keputusan implementasi, karena kategori hanya dipakai di form buku).

### Authentication
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

### Books
- `POST /books`
- `GET /books`
- `GET /books/:id`
- `PATCH /books/:id`
- `DELETE /books/:id`

### Categories
- `GET /categories`

### Books Query Parameters
- `page`
- `limit`
- `search`
- `status`
- `categoryId`

## 10. Out of Scope

- Dashboard dan statistik.
- Peminjaman dan pengembalian.
- Denda.
- Admin dan librarian roles.
- Payment gateway.
- Social login.
- Upload PDF dan ebook reader.
- Realtime dan WebSocket.
- Rekomendasi buku.
- Refresh token.
- CRUD kategori oleh pengguna.
- Multi-domain management.

**Workshop note:** Dokumen workshop mencantumkan dashboard sederhana sebagai tambahan pada halaman 7. Keputusan tim saat ini adalah tidak membuat dashboard. Konsekuensi terhadap penilaian perlu dikonfirmasi kepada mentor.

## 11. User Flow

1. Pengguna membuka aplikasi.
2. Pengguna melakukan register jika belum mempunyai akun.
3. Pengguna login.
4. Frontend mengakses endpoint privat menggunakan JWT.
5. Pengguna melihat daftar buku.
6. Pengguna dapat menambahkan buku.
7. Pengguna dapat mengubah atau menghapus buku.
8. Pengguna dapat mencari dan memfilter koleksi.
9. Pengguna dapat memperbarui status membaca.
10. Pengguna logout dan frontend menghapus token.

## 12. Definition of Done

Status per 2026-11-13 (bukti: `docs/IMPLEMENTATION-LOG.md`):

- [x] Register berhasil.
- [x] Login menghasilkan JWT.
- [x] Current user dapat diakses.
- [x] Endpoint privat dilindungi.
- [x] CRUD buku berjalan.
- [x] Kepemilikan data diterapkan.
- [x] Kategori global tersedia.
- [x] Search berjalan.
- [x] Filter berjalan.
- [x] Pagination berjalan.
- [ ] Logout menghapus token. *(frontend)*
- [x] Data tersimpan di PostgreSQL.
- [ ] Frontend terintegrasi dengan backend. *(backend siap; menunggu frontend)*
- [ ] README menjelaskan instalasi dan penggunaan. *(backend selesai; bagian frontend menyusul)*
- [ ] Demo utama dapat dilakukan.

## 13. Team Responsibility

### Panji
- Team Lead
- Backend Developer
- Database Developer
- Integration Developer

### X
- Frontend Developer

Pembagian lebih rinci terdapat dalam `JOBDESK-PANJI.md` dan dokumen jobdesk frontend yang akan dibuat kemudian.

## 14. Dokumen Terkait

| Dokumen | Isi |
|---|---|
| `docs/API-CONTRACT.md` | Kontrak REST API (request, response, error) |
| `docs/IMPLEMENTATION-LOG.md` | Riwayat implementasi, verifikasi, dan keputusan teknis |
| `docs/JOBDESK-PANJI.md` | Tanggung jawab backend, database, dan integrasi |
| `backend/README.md` | Instalasi dan penggunaan backend |

## 15. Riwayat Revisi

| Versi | Tanggal | Perubahan |
|---|---|---|
| 1.0 | 2026-11-13 | Baseline awal |
| 1.1 | 2026-11-13 | Menambahkan keputusan implementasi backend: versi stack, kategori seed, default status, perilaku relasi (§6.4), rincian validasi/pagination/search (§8.2), base URL lokal dan proteksi endpoint kategori (§9), status Definition of Done. Scope fitur tidak berubah |
