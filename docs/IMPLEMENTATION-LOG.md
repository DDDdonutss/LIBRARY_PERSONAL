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
| JwtModule | `backend/src/auth/auth.module.ts` | ✅ | ✅ | ❌ | ✅ ¹ |
| RegisterDto, LoginDto | `backend/src/auth/dto/` | ✅ | ✅ | ⚠️ ² | ✅ |
| Global ValidationPipe | `backend/src/main.ts` | ✅ | ✅ | ✅ ² | ✅ |
| `AuthService.register()` + `POST /api/v1/auth/register` | `backend/src/auth/` | ✅ | ✅ | ⚠️ ² | ✅ ¹ |

¹ Diperbarui setelah perbaikan isu #1–#5 (lihat entri "Stabilize & Verify Register").
² Hanya kasus input invalid (400) yang sudah diuji. Register sukses (201) dan email duplikat (409) menunggu uji Bruno.
| `*.tsbuildinfo` dan Prisma client hasil generate di-ignore | `backend/.gitignore` | ✅ | — | — | — |

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
| 2 | Race condition register: duplikat bersamaan menghasilkan error Prisma `P2002` → 500, seharusnya 409 | `auth.service.ts` | ✅ Fixed — `23b46d2` (lolos type-check; uji runtime request bersamaan belum dilakukan) |
| 3 | `JWT_SECRET` tidak divalidasi saat startup; `expiresIn` hard-coded `'1d'`, belum memakai `JWT_EXPIRES_IN` | `auth.module.ts` | ✅ Closed — `3d86dfa` |
| 4 | Base path `/api/v1` belum diterapkan (endpoint saat ini `/auth/register`) | `main.ts` | ✅ Closed — `3d86dfa` |
| 5 | Port default 3000, dokumen menetapkan 3001; `PORT` tidak ada di `.env` | `main.ts`, `.env` | ✅ Closed — `3d86dfa` (default 3001; `PORT` di `.env` opsional) |
| 6 | `.env.example` belum ada | `backend/` | ❌ Open |
| 7 | Tidak ada script `prisma generate` — clone baru gagal build karena client hasil generate di-ignore | `package.json` | ❌ Open |
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

- Register sukses (201) dan email duplikat (409) — menunggu uji Bruno.
- Jalur `P2002` saat request bersamaan — belum diuji runtime.

### Catatan

- Path di luar `/api/v1` mengembalikan 404 berupa HTML bawaan Express, bukan JSON. Tidak berdampak selama frontend memakai base URL `http://localhost:3001/api/v1`; perlu dicatat di API Contract.

---

## Ringkasan Progres Phase (per 2026-11-13)

| Phase (MASTER-PROMPT) | Status |
|---|---|
| 0 — Project Inspection | Completed |
| 1 — Repository Preparation | Partially Completed (belum ada `API-CONTRACT.md`, `.env.example`) |
| 2 — Backend Setup | Completed, Needs Review (isu #7) |
| 3 — Database Design | Partially Completed (seed kategori belum) |
| 4 — Authentication | Partially Completed (register sudah distabilkan, menunggu uji Bruno; login, JWT strategy/guard, `/auth/me` belum) |
| 5 — Book Management | Not Started |
| 6 — Category API | Not Started |
| 7 — API Testing | Not Started |
| 8 — Frontend Integration | Not Started |
| 9 — Finalization | Not Started |

## Urutan Pekerjaan Berikutnya (disetujui Team Lead)

1. ~~Git checkpoint~~ — selesai (`c199414`, `d63e9eb`, `760f138`)
2. ~~Stabilize & Verify Register~~ — selesai (`23b46d2`, `3d86dfa`, `d10892e`); isu #6 dan #7 masih terbuka
3. Register Testing via Bruno ← **berikutnya**
4. Login, JwtStrategy, JwtAuthGuard, `/auth/me`
5. Category API (sebelum Book Management)
6. Book Management
