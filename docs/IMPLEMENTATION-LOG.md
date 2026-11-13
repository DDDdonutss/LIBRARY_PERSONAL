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
**Commit:** belum di-commit (masih di working tree `main`)

### Dikerjakan

| Pekerjaan | File | W | C | T | S |
|---|---|---|---|---|---|
| Dependensi (Prisma 7.10.1, adapter-pg, @nestjs/jwt, passport-jwt, bcrypt, class-validator) | `backend/package.json` | ✅ | ✅ | — | — |
| Prisma config | `backend/prisma7.config.ts` | ✅ | ✅ | — | — |
| Prisma schema (User, Book, Category, enum `BookStatus`) | `backend/prisma/schema.prisma` | ✅ | ✅ | — | ✅ |
| Initial migration `20261113060551_init` | `backend/prisma/migrations/` | ✅ | ✅ | — | ✅ |
| PrismaService + PrismaModule (global) | `backend/src/prisma/` | ✅ | ✅ | ❌ | ✅ |
| JwtModule | `backend/src/auth/auth.module.ts` | ✅ | ✅ | ❌ | ⚠️ |
| RegisterDto, LoginDto | `backend/src/auth/dto/` | ✅ | ✅ | ❌ | ✅ |
| Global ValidationPipe | `backend/src/main.ts` | ✅ | ✅ | ❌ | ✅ |
| `AuthService.register()` + `POST /auth/register` | `backend/src/auth/` | ✅ | ✅ | ❌ | ⚠️ |
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

### Hasil Security Review (2026-11-13) — isu terbuka

| # | Isu | Lokasi | Status |
|---|---|---|---|
| 1 | Password > 72 byte melempar 409 (`ConflictException`), seharusnya 400 | `auth.service.ts` | ❌ Open |
| 2 | Race condition register: duplikat bersamaan menghasilkan error Prisma `P2002` → 500, seharusnya 409 | `auth.service.ts` | ❌ Open |
| 3 | `JWT_SECRET` tidak divalidasi saat startup; `expiresIn` hard-coded `'1d'`, belum memakai `JWT_EXPIRES_IN` | `auth.module.ts` | ❌ Open |
| 4 | Base path `/api/v1` belum diterapkan (endpoint saat ini `/auth/register`) | `main.ts` | ❌ Open |
| 5 | Port default 3000, dokumen menetapkan 3001; `PORT` tidak ada di `.env` | `main.ts`, `.env` | ❌ Open |
| 6 | `.env.example` belum ada | `backend/` | ❌ Open |
| 7 | Tidak ada script `prisma generate` — clone baru gagal build karena client hasil generate di-ignore | `package.json` | ❌ Open |
| 8 | ObserveModule (telemetri eksternal, fallback secret placeholder) | `app.module.ts` | ⏸️ Dipertahankan sementara, dievaluasi saat finalisasi (keputusan Team Lead 2026-11-13) |
| 9 | BOM (byte order mark) di 6 file dan line ending CRLF | `main.ts`, `src/auth/**` | ❌ Open (kosmetik) |

---

## Ringkasan Progres Phase (per 2026-11-13)

| Phase (MASTER-PROMPT) | Status |
|---|---|
| 0 — Project Inspection | Completed |
| 1 — Repository Preparation | Partially Completed (belum ada `API-CONTRACT.md`, `.env.example`) |
| 2 — Backend Setup | Completed, Needs Review (isu #3, #5, #7) |
| 3 — Database Design | Partially Completed (seed kategori belum) |
| 4 — Authentication | Partially Completed (register ditulis, belum diuji; login, JWT strategy/guard, `/auth/me` belum) |
| 5 — Book Management | Not Started |
| 6 — Category API | Not Started |
| 7 — API Testing | Not Started |
| 8 — Frontend Integration | Not Started |
| 9 — Finalization | Not Started |

## Urutan Pekerjaan Berikutnya (disetujui Team Lead)

1. Git checkpoint
2. Stabilize & Verify Register (isu #1–#7)
3. Register Testing via Bruno
4. Login, JwtStrategy, JwtAuthGuard, `/auth/me`
5. Category API (sebelum Book Management)
6. Book Management
