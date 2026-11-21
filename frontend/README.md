# Personal Library Management — Frontend

Website Next.js untuk Personal Library Management. Semua data diambil dari backend REST API di folder `backend/`.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · ESLint

Kontrak API yang dipakai: [`docs/API-CONTRACT.md`](../docs/API-CONTRACT.md).

---

## 1. Prasyarat

| Kebutuhan | Keterangan |
|---|---|
| Node.js | 22.12 atau lebih baru (sama dengan backend) |
| Backend | Berjalan di `http://localhost:3001`. Lihat [`backend/README.md`](../backend/README.md) |

## 2. Menjalankan

Semua perintah dijalankan di folder `frontend/`.

```bash
npm install
cp .env.example .env.local      # Git Bash / macOS / Linux
copy .env.example .env.local    # Command Prompt / PowerShell
npm run dev
```

Buka **`http://localhost:3000`** (bukan `127.0.0.1:3000`).

- Jalankan backend lebih dulu. Backend hanya menerima request dari `http://localhost:3000` (CORS).
- Bila port 3000 sedang dipakai, Next.js pindah ke port lain dan request-nya ditolak backend. Hentikan dulu program yang memakai port 3000.

| Variabel (`.env.local`) | Keterangan |
|---|---|
| `NEXT_PUBLIC_API_URL` | Alamat backend, mis. `http://localhost:3001/api/v1`. Awalan `NEXT_PUBLIC_` wajib agar terbaca di browser. Nilainya ditanam saat `npm run dev`/`npm run build`, jadi jalankan ulang setelah mengubahnya |

`.env.local` tidak di-commit; yang di-commit hanya `.env.example`.

## 3. Script

| Script | Fungsi |
|---|---|
| `npm run dev` | Server pengembangan di port 3000 |
| `npm run build` | Build produksi, termasuk pemeriksaan TypeScript |
| `npm run start` | Menjalankan hasil build |
| `npm run lint` | ESLint (aturan Next.js, React Hooks, dan TypeScript) |

## 4. Pengujian

Frontend belum punya tes otomatis. Sebelum membuat PR, jalankan `npm run lint` dan `npm run build`.

> Next.js mengirim telemetri anonim saat `dev` dan `build`. Untuk mematikannya: `npx next telemetry --disable` (berlaku untuk semua project Next.js di komputer itu), atau set environment variable `NEXT_TELEMETRY_DISABLED=1`.
