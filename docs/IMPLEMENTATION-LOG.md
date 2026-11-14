# Implementation Log
# Personal Library Management — Backend

Dokumen ini mencatat riwayat implementasi backend: apa yang sudah dibuat, apa yang sudah diverifikasi, dan apa yang belum.

## Legenda Status

Setiap pekerjaan dinilai pada empat tingkat yang **berbeda**:

| Kode | Arti | Bukti yang dibutuhkan |
|---|---|---|
| **[W] Written** | Kode/konfigurasi sudah ditulis | File ada di repository |
| **[C] Compiled** | Lolos kompilasi TypeScript / validasi tool | `tsc`, `prisma validate`, lint |
| **[T] API Tested** | Endpoint diuji dan hasilnya sesuai | Request Bruno/Postman + data di database |
| **[S] Security Reviewed** | Sudah direview dari sisi keamanan dan isu ditutup | Catatan review + perbaikan diverifikasi |

Simbol: ✅ selesai · ⚠️ selesai dengan catatan · ❌ belum · — tidak berlaku

---

## 2026-11-13 — Inisialisasi Proyek

**Pelaksana:** Panji
**Commit:** `8743b1e` (struktur proyek & dokumentasi), `a2b5b37` (inisialisasi NestJS)

- Struktur monorepo dan dokumen `PRD.md`, `JOBDESK-PANJI.md`, `MASTER-PROMPT.md`.
- NestJS 12 (ESM, Vitest, oxlint) di `backend/`.

---

## 2026-11-13 — Setup Database, Prisma, dan Register

**Pelaksana:** Panji
**Commit (lokal, belum di-push — repository belum memiliki remote):**
- `c199414` `chore(backend): set up Prisma database foundation` — branch `feature/backend-setup`
- `d63e9eb` `feat(auth): implement user registration` — branch `feature/backend-auth` (dibuat dari `feature/backend-setup`)

### Dikerjakan

| Pekerjaan | File | W | C | T | S |
|---|---|---|---|---|---|
| Dependensi (Prisma 7.10.1, adapter-pg, @nestjs/jwt, passport-jwt, bcrypt, class-validator) | `backend/package.json` | ✅ | ✅ | — | — |
| Prisma config | `backend/prisma7.config.ts` | ✅ | ✅ | — | — |
| Prisma schema (User, Book, Category, enum `BookStatus`) | `backend/prisma/schema.prisma` | ✅ | ✅ | — | ✅ |
| Initial migration `20261113060551_init` | `backend/prisma/migrations/` | ✅ | ✅ | — | ✅ |
| PrismaService + PrismaModule (global) | `backend/src/prisma/` | ✅ | ✅ | ❌ | ✅ |
| JwtModule | `backend/src/auth/auth.module.ts` | ✅ | ✅ | ✅ ² | ✅ ¹ |
| RegisterDto, LoginDto | `backend/src/auth/dto/` | ✅ | ✅ | ✅ ² | ✅ |
| Global ValidationPipe | `backend/src/main.ts` | ✅ | ✅ | ✅ ² | ✅ |
| `AuthService.register()` + `POST /api/v1/auth/register` | `backend/src/auth/` | ✅ | ✅ | ✅ ² | ✅ ¹ |
| `*.tsbuildinfo` dan Prisma client hasil generate di-ignore | `backend/.gitignore` | ✅ | — | — | — |

¹ Diperbarui setelah perbaikan isu #1–#5 (lihat entri "Stabilize & Verify Register").
² Status T diperbarui 2026-11-13 setelah uji Bruno lengkap (lihat entri "Register Testing" dan "Login & JWT").

### Verifikasi yang sudah dilakukan (2026-11-13)

- `tsc --noEmit -p tsconfig.build.json`: **lolos**.
- `npm run lint` (oxlint): **lolos**.
- `vitest run` (unit test bawaan): **1/1 lolos**.
- `prisma validate`: **schema valid**.
- `prisma migrate status`: **1 migration, database up to date** (`personal_library_db` @ localhost:5432).
- `.env` ter-ignore Git (dicek dengan `git check-ignore`).
- Isi database saat verifikasi: `User` 0, `Category` 0, `Book` 0 baris.

### Belum diverifikasi

- **Register belum pernah teruji end-to-end.** Tabel `User` kosong, sehingga tidak ada bukti register berhasil menyimpan data.
- Aplikasi belum dijalankan dan diuji melalui HTTP selama sesi verifikasi.

### Hasil Security Review (2026-11-13)

| # | Isu | Lokasi | Status |
|---|---|---|---|
| 1 | Password > 72 byte melempar 409 (`ConflictException`), seharusnya 400 | `auth.service.ts` | ✅ Closed — `23b46d2` |
| 2 | Race condition register: duplikat bersamaan menghasilkan error Prisma `P2002` → 500, seharusnya 409 | `auth.service.ts` | ✅ Closed — `23b46d2` (diuji runtime: 8 request bersamaan → 1× 201, 7× 409, 0 error 500) |
| 3 | `JWT_SECRET` tidak divalidasi saat startup; `expiresIn` hard-coded `'1d'`, belum memakai `JWT_EXPIRES_IN` | `auth.module.ts` | ✅ Closed — `3d86dfa` |
| 4 | Base path `/api/v1` belum diterapkan (endpoint saat ini `/auth/register`) | `main.ts` | ✅ Closed — `3d86dfa` |
| 5 | Port default 3000, dokumen menetapkan 3001; `PORT` tidak ada di `.env` | `main.ts`, `.env` | ✅ Closed — `3d86dfa` (default 3001; `PORT` di `.env` opsional) |
| 6 | `.env.example` belum ada | `backend/` | ✅ Closed — `1331099` |
| 7 | Tidak ada script `prisma generate` — clone baru gagal build karena client hasil generate di-ignore | `package.json` | ✅ Closed — `1331099` (diuji: simulasi clone baru → `npm ci` → build berhasil) |
| 8 | ObserveModule (telemetri eksternal, fallback secret placeholder) | `app.module.ts` | ⏸️ Dipertahankan sementara, dievaluasi saat finalisasi (keputusan Team Lead 2026-11-13) |
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
| `src/main.ts` | Global prefix `api/v1`; default port 3001 |
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

### Belum diverifikasi

- ~~Register sukses (201) dan email duplikat (409) — menunggu uji Bruno.~~ → terverifikasi, lihat "Register Testing".
- ~~Jalur `P2002` saat request bersamaan — belum diuji runtime.~~ → terverifikasi, lihat "Register Testing".

### Catatan

- Path di luar `/api/v1` mengembalikan 404 berupa HTML bawaan Express, bukan JSON. Tidak berdampak selama frontend memakai base URL `http://localhost:3001/api/v1`; sudah dicatat di `docs/API-CONTRACT.md` §1.1.

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

Cara menjalankan: start backend, lalu di `backend/bruno/` jalankan `npx @usebruno/cli run "01 Auth" --env local`, atau buka folder `backend/bruno` di aplikasi Bruno.

**Catatan data:** uji ini membuat user nyata di database lokal (`usera.<timestamp>@example.com`, `race.<timestamp>@example.com`). Data tersebut sengaja dibiarkan; tidak ada data yang dihapus.

---

## 2026-11-13 — Login & JWT

**Pelaksana:** Panji
**Branch:** `feature/backend-auth`
**Commit:**
- `e5256a1` `feat(auth): add login, JWT guard and current user endpoint`
- `d3893c8` `feat(backend): enable CORS for the frontend origin`
- `d827a12` `test(api): add Bruno tests for login and current user`

### Dikerjakan

| Pekerjaan | File | W | C | T | S |
|---|---|---|---|---|---|
| `POST /api/v1/auth/login` (200; 401 generik untuk email/password salah) | `auth.service.ts`, `auth.controller.ts` | ✅ | ✅ | ✅ | ✅ |
| `JwtStrategy` (passport-jwt, Bearer token) | `strategies/jwt.strategy.ts` | ✅ | ✅ | ✅ | ✅ |
| `JwtAuthGuard` | `guards/jwt-auth.guard.ts` | ✅ | ✅ | ✅ | ✅ |
| Decorator `@CurrentUser()` | `decorators/current-user.decorator.ts` | ✅ | ✅ | ✅ | — |
| `GET /api/v1/auth/me` 🔒 | `auth.controller.ts` | ✅ | ✅ | ✅ | ✅ |
| Konfigurasi JWT bersama (`getJwtSecret`, `getJwtExpiresIn`) | `jwt.config.ts` | ✅ | ✅ | ✅ | ✅ |
| CORS (`CORS_ORIGIN`, default `http://localhost:3000`) | `main.ts`, `.env.example` | ✅ | ✅ | ✅ | ✅ |

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

- **Timing login:** email tidak terdaftar dijawab ±5 ms, password salah ±400 ms (bcrypt), sehingga keberadaan email bisa ditebak dari waktu respons. Tidak ditangani karena register sudah mengungkap hal yang sama lewat 409 (sesuai PRD: email unik). Bisa dievaluasi ulang saat finalisasi.
- **Belum ada rate limiting** pada login/register. Di luar scope PRD; dicatat untuk finalisasi.

---

## 2026-11-13 — Category API

**Pelaksana:** Panji
**Branch:** `feature/backend-categories` (dibuat dari `feature/backend-auth`)
**Commit:**
- `88409d0` `chore(db): add global category seed`
- `e602b86` `feat(categories): add global category endpoint`
- `727ff1a` `test(api): add Bruno tests for categories`

### Dikerjakan

| Pekerjaan | File | W | C | T | S |
|---|---|---|---|---|---|
| Seed kategori global (idempotent, `upsert` by name) | `prisma/seed.ts`, `prisma7.config.ts` | ✅ | ✅ | ✅ | ✅ |
| Script `db:seed` dan `db:migrate` | `package.json` | ✅ | — | ✅ (`db:seed`) | — |
| Dependensi dev `tsx` (menjalankan `seed.ts`) | `package.json` | ✅ | — | ✅ | — |
| `GET /api/v1/categories` 🔒 | `src/categories/` | ✅ | ✅ | ✅ | ✅ |
| `CategoriesService.ensureExists()` (validasi `categoryId` untuk Books) | `categories.service.ts` | ✅ | ✅ | ❌ (diuji lewat Books) | ✅ |

### Verifikasi

- `tsc` (termasuk `prisma/seed.ts`), oxlint, Prettier: lolos.
- `npm run db:seed` dijalankan **dua kali**: total tetap 6 kategori (tidak duplikat). Isi: Education, Fiction, History, Other, Science, Technology.
- Bruno seluruh koleksi (`01 Auth` + `02 Categories`): **19 request, 30/30 tes lolos** — list kategori, tanpa token → 401, user B mendapat daftar yang identik dengan user A.

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

## Ringkasan Progres Phase (per 2026-11-13)

| Phase (MASTER-PROMPT) | Status |
|---|---|
| 0 — Project Inspection | Completed |
| 1 — Repository Preparation | Completed (`API-CONTRACT.md` draft dan `.env.example` tersedia; `frontend/` tanggung jawab Frontend Developer) |
| 2 — Backend Setup | Completed |
| 3 — Database Design | Completed (schema, migration, seed kategori) |
| 4 — Authentication | Completed (register, login, JWT strategy/guard, `/auth/me`; diuji Bruno) |
| 5 — Book Management | Completed (CRUD, search, filter, pagination, ownership) |
| 6 — Category API | Completed (daftar kategori menunggu konfirmasi tim) |
| 7 — API Testing | Completed (Bruno: 60 request, 91 tes — auth, kategori, buku, ownership) |
| 8 — Frontend Integration | Ready (CORS aktif, API Contract lengkap); menunggu frontend |
| 9 — Finalization | Not Started |

## Urutan Pekerjaan Berikutnya (disetujui Team Lead)

1. ~~Git checkpoint~~ — selesai (`c199414`, `d63e9eb`, `760f138`)
2. ~~Stabilize & Verify Register~~ — selesai (`23b46d2`, `3d86dfa`, `d10892e`, `1331099`)
3. ~~Register Testing via Bruno~~ — selesai (`99f3d56`)
4. ~~Login, JwtStrategy, JwtAuthGuard, `/auth/me`~~ — selesai (`e5256a1`, `d3893c8`, `d827a12`)
5. ~~Category API (sebelum Book Management)~~ — selesai (`88409d0`, `e602b86`, `727ff1a`)
6. ~~Book Management~~ — selesai (`153469f`, `9850c76`)

## 2026-11-13 — README Backend

**Commit:** `2ee506b` `docs(backend): replace scaffold README with setup and usage guide` (branch `feature/backend-books`)

README bawaan scaffold NestJS diganti dengan panduan: prasyarat, instalasi (env, database, migration, seed), daftar script, endpoint, cara menjalankan Bruno, struktur proyek, aturan keamanan. Langkah yang terdokumentasi diverifikasi: `npm run db:migrate` (tidak ada migration tertunda), `npm run db:seed`, dan aplikasi tetap start tanpa variabel `OBSERVE_*`.

## 2026-11-13 — Perbaikan E2E Test dan Penghapusan Endpoint Hello World

**Pelaksana:** Panji
**Branch:** `feature/backend-books`
**Commit:**
- `2fcaa53` `refactor(backend): extract global app configuration into configureApp`
- `6b60c76` `refactor(backend): remove scaffold Hello World endpoint`
- `3aba2cf` `test(e2e): replace scaffold test with end-to-end API suite`

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

## Pekerjaan Tersisa (belum disetujui sebagai urutan resmi)

- Keputusan tim: daftar kategori final; apakah `GET /categories` perlu publik.
- Remote GitHub, push, dan Pull Request bertahap: `feature/backend-setup` → `feature/backend-auth` → `feature/backend-categories` → `feature/backend-books` → `main`.
- Finalisasi: evaluasi ObserveModule (isu #8 — saat ini aktif mengirim telemetri dari server lokal), rate limiting login, unit test (opsional).
