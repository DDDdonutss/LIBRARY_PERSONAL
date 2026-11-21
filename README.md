# Personal Library Management

Aplikasi web untuk mengelola koleksi buku pribadi dengan dukungan banyak akun. Setiap pengguna dapat mendaftar, login, lalu menambah, melihat, mengubah, menghapus, mencari, dan memfilter buku miliknya sendiri serta memperbarui status membacanya.

## Technology Stack

| Layer | Teknologi |
|---|---|
| Frontend | Next.js 16 (App Router, React 19, TypeScript, Tailwind CSS 4) |
| Backend | NestJS 12 (REST API) |
| Database | PostgreSQL |
| ORM | Prisma 7 |
| Authentication | JWT |
| API Testing | Bruno, Vitest (e2e dan unit test), GitHub Actions (CI) |

## Project Status

| Bagian | Status |
|---|---|
| Backend | ✅ Selesai untuk scope PRD v1.6 (termasuk `GET /books/stats` untuk dashboard) — semua endpoint diimplementasikan dan diuji |
| Frontend | ✅ Semua halaman selesai (issue #29–#34): daftar akun, masuk, keluar, kelola buku (cari, filter, pindah halaman, ubah status), dan dashboard. `npm run lint` dan `npm run build` lolos |
| Integrasi frontend–backend | ✅ Alur lengkap diuji di browser terhadap backend dan database lokal, termasuk isolasi data antar-akun dan penanganan error |

Rincian progres dan bukti pengujian: [`docs/IMPLEMENTATION-LOG.md`](docs/IMPLEMENTATION-LOG.md).

## Project Structure

```text
personal-library-management/
├── backend/   # REST API NestJS — lihat backend/README.md
├── frontend/  # Aplikasi Next.js — lihat frontend/README.md
└── docs/      # Dokumentasi proyek
```

## Quick Start (Backend)

Prasyarat: Node.js 22.12+, PostgreSQL 14+.

```bash
git clone https://github.com/DDDdonutss/LIBRARY_PERSONAL.git
cd LIBRARY_PERSONAL/backend
npm install
cp .env.example .env          # lalu isi DATABASE_URL dan JWT_SECRET
npm run db:migrate
npm run db:seed
npm run start:dev
```

API tersedia di `http://localhost:3001/api/v1`. Panduan lengkap (termasuk pembuatan database dan pengujian): [`backend/README.md`](backend/README.md).

## Quick Start (Frontend)

Jalankan backend lebih dulu, lalu dari terminal kedua:

```bash
cd LIBRARY_PERSONAL/frontend
npm install
cp .env.example .env.local    # berisi NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
npm run dev
```

Buka `http://localhost:3000` (port ini wajib karena CORS backend hanya mengizinkannya). Panduan lengkap: [`frontend/README.md`](frontend/README.md).

## Dokumentasi

| Dokumen | Isi |
|---|---|
| [`docs/PRD.md`](docs/PRD.md) | Kebutuhan produk, aturan bisnis, scope |
| [`docs/API-CONTRACT.md`](docs/API-CONTRACT.md) | Kontrak REST API untuk frontend |
| [`docs/JOBDESK-PANJI.md`](docs/JOBDESK-PANJI.md) | Tanggung jawab backend, database, dan integrasi |
| [`docs/IMPLEMENTATION-LOG.md`](docs/IMPLEMENTATION-LOG.md) | Riwayat implementasi, verifikasi, dan keputusan teknis |


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
