# Personal Library Management

Aplikasi web untuk mengelola koleksi buku pribadi dengan dukungan banyak akun. Setiap pengguna dapat mendaftar, login, lalu menambah, melihat, mengubah, menghapus, mencari, dan memfilter buku miliknya sendiri serta memperbarui status membacanya.

## Technology Stack

| Layer | Teknologi |
|---|---|
| Frontend | Next.js |
| Backend | NestJS 12 (REST API) |
| Database | PostgreSQL |
| ORM | Prisma 7 |
| Authentication | JWT |
| API Testing | Bruno, Vitest e2e |

## Project Status

| Bagian | Status |
|---|---|
| Backend | ✅ Selesai untuk scope PRD v1.1 — semua endpoint diimplementasikan dan diuji |
| Frontend | ⏳ Belum dimulai (tanggung jawab Frontend Developer) |
| Integrasi frontend–backend | ⏳ Backend siap (CORS, API Contract) |

Rincian progres dan bukti pengujian: [`docs/IMPLEMENTATION-LOG.md`](docs/IMPLEMENTATION-LOG.md).

## Project Structure

```text
personal-library-management/
├── backend/   # REST API NestJS — lihat backend/README.md
├── frontend/  # Aplikasi Next.js (belum dibuat)
└── docs/      # Dokumentasi proyek
```

## Quick Start (Backend)

Prasyarat: Node.js 22.12+, PostgreSQL 14+.

```bash
git clone https://github.com/DDDdonutss/PENYIMPAN_BUKU.git
cd PENYIMPAN_BUKU/backend
npm install
cp .env.example .env          # lalu isi DATABASE_URL dan JWT_SECRET
npm run db:migrate
npm run db:seed
npm run start:dev
```

API tersedia di `http://localhost:3001/api/v1`. Panduan lengkap (termasuk pembuatan database dan pengujian): [`backend/README.md`](backend/README.md).

## Dokumentasi

| Dokumen | Isi |
|---|---|
| [`docs/PRD.md`](docs/PRD.md) | Kebutuhan produk, aturan bisnis, scope |
| [`docs/API-CONTRACT.md`](docs/API-CONTRACT.md) | Kontrak REST API untuk frontend |
| [`docs/JOBDESK-PANJI.md`](docs/JOBDESK-PANJI.md) | Tanggung jawab backend, database, dan integrasi |
| [`docs/IMPLEMENTATION-LOG.md`](docs/IMPLEMENTATION-LOG.md) | Riwayat implementasi, verifikasi, dan keputusan teknis |
| [`docs/MASTER-PROMPT.md`](docs/MASTER-PROMPT.md) | Panduan teknis dan alur kerja pengembangan |

## Alur Kontribusi

1. Buat branch dari `main` (mis. `feature/frontend-books`).
2. Commit perubahan yang fokus pada satu tugas.
3. Push branch dan buat Pull Request ke `main`.
4. Merge setelah direview Team Lead, dengan **"Create a merge commit"**.

Jangan commit file `.env`. Perubahan kontrak API wajib diinformasikan ke tim dan dicatat di `docs/API-CONTRACT.md`.

## Team

| Peran | Anggota |
|---|---|
| Team Lead, Backend, Database, Integration | Panji |
| Frontend Developer | X |
