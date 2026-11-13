# Implementation Log
# Personal Library Management — Backend

Dokumen ini mencatat riwayat implementasi backend: apa yang sudah dibuat, apa yang sudah diverifikasi, dan apa yang belum. Entri disusun kronologis; status terkini dirangkum di bagian pertama.

**Repository:** https://github.com/DDDdonutss/PERSONAL_LIBRARY01
**Terakhir diperbarui:** 2026-11-13

## Legenda Status

Setiap pekerjaan dinilai pada empat tingkat yang **berbeda**:

| Kode | Arti | Bukti yang dibutuhkan |
|---|---|---|
| **[W] Written** | Kode/konfigurasi sudah ditulis | File ada di repository |
| **[C] Compiled** | Lolos kompilasi TypeScript / validasi tool | `tsc`, `prisma validate`, lint |
| **[T] API Tested** | Endpoint diuji dan hasilnya sesuai | Request Bruno/e2e + data di database |
| **[S] Security Reviewed** | Sudah direview dari sisi keamanan dan isu ditutup | Catatan review + perbaikan diverifikasi |

Simbol: ✅ selesai · ⚠️ selesai dengan catatan · ❌ belum · — tidak berlaku

---

## Ringkasan Status Terkini

### Progres Phase (MASTER-PROMPT §6)

| Phase | Status |
|---|---|
| 0 — Project Inspection | ✅ Completed |
| 1 — Repository Preparation | ✅ Completed (`API-CONTRACT.md`, `.env.example`, remote GitHub). `frontend/` tanggung jawab Frontend Developer |
| 2 — Backend Setup | ✅ Completed |
| 3 — Database Design | ✅ Completed (schema, migration, seed kategori) |
| 4 — Authentication | ✅ Completed (register, login, JWT strategy/guard, `/auth/me`) |
| 5 — Book Management | ✅ Completed (CRUD, search, filter, pagination, ownership) |
| 6 — Category API | ✅ Completed — daftar kategori menunggu konfirmasi tim |
| 7 — API Testing | ✅ Completed (Bruno 60 request / 91 tes; e2e 26 tes) |
| 8 — Frontend Integration | ⏳ Backend siap (CORS, API Contract); menunggu frontend |
| 9 — Finalization | ⏳ In Progress (README dan dokumen disinkronkan; keputusan Observe, PR merge, demo belum) |

### Endpoint

| Endpoint | W | C | T | S |
|---|---|---|---|---|
| `POST /api/v1/auth/register` | ✅ | ✅ | ✅ | ✅ |
| `POST /api/v1/auth/login` | ✅ | ✅ | ✅ | ✅ |
| `GET /api/v1/auth/me` 🔒 | ✅ | ✅ | ✅ | ✅ |
| `GET /api/v1/categories` 🔒 | ✅ | ✅ | ✅ | ✅ |
| `POST /api/v1/books` 🔒 | ✅ | ✅ | ✅ | ✅ |
| `GET /api/v1/books` 🔒 (search, filter, pagination) | ✅ | ✅ | ✅ | ✅ |
| `GET /api/v1/books/:id` 🔒 | ✅ | ✅ | ✅ | ✅ |
| `PATCH /api/v1/books/:id` 🔒 | ✅ | ✅ | ✅ | ✅ |
| `DELETE /api/v1/books/:id` 🔒 | ✅ | ✅ | ✅ | ✅ |

### Branch dan Pull Request

| Urutan | Branch | Commit teratas | Status |
|---|---|---|---|
| 1 | `feature/backend-setup` | `c199414` | Di-push; PR ke `main` belum di-merge |
| 2 | `feature/backend-auth` | `2fd9e63` | Di-push; PR menunggu PR 1 |
| 3 | `feature/backend-categories` | `0a64742` | Di-push; PR menunggu PR 2 |
| 4 | `feature/backend-books` | `e672bb2` | Di-push; PR menunggu PR 3 |
| 5 | `docs/sync-project-docs` | — | Sinkronisasi dokumen; PR setelah PR 4 |

Branch dibuat bertumpuk (setiap branch dari branch sebelumnya). Merge harus berurutan dengan **"Create a merge commit"** — bukan squash/rebase — agar PR berikutnya hanya menampilkan commit miliknya.

---

## 2026-11-13 — Inisialisasi Proyek

**Pelaksana:** Panji
**Commit:** `8743b1e` (struktur proyek & dokumentasi), `a2b5b37` (inisialisasi NestJS)

- Struktur monorepo dan dokumen `PRD.md`, `JOBDESK-PANJI.md`, `MASTER-PROMPT.md`.
- NestJS 12 (ESM, Vitest, oxlint) di `backend/`.

---

## 2026-11-13 — Setup Database, Prisma, dan Register

**Pelaksana:** Panji
**Commit:**
- `c199414` `chore(backend): set up Prisma database foundation` — branch `feature/backend-setup`
- `d63e9eb` `feat(auth): implement user registration` — branch `feature/backend-auth` (dibuat dari `feature/backend-setup`)

Saat entri ini dibuat, kedua commit masih lokal; keduanya di-push ke GitHub pada entri "Remote GitHub dan Push".

### Dikerjakan

| Pekerjaan | File | W | C | T | S |
|---|---|---|---|---|---|
| Dependensi (Prisma 7.10.1, adapter-pg, @nestjs/jwt, passport-jwt, bcrypt, class-validator) | `backend/package.json` | ✅ | ✅ | — | — |
| Prisma config | `backend/prisma7.config.ts` | ✅ | ✅ | — | — |
| Prisma schema (User, Book, Category, enum `BookStatus`) | `backend/prisma/schema.prisma` | ✅ | ✅ | — | ✅ |
| Initial migration `20261113060551_init` | `backend/prisma/migrations/` | ✅ | ✅ | — | ✅ |
| PrismaService + PrismaModule (global) | `backend/src/prisma/` | ✅ | ✅ | ✅ ³ | ✅ |
| JwtModule | `backend/src/auth/auth.module.ts` | ✅ | ✅ | ✅ ² | ✅ ¹ |
| RegisterDto, LoginDto | `backend/src/auth/dto/` | ✅ | ✅ | ✅ ² | ✅ |
| Global ValidationPipe | `backend/src/main.ts` → kini `src/app.setup.ts` | ✅ | ✅ | ✅ ² | ✅ |
| `AuthService.register()` + `POST /api/v1/auth/register` | `backend/src/auth/` | ✅ | ✅ | ✅ ² | ✅ ¹ |
| `*.tsbuildinfo` dan Prisma client hasil generate di-ignore | `backend/.gitignore` | ✅ | — | — | — |

¹ Diperbarui setelah perbaikan isu #1–#5 (lihat entri "Stabilize & Verify Register").
² Status T diperbarui setelah uji Bruno lengkap (lihat entri "Register Testing" dan "Login & JWT").
³ Teruji tidak langsung oleh seluruh uji Bruno dan e2e yang membaca/menulis database.

### Verifikasi kondisi awal (sebelum stabilisasi)

- `tsc --noEmit -p tsconfig.build.json`: **lolos**.
- `npm run lint` (oxlint): **lolos**.
- `vitest run` (unit test bawaan): **1/1 lolos**.
- `prisma validate`: **schema valid**.
- `prisma migrate status`: **1 migration, database up to date** (`personal_library_db` @ localhost:5432).
- `.env` ter-ignore Git (dicek dengan `git check-ignore`).
- Isi database saat verifikasi: `User` 0, `Category` 0, `Book` 0 baris — register belum pernah teruji end-to-end (kemudian terverifikasi pada entri "Register Testing").

### Hasil Security Review

| # | Isu | Lokasi | Status |
|---|---|---|---|
| 1 | Password > 72 byte melempar 409 (`ConflictException`), seharusnya 400 | `auth.service.ts` | ✅ Closed — `23b46d2` |
| 2 | Race condition register: duplikat bersamaan menghasilkan error Prisma `P2002` → 500, seharusnya 409 | `auth.service.ts` | ✅ Closed — `23b46d2` (diuji runtime: 8 request bersamaan → 1× 201, 7× 409, 0 error 500) |
| 3 | `JWT_SECRET` tidak divalidasi saat startup; `expiresIn` hard-coded `'1d'`, belum memakai `JWT_EXPIRES_IN` | `auth.module.ts` | ✅ Closed — `3d86dfa` |
| 4 | Base path `/api/v1` belum diterapkan (endpoint saat itu `/auth/register`) | `main.ts` | ✅ Closed — `3d86dfa` |
| 5 | Port default 3000, dokumen menetapkan 3001; `PORT` tidak ada di `.env` | `main.ts`, `.env` | ✅ Closed — `3d86dfa` (default 3001; `PORT` di `.env` opsional) |
| 6 | `.env.example` belum ada | `backend/` | ✅ Closed — `1331099` |
| 7 | Tidak ada script `prisma generate` — clone baru gagal build karena client hasil generate di-ignore | `package.json` | ✅ Closed — `1331099` (diuji: simulasi clone baru → `npm ci` → build berhasil) |
| 8 | ObserveModule (telemetri eksternal, fallback secret placeholder) | `app.module.ts` | ⏸️ Dipertahankan sementara (keputusan Team Lead). Dinonaktifkan saat test (`3aba2cf`). Server lokal aktif mengirim telemetri. Evaluasi saat finalisasi |
| 9 | BOM (byte order mark) di 6 file dan line ending CRLF | `main.ts`, `src/auth/**` | ✅ Closed — BOM dihapus (`3d86dfa`, `d10892e`); CRLF dinormalisasi Git saat commit |

---

## 2026-11-13 — Stabilize & Verify Register

**Pelaksana:** Panji
**Branch:** `feature/backend-auth`
**Commit:**
- `23b46d2` `fix(auth): return correct status codes for registration errors`
- `3d86dfa` `feat(backend): add /api/v1 prefix and validate JWT config at startup`
- `d10892e` `style(backend): remove BOM and stray blank lines`

### Perubahan

| File | Perubahan |
|---|---|
| `src/auth/auth.service.ts` | Password > 72 byte → 400, dicek sebelum query database; error Prisma `P2002` saat `create` → 409 |
| `src/auth/auth.module.ts` | `JwtModule.registerAsync`: aplikasi gagal start bila `JWT_SECRET` kosong atau < 32 karakter; `expiresIn` dari `JWT_EXPIRES_IN` (default `1d`) |
| `src/main.ts` | Global prefix `api/v1`; default port 3001 (prefix kemudian dipindah ke `src/app.setup.ts`, `2fcaa53`) |
| `src/app.module.ts`, `auth.controller.ts`, `dto/*.ts` | Hanya format (BOM, baris kosong, Prettier) — tanpa perubahan logika |

### Verifikasi

| Uji | Hasil |
|---|---|
| `tsc`, oxlint, vitest (1/1), Prettier check | ✅ Lolos |
| Start dengan `JWT_SECRET` kosong / pendek | ✅ Gagal start: `JWT_SECRET must be set and at least 32 characters long` |
| Start dengan `.env` normal | ✅ Route `POST /api/v1/auth/register`, port 3001 |
| `POST /auth/register` (path lama) | ✅ 404 |
| Email invalid / password < 8 | ✅ 400 |
| Field tambahan `userId` | ✅ 400 (`property userId should not exist`) |
| Password 40× `é` (40 karakter, 80 byte) | ✅ 400 |
| Tabel `User` setelah uji | ✅ Tetap 0 baris (semua uji ditolak sebelum menulis database) |

Register sukses (201), email duplikat (409), dan jalur `P2002` diverifikasi pada entri "Register Testing".

### Catatan

- Path di luar `/api/v1` mengembalikan 404 berupa HTML bawaan Express, bukan JSON. Tidak berdampak selama frontend memakai base URL `http://localhost:3001/api/v1`; dicatat di `docs/API-CONTRACT.md` §1.1.

---

## 2026-11-13 — `.env.example` dan Script Prisma Generate

**Pelaksana:** Panji
**Branch:** `feature/backend-auth`
**Commit:** `1331099` `chore(backend): add .env.example and prisma generate scripts`

| Pekerjaan | W | C | T | S |
|---|---|---|---|---|
| `backend/.env.example` (placeholder; `JWT_SECRET="CHANGE_ME"` sengaja < 32 karakter agar aplikasi menolak start) | ✅ | — | ✅ | ✅ |
| Script `postinstall` dan `prisma:generate` (`prisma generate`) | ✅ | ✅ | ✅ | — |

Verifikasi: simulasi clone baru (hanya file ter-track Git, tanpa `.env`/`node_modules`/`src/generated`) → `npm ci` otomatis men-generate client → `nest build` berhasil; start dengan `.env` hasil salinan `.env.example` ditolak karena `JWT_SECRET` placeholder.

---

## 2026-11-13 — Register Testing

**Pelaksana:** Panji
**Branch:** `feature/backend-auth`
**Commit:** `99f3d56` `test(api): add Bruno collection for registration`

Koleksi Bruno dibuat di `backend/bruno/` (environment `local`, base URL `http://localhost:3001/api/v1`). Email user uji dibuat unik per run (`usera.<timestamp>@example.com`), sehingga koleksi bisa dijalankan berulang.

| Uji | Hasil |
|---|---|
| Register sukses | ✅ 201, `user` tanpa `passwordHash`, `accessToken` ada |
| Email duplikat | ✅ 409 |
| Email duplikat beda huruf besar/kecil | ✅ 409 |
| Input invalid | ✅ 400, pesan untuk `name`, `email`, `password` |
| Password 80 byte | ✅ 400 |
| Field tidak dikenal (`userId`) | ✅ 400 |
| 8 request bersamaan dengan email sama (curl) | ✅ 1× 201, 7× 409, 0 error 500 di log server |
| `passwordHash` di database | ✅ Diawali `$2b$12$`, panjang 60 (bcrypt cost 12) |

**Catatan data:** uji ini membuat user nyata di database lokal (`usera.<timestamp>@example.com`, `race.<timestamp>@example.com`). Data tersebut sengaja dibiarkan; tidak ada data yang dihapus.

---

## 2026-11-13 — Login & JWT

**Pelaksana:** Panji
**Branch:** `feature/backend-auth`
**Commit:**
- `e5256a1` `feat(auth): add login, JWT guard and current user endpoint`
- `d3893c8` `feat(backend): enable CORS for the frontend origin`
- `d827a12` `test(api): add Bruno tests for login and current user`
- `2fd9e63` `docs: add API contract for auth and record auth progress`

### Dikerjakan

| Pekerjaan | File | W | C | T | S |
|---|---|---|---|---|---|
| `POST /api/v1/auth/login` (200; 401 generik untuk email/password salah) | `auth.service.ts`, `auth.controller.ts` | ✅ | ✅ | ✅ | ✅ |
| `JwtStrategy` (passport-jwt, Bearer token) | `strategies/jwt.strategy.ts` | ✅ | ✅ | ✅ | ✅ |
| `JwtAuthGuard` | `guards/jwt-auth.guard.ts` | ✅ | ✅ | ✅ | ✅ |
| Decorator `@CurrentUser()` | `decorators/current-user.decorator.ts` | ✅ | ✅ | ✅ | — |
| `GET /api/v1/auth/me` 🔒 | `auth.controller.ts` | ✅ | ✅ | ✅ | ✅ |
| Konfigurasi JWT bersama (`getJwtSecret`, `getJwtExpiresIn`) | `jwt.config.ts` | ✅ | ✅ | ✅ | ✅ |
| CORS (`CORS_ORIGIN`, default `http://localhost:3000`) | `main.ts` → kini `app.setup.ts`; `.env.example` | ✅ | ✅ | ✅ | ✅ |
| Draf awal `docs/API-CONTRACT.md` (konvensi umum + Auth) | `docs/` | ✅ | — | — | — |

### Verifikasi

- `tsc`, oxlint, vitest, Prettier: lolos.
- Bruno `01 Auth`: **15 request, 23/23 tes lolos** (register, login sukses/gagal/beda huruf/invalid, `/auth/me` sukses, tanpa token, token rusak, token bertanda tangan palsu).
- Uji manual tambahan (curl, token dibuat lokal dan tidak disimpan): token kedaluwarsa → 401; token valid untuk user yang tidak ada di database → 401.
- CORS: preflight dari `http://localhost:3000` → `Access-Control-Allow-Origin` dikirim; dari origin lain → tidak dikirim (diblokir browser).

### Keputusan Desain

- Register dan login mengembalikan bentuk yang sama: `{ message, user, accessToken }`.
- Login mengembalikan 200 (bukan 201 bawaan POST) karena tidak membuat resource.
- `JwtStrategy.validate()` tidak query database (stateless). `/auth/me` tetap memeriksa database dan mengembalikan 401 bila user sudah tidak ada.

### Risiko yang Diterima

- **Timing login:** email tidak terdaftar dijawab ±5 ms, password salah ±400 ms (bcrypt), sehingga keberadaan email bisa ditebak dari waktu respons. Tidak ditangani karena register sudah mengungkap hal yang sama lewat 409 (sesuai PRD: email unik).
- **Belum ada rate limiting** pada login/register. Di luar scope PRD.

---

## 2026-11-13 — Category API

**Pelaksana:** Panji
**Branch:** `feature/backend-categories` (dibuat dari `feature/backend-auth`)
**Commit:**
- `88409d0` `chore(db): add global category seed`
- `e602b86` `feat(categories): add global category endpoint`
- `727ff1a` `test(api): add Bruno tests for categories`
- `0a64742` `docs: document category API and record progress`

### Dikerjakan

| Pekerjaan | File | W | C | T | S |
|---|---|---|---|---|---|
| Seed kategori global (idempotent, `upsert` by name) | `prisma/seed.ts`, `prisma7.config.ts` | ✅ | ✅ | ✅ | ✅ |
| Script `db:seed` dan `db:migrate` | `package.json` | ✅ | — | ✅ | — |
| Dependensi dev `tsx` (menjalankan `seed.ts`) | `package.json` | ✅ | — | ✅ | — |
| `GET /api/v1/categories` 🔒 | `src/categories/` | ✅ | ✅ | ✅ | ✅ |
| `CategoriesService.ensureExists()` (validasi `categoryId` untuk Books) | `categories.service.ts` | ✅ | ✅ | ✅ ⁴ | ✅ |

⁴ Diuji lewat endpoint Books (`categoryId` tidak ada → 400).

### Verifikasi

- `tsc` (termasuk `prisma/seed.ts`), oxlint, Prettier: lolos.
- `npm run db:seed` dijalankan **dua kali**: total tetap 6 kategori (tidak duplikat). Isi: Education, Fiction, History, Other, Science, Technology.
- Bruno (`01 Auth` + `02 Categories`): **19 request, 30/30 tes lolos** — list kategori, tanpa token → 401, user B mendapat daftar yang identik dengan user A.

### Keputusan Desain

- **Daftar kategori** memakai usulan PRD §4.3 karena belum ada kesepakatan lain. Mudah diganti di `prisma/seed.ts`. ⚠️ Perlu konfirmasi tim.
- **`GET /categories` dilindungi JWT.** Kategori hanya dibutuhkan pada form buku (setelah login). Bila frontend membutuhkannya sebelum login, guard cukup dihapus dari controller.
- `categoryId` yang tidak ada → **400** (`Kategori tidak ditemukan`), bukan 404, karena kesalahannya ada pada input buku.
- `tsx` dipilih sesuai dokumentasi Prisma 7. Node 26 tidak bisa menjalankan `seed.ts` langsung karena client hasil generate meng-import `./x.js` yang sebenarnya file `.ts`.
- Script `postinstall` milik `esbuild` (dependensi `tsx`) diblokir kebijakan `allowScripts` npm. Tidak ditambahkan ke allowlist karena `tsx` terbukti berfungsi tanpanya.

---

## 2026-11-13 — Book Management

**Pelaksana:** Panji
**Branch:** `feature/backend-books` (dibuat dari `feature/backend-categories`)
**Commit:**
- `153469f` `feat(books): add book CRUD with search, filters and pagination`
- `9850c76` `test(api): add Bruno tests for books and data ownership`
- `3f1c7b9` `docs: document books API and record book management progress`

### Dikerjakan

| Pekerjaan | File | W | C | T | S |
|---|---|---|---|---|---|
| `POST /api/v1/books` 🔒 | `src/books/` | ✅ | ✅ | ✅ | ✅ |
| `GET /api/v1/books` 🔒 + search judul, filter status/kategori, pagination | `books.service.ts`, `dto/query-books.dto.ts` | ✅ | ✅ | ✅ | ✅ |
| `GET /api/v1/books/:id` 🔒 | `books.controller.ts` | ✅ | ✅ | ✅ | ✅ |
| `PATCH /api/v1/books/:id` 🔒 | `books.service.ts`, `dto/update-book.dto.ts` | ✅ | ✅ | ✅ | ✅ |
| `DELETE /api/v1/books/:id` 🔒 | `books.service.ts` | ✅ | ✅ | ✅ | ✅ |
| Validasi `categoryId` (format UUID + harus ada) | `dto/*.ts`, `CategoriesService.ensureExists()` | ✅ | ✅ | ✅ | ✅ |
| Ownership di setiap query (`where: { id, userId }`) | `books.service.ts` | ✅ | ✅ | ✅ | ✅ |

### Verifikasi

- `tsc`, oxlint, Prettier: lolos.
- Bruno seluruh koleksi: **60 request, 91/91 tes lolos**, dijalankan **dua kali berturut-turut** (koleksi dapat diulang). Log server: 0 error.
  - `03 Books` (33 request): create minimal/lengkap, trim judul, validasi (judul kosong/spasi/>200, penulis >150, status salah, `categoryId` bukan UUID / tidak ada, `userId` di body), list default, pagination, halaman melebihi batas, search tidak peka huruf besar/kecil, filter status, filter kategori, filter gabungan, `limit` > 100, query invalid, detail, ID bukan UUID, 404, update sebagian, pasang/hapus kategori, `title: null` ditolak, body kosong ditolak, delete, detail setelah delete, delete ulang.
  - `04 Ownership` (8 request): user B tidak melihat buku user A di list maupun search; user B mendapat 404 saat membaca, mengubah, dan menghapus buku user A; buku user A tetap utuh; user A tidak melihat buku user B.

### Keputusan Desain

- **Ownership di query database:** `findFirst`/`update`/`delete` memakai `where: { id, userId }` (fitur `extendedWhereUnique` Prisma), sesuai MASTER-PROMPT §8. Buku user lain → **404**, bukan 403, agar keberadaannya tidak bocor.
- **`userId` tidak ada di response** dan ditolak bila dikirim di body (400).
- **Pagination:** default `page=1`, `limit=10`, maksimum `limit=100`. Response `{ data, meta: { page, limit, total, totalPages } }`. Data dan total diambil dalam satu `$transaction`.
- **Urutan:** terbaru dibuat lebih dulu (`createdAt desc`), dengan `id` sebagai pengurut kedua agar stabil antarhalaman.
- **Search:** judul, `contains` + `mode: 'insensitive'` (PostgreSQL `ILIKE`).
- **Update:** `title`/`author`/`status` boleh tidak dikirim tetapi tidak boleh `null` (memakai `@ValidateIf`, bukan `@IsOptional`, karena `@IsOptional` meloloskan `null` dan akan menyebabkan error 500 dari database). `categoryId: null` menghapus kategori. Body kosong → 400.
- **ID di path** divalidasi `ParseUUIDPipe` sehingga ID bukan UUID ditolak 400 sebelum mencapai database.
- **DELETE** mengembalikan `200 { message, id }` (bukan 204) agar konsisten dengan endpoint lain yang selalu mengembalikan JSON.

### Catatan Data Uji

Setiap run Bruno membuat 2 user baru (`usera.<timestamp>@example.com`, `userb.<timestamp>@example.com`) dan beberapa buku di database lokal. Data ini sengaja dibiarkan (tidak ada penghapusan otomatis).

---

## 2026-11-13 — README Backend

**Branch:** `feature/backend-books`
**Commit:** `2ee506b` `docs(backend): replace scaffold README with setup and usage guide`, `698b8ae` `docs: record backend README in implementation log`

README bawaan scaffold NestJS diganti dengan panduan: prasyarat, instalasi (env, database, migration, seed), daftar script, endpoint, cara menjalankan Bruno, struktur proyek, aturan keamanan. Langkah yang terdokumentasi diverifikasi: `npm run db:migrate` (tidak ada migration tertunda), `npm run db:seed`, dan aplikasi tetap start tanpa variabel `OBSERVE_*`.

---

## 2026-11-13 — Perbaikan E2E Test dan Penghapusan Endpoint Hello World

**Pelaksana:** Panji
**Branch:** `feature/backend-books`
**Commit:**
- `2fcaa53` `refactor(backend): extract global app configuration into configureApp`
- `6b60c76` `refactor(backend): remove scaffold Hello World endpoint`
- `3aba2cf` `test(e2e): replace scaffold test with end-to-end API suite`
- `e672bb2` `docs: document e2e tests and record hello world removal`

### Penyebab e2e lama gagal

1. Vitest tidak memuat `.env` → `JWT_SECRET` kosong → aplikasi menolak start.
2. Test membuat aplikasi tanpa konfigurasi `main.ts` (prefix `/api/v1`, ValidationPipe, CORS), sehingga yang diuji berbeda dengan yang berjalan.
3. Test masih mengharapkan `GET /` → "Hello World!".

### Perubahan

| Pekerjaan | File | W | C | T | S |
|---|---|---|---|---|---|
| `configureApp()`: prefix, CORS, ValidationPipe dalam satu fungsi, dipakai `main.ts` dan e2e | `src/app.setup.ts`, `src/main.ts` | ✅ | ✅ | ✅ | — |
| Hapus `AppController`, `AppService`, dan unit test-nya (`GET /api/v1` kini 404 JSON) | `src/app.*`, `src/app.module.ts` | ✅ | ✅ | ✅ | — |
| E2E suite baru: 26 test (auth, kategori, buku, ownership); membersihkan hanya user yang dibuatnya | `test/app.e2e-spec.ts` | ✅ | ✅ | ✅ | ✅ |
| `vitest.config.e2e.ts` memuat `.env` (`loadEnv` dari Vite), timeout 30 detik | `vitest.config.e2e.ts` | ✅ | ✅ | ✅ | — |
| `passWithNoTests` agar `npm test` tidak gagal saat belum ada unit test | `vitest.config.ts` | ✅ | ✅ | ✅ | — |
| ObserveModule `enabled: NODE_ENV !== 'test'` — tidak mengirim telemetri saat test | `src/app.module.ts` | ✅ | ✅ | ✅ | ✅ |

### Verifikasi

- `tsc` (seluruh proyek termasuk test), oxlint: lolos. `npm test`: exit 0 (belum ada unit test).
- `npm run test:e2e`: **26/26 lolos**, dijalankan dua kali; setelah run, 0 user `e2e.*` tersisa di database.
- Nilai `.env` hasil `loadEnv` Vite dibandingkan dengan pembacaan Node `--env-file`: keempat variabel identik.
- Server sungguhan setelah refactor: 9 route terdaftar (Hello World hilang), `GET /api/v1` → 404 JSON, Bruno **60 request, 91/91 lolos**, ObserveModule tetap aktif.

### Temuan terkait ObserveModule (isu #8)

- Pada server sungguhan, Observe **terhubung** dan mengirim telemetri ke `observe.nestjs.com` (log: "collector accepted this app's first batch") — kredensial di `.env` valid.
- Pada e2e (tanpa `ObserveInstrument`), collector menolak dengan 401. Penyebab pastinya tidak diketahui; diatasi dengan menonaktifkan Observe saat test, yang memang dianjurkan dokumentasi paket. ObserveModule tetap dipertahankan sesuai keputusan Team Lead.

---

## 2026-11-13 — Uji Ulang Bruno `01 Auth`

Dijalankan ulang terhadap build `e672bb2` atas permintaan Team Lead: **15 request, 23/23 tes lolos**, 0 error di log server. Tidak ada perubahan status.

---

## 2026-11-13 — Remote GitHub dan Push

**Repository:** https://github.com/DDDdonutss/PERSONAL_LIBRARY01

### Kronologi

1. Repository pertama (`Personal-Library-Management-Docs`) ternyata berisi commit "Initial commit" dari template GitHub (README dan `.gitignore` untuk bahasa Ada) dengan riwayat yang tidak terhubung. Team Lead memilih membuat ulang repository kosong (opsi C) daripada merge atau force-push.
2. Sebelum push ke repository baru, ditemukan bekas perintah *quick setup* GitHub yang dijalankan di dalam `backend/`:
   - baris `# Personal_Library` ditambahkan ke `backend/README.md` dalam encoding UTF-16 (file menjadi biner bagi Git);
   - repository Git bersarang `backend/.git` dengan satu commit README yang sudah ter-push ke repository lain (`DDDdonutss/Personal_Library`). Tidak ada `.env` atau secret di commit tersebut.
3. Dengan persetujuan Team Lead: `backend/.git` dihapus dan `backend/README.md` dipulihkan ke versi ter-commit. Repo utama tetap utuh (dicek lewat reflog), `backend/` kembali menjadi folder biasa tanpa embedded repo.
4. Audit sebelum push: tidak ada `.env` di commit mana pun; kredensial di riwayat hanya placeholder; 0 attribution AI di pesan commit dan dokumen.
5. Push (`git push -u`): `main`, `feature/backend-setup`, `feature/backend-auth`, `feature/backend-categories`, `feature/backend-books`. Hash di remote sama dengan lokal.

### Catatan

- `gh` CLI tidak terpasang; Pull Request dibuat Team Lead melalui web GitHub.
- Repository `DDDdonutss/Personal_Library` tidak dipakai dan dapat dihapus.

---

## 2026-11-13 — Sinkronisasi Dokumen

**Branch:** `docs/sync-project-docs` (dibuat dari `feature/backend-books`)

Seluruh dokumen kecuali `MASTER-PROMPT.md` disesuaikan dengan hasil implementasi:

| Dokumen | Perubahan |
|---|---|
| `docs/PRD.md` | v1.1: status implementasi, keputusan yang sudah diambil (kategori, batas validasi, pagination, search), Definition of Done diperbarui, riwayat revisi |
| `docs/JOBDESK-PANJI.md` | v1.1: endpoint dengan base path, struktur backend aktual, environment variable aktual, status phase, checklist pengujian dan DoD dicentang sesuai bukti |
| `docs/API-CONTRACT.md` | Catatan pengujian (Bruno + e2e), perilaku 404 di `/api/v1`, riwayat perubahan |
| `docs/IMPLEMENTATION-LOG.md` | Disusun ulang: ringkasan status di awal, status usang diperbarui, entri push dan sinkronisasi dokumen |
| `README.md` (root) | Status proyek, struktur, quick start, daftar dokumen, alur kontribusi |
| `backend/README.md` | Langkah clone repository dan catatan perintah untuk Windows |

### Perbedaan antardokumen yang diselesaikan

| # | Perbedaan semula | Penyelesaian |
|---|---|---|
| 1 | Base path: PRD/MASTER memakai `/api/v1`, JOBDESK menulis path tanpa prefix | JOBDESK memakai path lengkap; API Contract menetapkan base URL |
| 2 | Port 3001 hanya disebut di JOBDESK | Diterapkan sebagai default; tercatat di PRD, API Contract, README |
| 3 | Urutan phase JOBDESK (1–8) berbeda dengan MASTER (0–9); Category dikerjakan sebelum Books | JOBDESK mencantumkan pemetaan ke phase MASTER dan urutan aktual |
| 4 | Lokasi `.env.example`: MASTER di root, JOBDESK di `backend/` | Per aplikasi (`backend/.env.example`); dicatat di JOBDESK |
| 5 | `API-CONTRACT.md` diwajibkan tetapi belum ada | Dibuat dan lengkap untuk scope PRD |
| 6 | Batas password maksimal dan email tidak terdokumentasi | Ditambahkan ke PRD §8.2 dan API Contract |
| 7 | Bentuk response dan format error tidak didefinisikan | Didefinisikan di API Contract §1.5 dan per endpoint |
| 8 | Batas pagination dan perilaku search belum ditentukan | Default 10, maks. 100; search judul, tidak peka huruf besar/kecil, cocok sebagian — PRD §8.2 |
| 9 | Daftar kategori "perlu disepakati" | Daftar usulan PRD dipakai di seed; ⚠️ konfirmasi tim masih dibutuhkan |
| 10 | Dashboard: workshop meminta, tim mengecualikan | Tetap dikecualikan; ⚠️ konfirmasi mentor masih dibutuhkan |
| 11 | `backend/AGENTS.md` (scaffold) menyarankan `@nestjs/authentication`, JOBDESK meminta JWT Strategy + Guard | Mengikuti JOBDESK/MASTER (passport-jwt). `AGENTS.md` adalah file scaffold untuk agen AI dan tidak diubah |
| 12 | Default status `WANT_TO_READ`, Cascade (hapus user → buku terhapus), SetNull (hapus kategori → `categoryId` null) tidak terdokumentasi | Dicatat di PRD §6 dan JOBDESK §4 |
| 13 | README root "Preparation phase", README backend boilerplate | Keduanya diperbarui |

---

## Pekerjaan Tersisa

| Pekerjaan | Pemilik | Status |
|---|---|---|
| Merge PR berurutan: setup → auth → categories → books → docs (merge commit) | Panji (Team Lead) | ⏳ |
| Konfirmasi daftar kategori final; apakah `GET /categories` perlu publik | Tim | ⏳ |
| Keputusan ObserveModule (isu #8 — saat ini aktif mengirim telemetri dari server lokal) | Panji | ⏳ |
| Konfirmasi mentor terkait pengecualian dashboard (PRD §10) | Panji | ⏳ |
| Frontend Next.js dan integrasi (termasuk logout = hapus token) | X (Frontend) + Panji | ⏳ |
| Persiapan demo | Tim | ⏳ |
| **Bug kecil:** register dengan `name` berisi spasi saja lolos validasi (`@IsNotEmpty` tanpa trim) lalu tersimpan sebagai string kosong. Perbaikan: tambahkan `@Transform(trimString)` pada `RegisterDto.name` seperti di DTO buku. Ditemukan saat sinkronisasi dokumen (diverifikasi dengan class-validator) | Panji | ⏳ Belum diperbaiki |
| Opsional: rate limiting login, unit test | Panji | — |
