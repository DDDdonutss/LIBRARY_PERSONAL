# Personal Library Management — Frontend

Website Next.js untuk Personal Library Management: daftar akun, masuk, kelola koleksi buku (cari, filter, pindah halaman, ubah status), dan dashboard ringkasan. Semua data diambil dari backend REST API di folder `backend/`.

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

## 4. Halaman

| Alamat | Halaman | Butuh login |
|---|---|---|
| `/` | Mengarahkan ke `/books` atau `/login` | — |
| `/register` | Daftar akun; setelah berhasil langsung masuk | Tidak |
| `/login` | Masuk | Tidak |
| `/books` | Daftar buku: cari judul, filter status dan kategori, pindah halaman, ganti status | Ya |
| `/books/new` | Tambah buku | Ya |
| `/books/[id]` | Detail, ubah, dan hapus buku | Ya |
| `/dashboard` | Total buku, jumlah per status, dan jumlah per kategori | Ya |

## 5. Struktur

```text
frontend/
├── app/
│   ├── layout.tsx         # Root layout: judul, bahasa, font
│   ├── page.tsx           # / → /books atau /login
│   ├── login/             # Halaman Masuk
│   ├── register/          # Halaman Daftar Akun
│   └── (app)/             # Halaman yang butuh login; folder berkurung tidak ikut menjadi alamat
│       ├── layout.tsx     # Cek token + GET /auth/me + header
│       ├── books/         # Daftar (page.tsx), tambah (new/), detail-ubah-hapus ([id]/)
│       └── dashboard/     # Ringkasan dari GET /books/stats
├── components/            # AppHeader, AuthCard, BookForm, ErrorAlert
└── lib/
    ├── api.ts             # Satu-satunya pemanggil API + fungsi per endpoint
    ├── auth.ts            # Token di localStorage (useToken)
    ├── types.ts           # Bentuk data sesuai API Contract
    ├── labels.ts          # Label status: Ingin dibaca, Sedang dibaca, Selesai dibaca
    ├── validation.ts      # Validasi form (aturan sama dengan backend)
    ├── useCategories.ts   # GET /categories
    ├── format.ts          # Tanggal UTC → waktu lokal
    └── ui.ts              # Kelas Tailwind yang dipakai berulang
```

## 6. Aturan Penting

- Token disimpan di `localStorage`, tidak pernah di URL; password tidak pernah disimpan. Keluar = hapus token (backend tidak punya endpoint logout).
- Respons 401 dari endpoint selain login → token dihapus dan pengguna dibawa ke `/login`. 401 dari login berarti email atau password salah.
- Body request hanya berisi field yang ada di kontrak. Ubah buku (`PATCH`) hanya mengirim field yang berubah, dan "Tanpa kategori" dikirim sebagai `null`.
- Parameter pencarian dan filter yang kosong tidak dikirim. Backend menolak `status=`, `categoryId=`, dan `page=` tanpa nilai (400).
- ID kategori selalu diambil dari `GET /categories`, tidak pernah ditulis di kode.
- Teks dari pengguna ditampilkan sebagai teks biasa React, tanpa `dangerouslySetInnerHTML`.

## 7. Pengujian

Frontend belum punya tes otomatis. Sebelum membuat PR, jalankan `npm run lint` dan `npm run build`, lalu uji manual:

1. Daftar akun → masuk → tambah buku → cari dan filter → ubah status → dashboard → hapus → keluar.
2. Dua akun berbeda masing-masing hanya melihat bukunya sendiri.

Hasil uji terakhir dicatat di [`docs/IMPLEMENTATION-LOG.md`](../docs/IMPLEMENTATION-LOG.md).

> Next.js mengirim telemetri anonim saat `dev` dan `build`. Untuk mematikannya: `npx next telemetry --disable` (berlaku untuk semua project Next.js di komputer itu), atau set environment variable `NEXT_TELEMETRY_DISABLED=1`.
