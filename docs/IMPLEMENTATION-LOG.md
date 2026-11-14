# Implementation Log
# Personal Library Management — Backend

Dokumen ini mencatat riwayat implementasi backend: apa yang sudah dibuat, apa yang sudah diverifikasi, dan apa yang belum. Entri disusun kronologis; status terkini dirangkum di bagian pertama.

**Repository:** https://github.com/DDDdonutss/LIBRARY_PERSONAL
**Terakhir diperbarui:** 2026-11-15

> Semua hash commit di dokumen ini merujuk ke riwayat repository `LIBRARY_PERSONAL`, yang ditulis ulang tanpa `docs/MASTER-PROMPT.md` (lihat entri "Remote GitHub dan Push", langkah 7).

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
| 5 — Book Management | ✅ Completed (CRUD, search, filter, pagination, ownership, statistik dashboard) |
| 6 — Category API | ✅ Completed — daftar kategori menunggu konfirmasi tim |
| 7 — API Testing | ✅ Completed (Bruno 73 request / 115 tes; e2e 31 tes; unit 5 tes) |
| 8 — Frontend Integration | ⏳ Backend siap (CORS, API Contract); menunggu frontend |
| 9 — Finalization | ⏳ In Progress (PR #1–#8 di-merge ke `main`; security review dan code review dijalankan, temuan review ditutup; keputusan Observe dan demo belum) |

### Endpoint

| Endpoint | W | C | T | S |
|---|---|---|---|---|
| `POST /api/v1/auth/register` | ✅ | ✅ | ✅ | ✅ |
| `POST /api/v1/auth/login` | ✅ | ✅ | ✅ | ✅ |
| `GET /api/v1/auth/me` 🔒 | ✅ | ✅ | ✅ | ✅ |
| `GET /api/v1/categories` 🔒 | ✅ | ✅ | ✅ | ✅ |
| `POST /api/v1/books` 🔒 | ✅ | ✅ | ✅ | ✅ |
| `GET /api/v1/books` 🔒 (search, filter, pagination) | ✅ | ✅ | ✅ | ✅ |
| `GET /api/v1/books/stats` 🔒 (statistik dashboard) | ✅ | ✅ | ✅ | ✅ |
| `GET /api/v1/books/:id` 🔒 | ✅ | ✅ | ✅ | ✅ |
| `PATCH /api/v1/books/:id` 🔒 | ✅ | ✅ | ✅ | ✅ |
| `DELETE /api/v1/books/:id` 🔒 | ✅ | ✅ | ✅ | ✅ |

### Branch dan Pull Request

| Urutan | Branch | Commit teratas | PR | Merge commit di `main` | Status |
|---|---|---|---|---|---|
| 1 | `feature/backend-setup` | `bcba60c` | #1 | `51d8fb7` | ✅ Merged 2026-11-14 |
| 2 | `feature/backend-auth` | `ee83aa4` | #2 | `40c9d2d` | ✅ Merged 2026-11-14 |
| 3 | `feature/backend-categories` | `6f4fc22` | #3 | `8b8d2d5` | ✅ Merged 2026-11-14 |
| 4 | `feature/backend-books` | `22bd949` | #4 | `bcc5de5` | ✅ Merged 2026-11-14 |
| 5 | `docs/sync-project-docs` | `a4d798f` | #5 | `5737185` | ✅ Merged 2026-11-14 |
| 6 | `fix/register-name-trim` | `a6e9aed` | #6 | `9df7c4e` | ✅ Merged 2026-11-14 |
| 7 | `feature/backend-book-stats` | `703580e` | #7 | `ae82f1d` | ✅ Merged 2026-11-14 |
| 8 | `fix/book-stats-review` | `ef3a244` | #8 | `cd252f3` | ✅ Merged 2026-11-15 |
| 9 | `docs/record-pr-8` | — | #17 | — | Pencatatan PR #8 dan issue #9–#16 (dokumen ini) |

Branch 1–5 dibuat bertumpuk (setiap branch dari branch sebelumnya) dan di-merge berurutan dengan **"Create a merge commit"** — bukan squash/rebase — sehingga setiap PR hanya menampilkan commit miliknya. Branch 6 dibuat dari `main` setelah merge PR 5; branch 7 dari branch 6; branch 8 dari `main` setelah merge PR 7.

---

## 2026-11-13 — Inisialisasi Proyek

**Pelaksana:** Panji
**Commit:** `0f942d6` (struktur proyek & dokumentasi), `ec4c453` (inisialisasi NestJS)

- Struktur monorepo dan dokumen `PRD.md`, `JOBDESK-PANJI.md`, `MASTER-PROMPT.md`.
- NestJS 12 (ESM, Vitest, oxlint) di `backend/`.

---

## 2026-11-13 — Setup Database, Prisma, dan Register

**Pelaksana:** Panji
**Commit:**
- `bcba60c` `chore(backend): set up Prisma database foundation` — branch `feature/backend-setup`
- `86d13d3` `feat(auth): implement user registration` — branch `feature/backend-auth` (dibuat dari `feature/backend-setup`)

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
| 1 | Password > 72 byte melempar 409 (`ConflictException`), seharusnya 400 | `auth.service.ts` | ✅ Closed — `6cfee46` |
| 2 | Race condition register: duplikat bersamaan menghasilkan error Prisma `P2002` → 500, seharusnya 409 | `auth.service.ts` | ✅ Closed — `6cfee46` (diuji runtime: 8 request bersamaan → 1× 201, 7× 409, 0 error 500) |
| 3 | `JWT_SECRET` tidak divalidasi saat startup; `expiresIn` hard-coded `'1d'`, belum memakai `JWT_EXPIRES_IN` | `auth.module.ts` | ✅ Closed — `43dfa87` |
| 4 | Base path `/api/v1` belum diterapkan (endpoint saat itu `/auth/register`) | `main.ts` | ✅ Closed — `43dfa87` |
| 5 | Port default 3000, dokumen menetapkan 3001; `PORT` tidak ada di `.env` | `main.ts`, `.env` | ✅ Closed — `43dfa87` (default 3001; `PORT` di `.env` opsional) |
| 6 | `.env.example` belum ada | `backend/` | ✅ Closed — `6461cbc` |
| 7 | Tidak ada script `prisma generate` — clone baru gagal build karena client hasil generate di-ignore | `package.json` | ✅ Closed — `6461cbc` (diuji: simulasi clone baru → `npm ci` → build berhasil) |
| 8 | ObserveModule (telemetri eksternal, fallback secret placeholder) | `app.module.ts` | ⏸️ Dipertahankan sementara (keputusan Team Lead). Dinonaktifkan saat test (`d3616be`). Server lokal aktif mengirim telemetri. Evaluasi saat finalisasi — dilacak di GitHub issue #10 |
| 9 | BOM (byte order mark) di 6 file dan line ending CRLF | `main.ts`, `src/auth/**` | ✅ Closed — BOM dihapus (`43dfa87`, `ed82f30`); CRLF dinormalisasi Git saat commit |

---

## 2026-11-13 — Stabilize & Verify Register

**Pelaksana:** Panji
**Branch:** `feature/backend-auth`
**Commit:**
- `6cfee46` `fix(auth): return correct status codes for registration errors`
- `43dfa87` `feat(backend): add /api/v1 prefix and validate JWT config at startup`
- `ed82f30` `style(backend): remove BOM and stray blank lines`

### Perubahan

| File | Perubahan |
|---|---|
| `src/auth/auth.service.ts` | Password > 72 byte → 400, dicek sebelum query database; error Prisma `P2002` saat `create` → 409 |
| `src/auth/auth.module.ts` | `JwtModule.registerAsync`: aplikasi gagal start bila `JWT_SECRET` kosong atau < 32 karakter; `expiresIn` dari `JWT_EXPIRES_IN` (default `1d`) |
| `src/main.ts` | Global prefix `api/v1`; default port 3001 (prefix kemudian dipindah ke `src/app.setup.ts`, `f1608b1`) |
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
**Commit:** `6461cbc` `chore(backend): add .env.example and prisma generate scripts`

| Pekerjaan | W | C | T | S |
|---|---|---|---|---|
| `backend/.env.example` (placeholder; `JWT_SECRET="CHANGE_ME"` sengaja < 32 karakter agar aplikasi menolak start) | ✅ | — | ✅ | ✅ |
| Script `postinstall` dan `prisma:generate` (`prisma generate`) | ✅ | ✅ | ✅ | — |

Verifikasi: simulasi clone baru (hanya file ter-track Git, tanpa `.env`/`node_modules`/`src/generated`) → `npm ci` otomatis men-generate client → `nest build` berhasil; start dengan `.env` hasil salinan `.env.example` ditolak karena `JWT_SECRET` placeholder.

---

## 2026-11-13 — Register Testing

**Pelaksana:** Panji
**Branch:** `feature/backend-auth`
**Commit:** `592385e` `test(api): add Bruno collection for registration`

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
- `263f008` `feat(auth): add login, JWT guard and current user endpoint`
- `c20b748` `feat(backend): enable CORS for the frontend origin`
- `84b50c0` `test(api): add Bruno tests for login and current user`
- `ee83aa4` `docs: add API contract for auth and record auth progress`

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
- `1005c7a` `chore(db): add global category seed`
- `2b629a1` `feat(categories): add global category endpoint`
- `3099a96` `test(api): add Bruno tests for categories`
- `6f4fc22` `docs: document category API and record progress`

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
- `6f0c7e0` `feat(books): add book CRUD with search, filters and pagination`
- `016a0c1` `test(api): add Bruno tests for books and data ownership`
- `2aab5b0` `docs: document books API and record book management progress`

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
**Commit:** `29129ad` `docs(backend): replace scaffold README with setup and usage guide`, `92cbcdd` `docs: record backend README in implementation log`

README bawaan scaffold NestJS diganti dengan panduan: prasyarat, instalasi (env, database, migration, seed), daftar script, endpoint, cara menjalankan Bruno, struktur proyek, aturan keamanan. Langkah yang terdokumentasi diverifikasi: `npm run db:migrate` (tidak ada migration tertunda), `npm run db:seed`, dan aplikasi tetap start tanpa variabel `OBSERVE_*`.

---

## 2026-11-13 — Perbaikan E2E Test dan Penghapusan Endpoint Hello World

**Pelaksana:** Panji
**Branch:** `feature/backend-books`
**Commit:**
- `f1608b1` `refactor(backend): extract global app configuration into configureApp`
- `7aa750c` `refactor(backend): remove scaffold Hello World endpoint`
- `d3616be` `test(e2e): replace scaffold test with end-to-end API suite`
- `22bd949` `docs: document e2e tests and record hello world removal`

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

Dijalankan ulang terhadap build `22bd949` atas permintaan Team Lead: **15 request, 23/23 tes lolos**, 0 error di log server. Tidak ada perubahan status.

---

## 2026-11-13 — Remote GitHub dan Push

**Repository aktif:** https://github.com/DDDdonutss/LIBRARY_PERSONAL (lihat langkah 7)

### Kronologi

1. Repository pertama (`Personal-Library-Management-Docs`) ternyata berisi commit "Initial commit" dari template GitHub (README dan `.gitignore` untuk bahasa Ada) dengan riwayat yang tidak terhubung. Team Lead memilih membuat ulang repository kosong (opsi C) daripada merge atau force-push.
2. Sebelum push ke repository baru, ditemukan bekas perintah *quick setup* GitHub yang dijalankan di dalam `backend/`:
   - baris `# Personal_Library` ditambahkan ke `backend/README.md` dalam encoding UTF-16 (file menjadi biner bagi Git);
   - repository Git bersarang `backend/.git` dengan satu commit README yang sudah ter-push ke repository lain (`DDDdonutss/Personal_Library`). Tidak ada `.env` atau secret di commit tersebut.
3. Dengan persetujuan Team Lead: `backend/.git` dihapus dan `backend/README.md` dipulihkan ke versi ter-commit. Repo utama tetap utuh (dicek lewat reflog), `backend/` kembali menjadi folder biasa tanpa embedded repo.
4. Audit sebelum push: tidak ada `.env` di commit mana pun; kredensial di riwayat hanya placeholder; 0 attribution AI di pesan commit dan dokumen.
5. Push (`git push -u`) ke `DDDdonutss/PERSONAL_LIBRARY01`: `main`, `feature/backend-setup`, `feature/backend-auth`, `feature/backend-categories`, `feature/backend-books`. Hash di remote sama dengan lokal.
6. Atas permintaan Team Lead, proyek dipindahkan ke repository kosong baru `DDDdonutss/PENYIMPAN_BUKU` (opsi C, prosedur sama: repository dicek kosong, tidak ada repo bersarang, encoding dokumen UTF-8). Remote `origin` diarahkan ke repository baru, lalu semua branch di-push, termasuk `docs/sync-project-docs`. URL di dokumen diperbarui ke repository baru.
7. Atas permintaan Team Lead, proyek dipindahkan lagi ke repository kosong baru `DDDdonutss/LIBRARY_PERSONAL` (opsi C), **tanpa `docs/MASTER-PROMPT.md`**:
   - Karena file tersebut sudah ada sejak commit pertama, file dihapus dari **seluruh riwayat** (bukan hanya di commit baru) dengan `git filter-branch --index-filter` pada keenam branch. Akibatnya semua hash commit berubah; author, committer, tanggal, dan pesan commit tetap sama (diverifikasi untuk 30 commit). Hash di dokumen ini sudah diperbarui ke riwayat baru.
   - Verifikasi: di setiap branch, satu-satunya perbedaan isi dengan riwayat lama adalah hilangnya `docs/MASTER-PROMPT.md`; riwayat baru tidak memuat file itu di commit mana pun.
   - File tetap ada di komputer lokal sebagai dokumen internal dan ditambahkan ke `.gitignore`.
   - Cadangan lengkap riwayat lama dibuat (git bundle) sebelum penulisan ulang.
   - Setelah repository baru terverifikasi, penghapusan `PENYIMPAN_BUKU` dan `PERSONAL_LIBRARY01` dicoba lewat integrasi GitHub tetapi ditolak (`403 Resource not accessible by integration`); penghapusan dilakukan manual oleh Team Lead melalui Settings → Danger Zone. Kedua repository masih memuat riwayat lama yang berisi `docs/MASTER-PROMPT.md`.

### Catatan

- `gh` CLI tidak terpasang; Pull Request dibuat Team Lead melalui web GitHub.
- Repository `DDDdonutss/Personal_Library`, `PENYIMPAN_BUKU`, dan `PERSONAL_LIBRARY01` tidak dipakai dan perlu dihapus manual.

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

## 2026-11-14 — Merge PR #1–#5 dan Verifikasi `main`

**Pelaksana:** Panji

Kelima PR dibuat dan di-merge berurutan oleh Team Lead melalui web GitHub dengan **"Create a merge commit"** (integrasi GitHub di sesi kerja mendapat `403` saat mencoba membuat PR, sehingga dilakukan manual). Nomor PR dan merge commit tercatat di tabel "Branch dan Pull Request".

### Verifikasi di `main` (`5737185`)

| Uji | Hasil |
|---|---|
| Isi tree `main` vs `docs/sync-project-docs` | ✅ Identik (`git diff` kosong) |
| `npm run build` | ✅ Berhasil |
| `npm run test:e2e` | ✅ 26/26 |
| Bruno seluruh koleksi (server dari `main`) | ✅ 60 request, 91/91 tes |

---

## 2026-11-14 — Perbaikan Validasi Nama Register

**Pelaksana:** Panji
**Branch:** `fix/register-name-trim` (dibuat dari `main`)
**Commit:** `2d8c0a8` `fix(auth): reject whitespace-only names at registration`

Menutup bug yang tercatat di "Pekerjaan Tersisa": register dengan `name` berisi spasi saja lolos validasi dan tersimpan sebagai string kosong.

### Systematic debugging

| Langkah | Hasil |
|---|---|
| Reproduksi di server lokal | `name: "   "` → **201**, tersimpan `""` (bug). `name: "  Panji  "` → 201, tersimpan `"Panji"` (service sudah trim). Kontrol: `title: "   "` pada `POST /books` → **400** (benar) |
| Akar masalah | `RegisterDto.name` hanya memakai `@IsNotEmpty()`; class-validator menilai `"   "` sebagai tidak kosong. `.trim()` di `AuthService` berjalan **setelah** validasi, sehingga yang tersimpan string kosong. DTO buku tidak terkena karena memakai `@Transform(trimString)` yang berjalan sebelum validasi |
| Perbaikan | `trimString` dipindah ke `src/common/transforms/trim-string.ts` (modul bersama, agar `auth` tidak mengimpor dari `books`), lalu dipasang pada `RegisterDto.name`. Import di `create-book.dto.ts`, `update-book.dto.ts`, `query-books.dto.ts` diarahkan ke modul baru. `.trim()` di service dihapus karena DTO sudah menjamin nilai bersih |

### Test-driven development

1. **Merah:** dua test e2e ditulis dulu — `name` spasi saja → 400, dan `name` berspasi di awal/akhir → 201 dengan `name` ter-trim. Run: **1 gagal** (`expected 400, got 201`), 27 lolos.
2. **Hijau:** setelah perbaikan DTO, `tsc` menemukan import `trimString` yang terlewat di `query-books.dto.ts` (Vitest tidak melakukan typecheck, sehingga `search` sempat menghasilkan 500). Setelah import diperbaiki: e2e **28/28**.
3. Test spasi dibuat tetap membersihkan user bila suatu saat request itu lolos lagi (regresi tidak meninggalkan data uji).

### Verifikasi

- `tsc`, oxlint, Prettier (file yang diubah): lolos.
- e2e: **28/28**.
- Bruno `01 Auth` + 2 request baru (`16 Register - whitespace name`, `17 Register - name trimmed`): **17 request, 27/27 tes**.
- Server live: `name: "   "` → `400 {"message":["name should not be empty"]}`.

### Catatan data

Reproduksi membuat 4 user `repro.*@example.com` dan run merah e2e meninggalkan 1 user `e2e.ws.*@example.com` (nama kosong) di database lokal. Data dibiarkan sesuai kebijakan data uji sebelumnya; dapat dihapus manual bila diinginkan.

### Dokumen yang disesuaikan

`API-CONTRACT.md` §2.1 dan riwayat; `PRD.md` v1.2 §8.2; `JOBDESK-PANJI.md` v1.2 (struktur `common/`, alur Git, jumlah tes); `backend/README.md` (jumlah tes, struktur).

---

## 2026-11-14 — Endpoint Statistik Dashboard (`GET /books/stats`)

**Pelaksana:** Panji
**Branch:** `feature/backend-book-stats` (dibuat dari `fix/register-name-trim`)
**Commit:** `ed34f55` `feat(books): add collection statistics endpoint for the dashboard`

### Konteks

Mentor mengonfirmasi bahwa dashboard sederhana (dokumen workshop hal. 7) diminta, sehingga pengecualian di PRD §10 dicabut. Pembagian kerja: backend menyediakan data ringkasan lewat satu endpoint; tampilan dashboard dikerjakan frontend. Endpoint khusus dibutuhkan karena `GET /books` dibatasi 100 buku per halaman — menghitung di frontend berarti mengambil semua halaman.

### Test-driven development

1. **Merah:** tiga test e2e ditulis lebih dulu — ringkasan user A (2 buku: satu `WANT_TO_READ` berkategori Science, satu `COMPLETED` tanpa kategori), ringkasan user B (0 buku), dan tanpa token → 401. Run: **2 gagal** (`expected 200, got 400` — path `stats` tertangkap `GET /books/:id` dan ditolak `ParseUUIDPipe`), 29 lolos.
2. **Hijau:** `BooksService.getStats()` dan `@Get('stats')` yang dideklarasikan **sebelum** `@Get(':id')`. e2e **31/31**.

### Dikerjakan

| Pekerjaan | File | W | C | T | S |
|---|---|---|---|---|---|
| `GET /api/v1/books/stats` 🔒 | `books.controller.ts` | ✅ | ✅ | ✅ | ✅ |
| `BooksService.getStats()` — dua `groupBy` (per `status`, per `categoryId`) dalam satu `$transaction`; nama kategori diambil sekali dengan `findMany` | `books.service.ts` | ✅ | ✅ | ✅ | ✅ |
| Folder Bruno `05 Stats` (8 request, 15 tes) — mandiri: register user sendiri, buat 3 buku, cek angka pasti; plus user tanpa buku dan tanpa token | `bruno/05 Stats/` | ✅ | — | ✅ | — |
| 3 test e2e (ringkasan, isolasi antar user, 401) | `test/app.e2e-spec.ts` | ✅ | ✅ | ✅ | — |

### Verifikasi

- `tsc`, oxlint, Prettier: lolos.
- e2e: **31/31**.
- Bruno seluruh koleksi terhadap server lokal: **70 request, 110/110 tes**, dijalankan **dua kali** (koleksi tetap dapat diulang).
- Server live: route `Mapped {/api/v1/books/stats, GET}` terdaftar; user baru → `{"total":0,"byStatus":{"WANT_TO_READ":0,"READING":0,"COMPLETED":0},"byCategory":[]}`; `GET /books/bukan-uuid` tetap 400 (urutan route tidak mengganggu validasi ID).
- `server.log`: tidak ada error runtime. Satu compile error sesaat dari watch mode (`TS2459`, 22:20) saat file DTO diedit bertahap pada perbaikan nama; hilang setelah import diperbaiki (22:21).

### Keputusan Desain

- **Bentuk response** `{ total, byStatus, byCategory }`. `byStatus` selalu memuat ketiga status (0 bila kosong) agar frontend tidak perlu menangani key yang hilang. `byCategory` hanya memuat kategori yang punya buku; buku tanpa kategori diwakili entri `categoryId: null`, sehingga jumlah `count` selalu sama dengan `total` (cocok untuk pie chart).
- **Urutan `byCategory`:** `count` terbesar dulu, lalu nama A–Z, tanpa kategori paling akhir — deterministik untuk test dan tampilan.
- **Dihitung di database** (`GROUP BY`), bukan `findMany` lalu dihitung di Node: biaya tetap kecil berapa pun jumlah buku.
- **Ownership:** `where: { userId }` pada kedua `groupBy`. User B dengan 0 buku mendapat semua nol meski user A punya buku (diuji e2e dan Bruno).
- **Route `stats` sebelum `:id`.** Express mencocokkan route sesuai urutan pendaftaran; tanpa ini `stats` ditolak 400 sebagai UUID tidak valid (inilah penyebab test merah).

### Catatan data

Setiap run Bruno kini membuat 2 user tambahan (`stats.*`, `statsempty.*@example.com`) dan 3 buku di database lokal. Dibiarkan, sesuai kebijakan data uji sebelumnya.

### Dokumen yang disesuaikan

`API-CONTRACT.md` §4.8 (baru), §4.9, riwayat, status v1.2; `PRD.md` v1.2 §4.4 FR-14, §9, §10 dan workshop note, §11, §12; `JOBDESK-PANJI.md` BE-10, §2D, §7, §11, alur Git; `README.md` root dan `backend/README.md`.

---

## 2026-11-14 — Merge PR #6–#7, Security Review, dan Code Review di `main`

**Pelaksana:** Panji

### Merge

PR #6 (`fix/register-name-trim`) dan PR #7 (`feature/backend-book-stats`) di-merge berurutan oleh Team Lead melalui web GitHub dengan "Create a merge commit" → `main` = `ae82f1d`. Isi tree `main` identik dengan `feature/backend-book-stats`.

### Verifikasi di `main` (`ae82f1d`)

| Uji | Hasil |
|---|---|
| `npm run build` | ✅ Berhasil |
| `npm run test:e2e` | ✅ 31/31 |
| Bruno seluruh koleksi | ✅ 70 request, 110/110 tes |

### Security review (`/security-review`)

Cakupan: seluruh kode backend sejak scaffold (`ec4c453..main`), dengan perhatian khusus pada PR #6 dan #7. **Hasil: tidak ada temuan HIGH/MEDIUM** dengan keyakinan > 80%.

| Area | Kesimpulan |
|---|---|
| `GET /books/stats` | Dilindungi JWT; `groupBy` dibatasi `userId` dari token; tanpa input dari client; nama kategori adalah data global |
| `trimString` / `RegisterDto` | Fungsi murni, berjalan sebelum validator; penghapusan `.trim()` di service aman (`transform: true`) |
| Ownership buku (IDOR) | Semua query memakai `{ id, userId }`; buku user lain → 404 |
| Mass assignment | `whitelist` + `forbidNonWhitelisted`; `userId` hanya dari JWT |
| Injection | Hanya query builder Prisma (tanpa raw SQL); input divalidasi (enum, UUID, panjang) |
| JWT | Secret ≥ 32 karakter divalidasi saat start, HS256, ada expiry, hanya header Bearer |
| Password / data exposure | bcrypt cost 12 + batas 72 byte; pesan login generik; `passwordHash` tidak pernah dikirim |
| CORS | Origin eksplisit, tanpa wildcard dan tanpa credentials |

Catatan di bawah ambang (tidak dilaporkan sebagai kerentanan): token tetap berlaku sampai kedaluwarsa walau user dihapus (belum ada fitur hapus user; `/auth/me` sudah menolak user yang tidak ada); telemetri ObserveModule belum diverifikasi apakah merekam isi request (terkait keputusan isu #8).

### Code review (`/review`)

Cakupan: merge terakhir (PR #7, `GET /books/stats`). 8 temuan, semuanya ditindaklanjuti di entri berikutnya:

| # | Temuan | Tindak lanjut |
|---|---|---|
| 1 | Dua `groupBy` terpisah di READ COMMITTED bisa berbeda snapshot → `total` ≠ jumlah `byCategory` (melanggar API Contract §4.8) | Diperbaiki |
| 2 | Kategori terhapus di antara query → entri `categoryId` terisi dengan `name: null` | Diperbaiki |
| 3 | Comparator memakai `name === null` dan tidak antisimetris bila keduanya `null` | Diperbaiki |
| 4 | Folder Bruno `05 Stats` diklaim mandiri tetapi memakai `categoryScienceId` dari folder `02` | Diperbaiki |
| 5 | `localeCompare` tanpa locale; tie-break nama tidak teruji | Diperbaiki |
| 6 | Tiga round trip database, bisa dua | Diperbaiki (ikut #1) |
| 7 | `BooksService` mengakses `prisma.category` langsung, bukan lewat `CategoriesService` | Diperbaiki |
| 8 | Test e2e statistik bergantung pada buku dari test lain | Diperbaiki |

---

## 2026-11-14 — Perbaikan Hasil Code Review Endpoint Statistik

**Pelaksana:** Panji
**Branch:** `fix/book-stats-review` (dibuat dari `main` `ae82f1d`)
**Commit:** `8de7ff3` `fix(books): make collection statistics consistent and self-contained`

Bentuk response `GET /books/stats` **tidak berubah**; frontend tidak terdampak.

### Test-driven development

1. **Merah:** unit test pertama proyek, `src/books/books.service.spec.ts` (5 tes, Prisma dan `CategoriesService` tiruan): satu `groupBy` per `(status, categoryId)` yang dibatasi `userId`; total/byStatus/byCategory dari baris yang sama dan jumlahnya sama dengan `total`; kategori terhapus digabung ke "tanpa kategori"; urutan saat `count` sama (Fiction sebelum History walau History lebih dulu, tanpa kategori terakhir); user tanpa buku tidak memicu pencarian nama kategori. Run: **5/5 gagal** (`this.prisma.$transaction is not a function` — implementasi lama memakai dua `groupBy` dalam `$transaction`).
2. **Hijau:** implementasi baru, unit **5/5**.

### Perubahan

| Pekerjaan | File | W | C | T | S |
|---|---|---|---|---|---|
| Satu `groupBy({ by: ['status', 'categoryId'] })` — semua angka dari satu snapshot; `$transaction` tidak diperlukan; 2 query (bukan 3) | `books.service.ts` | ✅ | ✅ | ✅ | ✅ |
| Kategori yang tidak ditemukan (terhapus setelah `GROUP BY`) digabung ke entri `null`; tipe `CategoryStat` dijadikan union sehingga `categoryId`/`name` selalu sama-sama terisi atau `null` | `books.service.ts` | ✅ | ✅ | ✅ | — |
| Comparator berbasis `categoryId === null`, antisimetris; nama dibandingkan `Intl.Collator('en')` | `books.service.ts` | ✅ | ✅ | ✅ | — |
| `CategoriesService.findByIds()`; `BooksService` tidak lagi mengakses `prisma.category` langsung | `categories.service.ts`, `books.service.ts` | ✅ | ✅ | ✅ | — |
| Test e2e Stats mandiri: user dan 5 buku sendiri, termasuk tie-break nama | `test/app.e2e-spec.ts` | ✅ | ✅ | ✅ | — |
| Bruno `05 Stats` mandiri: request baru `02 Categories - lookup ids` (variabel `stats*Id` sendiri), buku History dan Fiction untuk tie-break, tes jumlah = `total`. 11 request / 20 tes | `bruno/05 Stats/` | ✅ | — | ✅ | — |
| Komentar `vitest.config.ts` dan baris `npm test` di README (kini ada unit test) | `vitest.config.ts`, `backend/README.md` | ✅ | — | — | — |

### Verifikasi

- `tsc`, oxlint, Prettier (file yang diubah): lolos.
- Unit test (`npm test`): **5/5**.
- e2e: **31/31**; tes Stats saja (`vitest -t Stats`): **2 lolos, 29 dilewati** — tidak lagi bergantung pada test lain (temuan #8).
- Bruno folder `05 Stats` **saja**: **11 request, 20/20** (temuan #4). Seluruh koleksi: **73 request, 115/115**.
- `server.log`: satu `ERR_MODULE_NOT_FOUND` pukul 23:26 — terjadi karena `npm run build` (yang mengosongkan `dist/`) dijalankan untuk verifikasi `main` saat dev server watch mode masih hidup; server pulih sendiri 23:26:06 dan sehat sejak itu. Bukan bug kode.

### Dokumen yang disesuaikan

`API-CONTRACT.md` §4.8 (konsistensi, pasangan `categoryId`/`name`, aturan urutan, kategori terhapus) dan riwayat; `JOBDESK-PANJI.md` v1.3; `backend/README.md`.

---

## 2026-11-15 — Merge PR #8 dan Verifikasi `main`

**Pelaksana:** Panji

PR #8 (`fix/book-stats-review`) di-merge oleh Team Lead melalui web GitHub dengan "Create a merge commit" → `main` = `cd252f3`. Isi tree `main` identik dengan `fix/book-stats-review`.

| Uji di `main` (`cd252f3`) | Hasil |
|---|---|
| `tsc --noEmit -p tsconfig.build.json` | ✅ Lolos ¹ |
| oxlint | ✅ Lolos |
| Unit test (`npm test`) | ✅ 5/5 |
| `npm run test:e2e` | ✅ 31/31 |
| Bruno seluruh koleksi | ✅ 73 request, 115/115 tes |
| `server.log` setelah perubahan | ✅ Tidak ada error runtime |

¹ Dipakai sebagai pengganti `npm run build` karena dev server (watch mode) sedang berjalan; `nest build` mengosongkan `dist/` dan sempat menghentikan dev server pada verifikasi sebelumnya.

### GitHub Issues

Pembuatan issue lewat integrasi GitHub ditolak (`403 Resource not accessible by integration`), sama seperti pembuatan PR dan penghapusan repository. Atas persetujuan Team Lead, **GitHub CLI (`gh` 2.104.0)** dipasang lewat winget dan login sebagai `DDDdonutss`; issue dan PR kini dapat dibuat dari terminal.

Delapan issue untuk pekerjaan yang masih terbuka dibuat 2026-11-15:

| Issue | Judul | Label | Assignee | Branch terhubung |
|---|---|---|---|---|
| #9 | Hapus repository lama yang tidak dipakai | documentation | DDDdonutss | — (tindakan di Settings GitHub, tanpa kode) |
| #10 | Putuskan nasib ObserveModule (telemetri NestJS Observe) | question | DDDdonutss | `chore/observe-module-decision` |
| #11 | Konfirmasi daftar kategori final dan akses `GET /categories` | question | DDDdonutss | `chore/category-list` |
| #12 | Frontend: integrasi Next.js dengan backend API | enhancement | — (menunggu akun GitHub X) | `feature/frontend-integration` |
| #13 | Persiapan demo aplikasi | documentation | — | `docs/demo-preparation` |
| #14 | Opsional: rate limiting untuk login dan register | enhancement | — | `feature/auth-rate-limit` |
| #15 | Opsional: tolak token milik user yang sudah dihapus di semua endpoint | enhancement | — | `fix/jwt-deleted-user` |
| #16 | Rapikan format Prettier di `backend/src/prisma` | — | — | `chore/format-prisma` |

Branch dibuat dengan `gh issue develop` dari `main` (`cd252f3`), sehingga muncul di bagian **Development** pada setiap issue. Sebelum mulai bekerja di salah satu branch, ambil perubahan terbaru dari `main` (`git merge main`).

Nomor issue dan PR berbagi urutan di GitHub (PR #1–#8, issue #9–#16). Pekerjaan yang sudah selesai tidak dibuatkan issue mundur; jejaknya ada di PR #1–#8 dan dokumen ini. Mulai sekarang, PR yang menyelesaikan issue mencantumkan `Closes #<nomor>`.

> Catatan penomoran: "isu #1–#9" pada tabel *Hasil Security Review* (entri 2026-11-13) adalah nomor temuan internal dokumen ini, **bukan** nomor GitHub. Contoh: temuan ObserveModule = isu keamanan #8 = GitHub issue #10.

---

## Pekerjaan Tersisa

Sumber utama pelacakan adalah **GitHub Issues** (https://github.com/DDDdonutss/LIBRARY_PERSONAL/issues); tabel ini merangkumnya.

| Pekerjaan | Issue | Pemilik | Status |
|---|---|---|---|
| Hapus repository lama `PENYIMPAN_BUKU`, `PERSONAL_LIBRARY01`, `Personal_Library` | #9 | Panji (Team Lead) | ⏳ Manual (Settings → Danger Zone) |
| Keputusan ObserveModule (isu keamanan #8 — saat ini aktif mengirim telemetri dari server lokal), termasuk memeriksa apakah telemetri merekam isi request | #10 | Panji | ⏳ |
| Konfirmasi daftar kategori final; apakah `GET /categories` perlu publik | #11 | Tim | ⏳ |
| Frontend Next.js dan integrasi (termasuk logout = hapus token dan halaman dashboard dari `GET /books/stats`) | #12 | X (Frontend) + Panji | ⏳ |
| Persiapan demo | #13 | Tim | ⏳ |
| Opsional: rate limiting login/register | #14 | Panji | — |
| Opsional: tolak token milik user yang sudah dihapus | #15 | Panji | — |
| Opsional: rapikan format Prettier di `backend/src/prisma` (sudah ada sejak awal) | #16 | Panji | — |
| Opsional: unit test untuk modul lain (statistik sudah punya unit test) | — | Panji | — |
| ~~Buat issue GitHub untuk pekerjaan terbuka~~ | #9–#16 | Panji | ✅ 2026-11-15 |
| ~~Konfirmasi mentor terkait pengecualian dashboard (PRD §10)~~ | — | Panji | ✅ Mentor meminta dashboard sederhana (2026-11-14); backend `GET /books/stats` selesai (`ed34f55`), tampilan dashboard masuk #12 |
| ~~Bug kecil: register dengan `name` berisi spasi saja lolos validasi~~ | — | Panji | ✅ Ditutup 2026-11-14 (`2d8c0a8`, PR #6) |
