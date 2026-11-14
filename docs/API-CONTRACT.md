# API Contract
# Personal Library Management — Backend REST API

**Status:** Lengkap untuk scope PRD v1.0 — diperbarui setiap kali endpoint berubah.
**Pemilik:** Panji (Backend). Perubahan kontrak wajib diinformasikan ke Frontend Developer.

Setiap endpoint di dokumen ini sudah **diimplementasikan dan lolos uji** koleksi Bruno (`backend/bruno/`, 60 request / 91 tes) dan e2e test (`npm run test:e2e`, 26 tes), kecuali ditandai lain.

---

## 1. Konvensi Umum

### 1.1 Base URL

| Lingkungan | Base URL |
|---|---|
| Lokal | `http://localhost:3001/api/v1` |

Semua path di bawah ini **relatif terhadap base URL**. Contoh: `POST /auth/register` → `POST http://localhost:3001/api/v1/auth/register`.

Path di luar `/api/v1` tidak dilayani dan mengembalikan 404 berupa HTML bawaan Express (bukan JSON). Path di bawah `/api/v1` yang tidak terdaftar — termasuk `GET /api/v1` itu sendiri — mengembalikan 404 berformat JSON (§1.5). Pastikan frontend selalu memakai base URL di atas.

### 1.2 Format

- Request dan response memakai JSON: header `Content-Type: application/json`.
- Tanggal dalam format ISO 8601 UTC, mis. `"2026-11-13T08:15:30.123Z"`.
- ID memakai UUID.

### 1.3 Autentikasi

Endpoint bertanda 🔒 membutuhkan header:

```
Authorization: Bearer <accessToken>
```

- `accessToken` didapat dari response register atau login.
- Masa berlaku token default **1 hari** (`JWT_EXPIRES_IN`). Tidak ada refresh token.
- **Logout** dilakukan di frontend dengan menghapus token yang disimpan. Tidak ada endpoint logout (PRD §7, Logout Rule).
- Token hilang, rusak, palsu, kedaluwarsa, atau milik user yang sudah tidak ada → `401`.

### 1.4 CORS

Origin yang diizinkan diatur lewat `CORS_ORIGIN` (default `http://localhost:3000`). Request dari origin lain diblokir oleh browser.

### 1.5 Format Error

Semua error memakai format bawaan NestJS:

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": ["email must be an email", "password must be longer than or equal to 8 characters"]
}
```

| Field | Keterangan |
|---|---|
| `statusCode` | Kode HTTP |
| `error` | Nama status HTTP (bisa tidak ada pada 401 dari guard) |
| `message` | **Array of string** untuk error validasi DTO; **string** untuk error lain |

Frontend sebaiknya menangani `message` sebagai string **atau** array.

| Status | Kapan |
|---|---|
| `200 OK` | Berhasil (GET, login, PATCH, DELETE) |
| `201 Created` | Resource baru dibuat (register) |
| `400 Bad Request` | Input tidak valid, field tidak dikenal, ID bukan UUID |
| `401 Unauthorized` | Belum login / token tidak valid / kredensial salah |
| `404 Not Found` | Resource tidak ada atau bukan milik user |
| `409 Conflict` | Data bentrok (email sudah terdaftar) |
| `500 Internal Server Error` | Kesalahan server yang tidak terduga |

### 1.6 Field Tidak Dikenal

Body yang memuat field di luar yang didokumentasikan **ditolak dengan 400** (`property <nama> should not exist`). Contoh: mengirim `userId` saat register.

---

## 2. Auth

### 2.1 `POST /auth/register`

Membuat akun baru dan langsung mengembalikan token (user tidak perlu login ulang).

**Request body**

| Field | Tipe | Aturan |
|---|---|---|
| `name` | string | Wajib, tidak kosong, maks. 100 karakter. Spasi di awal/akhir dihapus sebelum disimpan (⚠️ nama berisi spasi saja saat ini masih diterima — akan diperbaiki; frontend sebaiknya ikut memvalidasi) |
| `email` | string | Wajib, format email valid, maks. 255 karakter. Disimpan dalam huruf kecil |
| `password` | string | Wajib, 8–72 karakter **dan** maks. 72 byte UTF-8 (batas bcrypt) |

```json
{
  "name": "Panji",
  "email": "panji@example.com",
  "password": "password123"
}
```

**Response `201 Created`**

```json
{
  "message": "Registrasi berhasil",
  "user": {
    "id": "6f1c2b8e-1d2a-4c3b-9e8f-0a1b2c3d4e5f",
    "name": "Panji",
    "email": "panji@example.com",
    "createdAt": "2026-11-13T08:15:30.123Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error**

| Status | Kondisi | `message` |
|---|---|---|
| 400 | Validasi DTO gagal / field tidak dikenal | array pesan validasi |
| 400 | Password > 72 byte | `"Password melebihi batas ukuran yang didukung"` |
| 409 | Email sudah terdaftar (tidak peka huruf besar/kecil) | `"Email sudah terdaftar"` |

### 2.2 `POST /auth/login`

**Request body**

| Field | Tipe | Aturan |
|---|---|---|
| `email` | string | Wajib, format email valid. Tidak peka huruf besar/kecil |
| `password` | string | Wajib, maks. 72 karakter |

```json
{
  "email": "panji@example.com",
  "password": "password123"
}
```

**Response `200 OK`** — bentuk sama dengan register:

```json
{
  "message": "Login berhasil",
  "user": {
    "id": "6f1c2b8e-1d2a-4c3b-9e8f-0a1b2c3d4e5f",
    "name": "Panji",
    "email": "panji@example.com",
    "createdAt": "2026-11-13T08:15:30.123Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error**

| Status | Kondisi | `message` |
|---|---|---|
| 400 | Validasi DTO gagal | array pesan validasi |
| 401 | Email tidak terdaftar **atau** password salah | `"Email atau password salah"` (sengaja sama) |

### 2.3 `GET /auth/me` 🔒

Mengembalikan data user yang sedang login. Cocok dipanggil saat aplikasi dibuka untuk mengecek apakah token tersimpan masih berlaku.

**Response `200 OK`**

```json
{
  "id": "6f1c2b8e-1d2a-4c3b-9e8f-0a1b2c3d4e5f",
  "name": "Panji",
  "email": "panji@example.com",
  "createdAt": "2026-11-13T08:15:30.123Z"
}
```

**Error**

| Status | Kondisi |
|---|---|
| 401 | Token tidak ada, rusak, palsu, kedaluwarsa, atau user sudah tidak ada |

---

## 3. Categories

Kategori bersifat **global**: daftar yang sama untuk semua user, disediakan lewat seed database (`npm run db:seed`). User tidak dapat membuat, mengubah, atau menghapus kategori.

Daftar awal (usulan PRD §4.3, dapat diubah di `backend/prisma/seed.ts`): `Fiction`, `Science`, `Technology`, `History`, `Education`, `Other`.

### 3.1 `GET /categories` 🔒

**Response `200 OK`** — array, diurutkan berdasarkan `name` (A–Z):

```json
[
  { "id": "0b6f1f0e-8d2c-4c8a-9a4e-3f1d2c5b7a90", "name": "Education" },
  { "id": "5d1e7c3a-2b4f-4e6d-8c9a-1f2e3d4c5b6a", "name": "Fiction" },
  { "id": "9a8b7c6d-5e4f-4a3b-2c1d-0e9f8a7b6c5d", "name": "History" },
  { "id": "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d", "name": "Other" },
  { "id": "2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e", "name": "Science" },
  { "id": "3c4d5e6f-7a8b-4c9d-0e1f-2a3b4c5d6e7f", "name": "Technology" }
]
```

ID di atas hanya contoh; ID sebenarnya dibuat saat seed dan berbeda di setiap database. Frontend harus mengambil ID dari endpoint ini, bukan menulisnya secara hard-code.

**Error**

| Status | Kondisi |
|---|---|
| 401 | Token tidak ada atau tidak valid |

## 4. Books

Semua endpoint buku 🔒 membutuhkan login. Setiap user **hanya** dapat melihat dan mengelola bukunya sendiri; pemilik buku ditentukan dari token, bukan dari body request.

Buku milik user lain diperlakukan **sama dengan buku yang tidak ada** (`404`), sehingga frontend tidak bisa mengetahui keberadaan buku user lain.

### 4.1 Objek Book

```json
{
  "id": "a3f1c2d4-5b6e-4f70-8a91-b2c3d4e5f607",
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "status": "READING",
  "categoryId": "2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e",
  "category": { "id": "2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e", "name": "Science" },
  "createdAt": "2026-11-13T08:20:00.000Z",
  "updatedAt": "2026-11-13T08:25:00.000Z"
}
```

| Field | Tipe | Keterangan |
|---|---|---|
| `status` | enum | `WANT_TO_READ` (ingin dibaca), `READING` (sedang dibaca), `COMPLETED` (selesai) |
| `categoryId` | UUID \| `null` | `null` bila buku tanpa kategori |
| `category` | object \| `null` | `{ id, name }` kategori, atau `null` |

`userId` tidak disertakan di response.

### 4.2 Aturan Validasi Body

| Field | Create | Update | Aturan |
|---|---|---|---|
| `title` | Wajib | Opsional | String, tidak kosong setelah spasi awal/akhir dihapus, maks. 200 karakter. Spasi awal/akhir otomatis dihapus |
| `author` | Wajib | Opsional | String, tidak kosong, maks. 150 karakter. Spasi awal/akhir otomatis dihapus |
| `status` | Opsional (default `WANT_TO_READ`) | Opsional | Salah satu nilai enum |
| `categoryId` | Opsional | Opsional | UUID kategori yang ada (dari `GET /categories`), atau `null` untuk tanpa kategori |

- Pada **update**, field yang tidak dikirim tidak berubah. `title`, `author`, dan `status` **tidak boleh `null`**. Kirim `"categoryId": null` untuk menghapus kategori dari buku.
- Field lain (termasuk `userId`) ditolak dengan 400.

### 4.3 `POST /books` 🔒

```json
{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "status": "READING",
  "categoryId": "2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e"
}
```

**Response `201 Created`**: objek Book (§4.1).

### 4.4 `GET /books` 🔒

**Query parameter** (semua opsional, dapat digabung; filter digabung dengan logika AND)

| Parameter | Tipe | Default | Aturan |
|---|---|---|---|
| `page` | integer | `1` | ≥ 1 |
| `limit` | integer | `10` | 1–100 |
| `search` | string | — | Cari di **judul**, tidak peka huruf besar/kecil, cocok sebagian (`clean` cocok dengan "Clean Code"). Maks. 200 karakter |
| `status` | enum | — | `WANT_TO_READ`, `READING`, atau `COMPLETED` |
| `categoryId` | UUID | — | ID kategori |

Contoh: `GET /books?page=1&limit=10&search=clean&status=READING`

**Response `200 OK`** — diurutkan dari yang **terbaru** dibuat:

```json
{
  "data": [
    {
      "id": "a3f1c2d4-5b6e-4f70-8a91-b2c3d4e5f607",
      "title": "Clean Code",
      "author": "Robert C. Martin",
      "status": "READING",
      "categoryId": "2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e",
      "category": { "id": "2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e", "name": "Science" },
      "createdAt": "2026-11-13T08:20:00.000Z",
      "updatedAt": "2026-11-13T08:25:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

- `total`: jumlah seluruh buku yang cocok dengan filter (bukan hanya halaman ini).
- `page` melebihi `totalPages` → `200` dengan `data: []`.
- Bila tidak ada buku, `totalPages` bernilai `0`.

### 4.5 `GET /books/:id` 🔒

**Response `200 OK`**: objek Book (§4.1).

### 4.6 `PATCH /books/:id` 🔒

Kirim hanya field yang ingin diubah. Contoh mengubah status membaca:

```json
{ "status": "COMPLETED" }
```

**Response `200 OK`**: objek Book setelah diubah.

### 4.7 `DELETE /books/:id` 🔒

**Response `200 OK`**

```json
{
  "message": "Buku berhasil dihapus",
  "id": "a3f1c2d4-5b6e-4f70-8a91-b2c3d4e5f607"
}
```

### 4.8 Error Endpoint Books

| Status | Kondisi | `message` |
|---|---|---|
| 400 | Validasi body/query gagal, field tidak dikenal | array pesan validasi |
| 400 | `:id` bukan UUID | `"Validation failed (uuid is expected)"` |
| 400 | `categoryId` berformat UUID tetapi kategorinya tidak ada | `"Kategori tidak ditemukan"` |
| 400 | `PATCH` dengan body kosong `{}` | `"Tidak ada data yang diubah"` |
| 401 | Token tidak ada atau tidak valid | `"Unauthorized"` |
| 404 | Buku tidak ada **atau milik user lain** | `"Buku tidak ditemukan"` |

---

## Riwayat Perubahan

| Tanggal | Perubahan |
|---|---|
| 2026-11-13 | Draft awal: konvensi umum, `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| 2026-11-13 | Tambah `GET /categories` |
| 2026-11-13 | Tambah endpoint Books: CRUD, search, filter, pagination |
| 2026-11-13 | Endpoint bawaan `GET /api/v1` ("Hello World") dihapus; catatan pengujian e2e; catatan validasi `name` |
