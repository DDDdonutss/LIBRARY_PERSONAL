# API Contract
# Personal Library Management — Backend REST API

**Status:** Lengkap untuk scope PRD v1.6 — diperbarui setiap kali endpoint berubah.
**Pemilik:** Panji (Backend). Perubahan kontrak wajib diinformasikan ke Frontend Developer.

Setiap endpoint di dokumen ini sudah **diimplementasikan dan lolos uji** koleksi Bruno (`backend/bruno/`, 82 request / 129 tes) dan e2e test (`npm run test:e2e`, 53 tes), kecuali ditandai lain; unit dan e2e test juga berjalan otomatis di CI (GitHub Actions) pada setiap pull request. Unit test (`npm test`, 74 tes) mencakup logika `GET /books/stats`, konfigurasi `JWT_EXPIRES_IN` dan rate limiting (§2.4), validasi token (§1.3), normalisasi email, batas `page`, dan pemetaan error database (§1.5).

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
- Masa berlaku token default **1 hari** (`JWT_EXPIRES_IN`; angka tanpa satuan berarti detik). Tidak ada refresh token.
- **Logout** dilakukan di frontend dengan menghapus token yang disimpan. Tidak ada endpoint logout (PRD §7, Logout Rule).
- Token hilang, rusak, palsu, kedaluwarsa, atau milik user yang sudah dihapus → `401` di **semua** endpoint 🔒 (setiap request memeriksa keberadaan user; GitHub issue #15). Belum ada fitur hapus user, sehingga kasus terakhir hanya terjadi bila user dihapus langsung di database.

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
| `201 Created` | Resource baru dibuat (register, tambah buku) |
| `400 Bad Request` | Input tidak valid, field tidak dikenal, ID bukan UUID, data terkait tidak ada |
| `401 Unauthorized` | Belum login / token tidak valid / kredensial salah |
| `404 Not Found` | Resource tidak ada atau bukan milik user |
| `409 Conflict` | Data bentrok (email sudah terdaftar) |
| `429 Too Many Requests` | Terlalu banyak percobaan login/register dalam satu menit (§2.4) |
| `500 Internal Server Error` | Kesalahan server yang tidak terduga |

Error database yang dikenali tetapi tidak ditangani endpoint secara khusus **tidak** dikembalikan sebagai 500. Pesan khusus endpoint (mis. `"Email sudah terdaftar"`, `"Buku tidak ditemukan"`) tetap didahulukan; sisanya memakai pesan umum:

| Kondisi | Status | `message` |
|---|---|---|
| Data unik bentrok | 409 | `"Data sudah ada"` |
| Data terkait (foreign key) tidak ada | 400 | `"Data terkait tidak ditemukan"` |
| Record yang dibutuhkan tidak ditemukan | 404 | `"Data tidak ditemukan"` |

### 1.6 Field Tidak Dikenal

Body yang memuat field di luar yang didokumentasikan **ditolak dengan 400** (`property <nama> should not exist`). Contoh: mengirim `userId` saat register.

---

## 2. Auth

### 2.1 `POST /auth/register`

Membuat akun baru dan langsung mengembalikan token (user tidak perlu login ulang).

**Request body**

| Field | Tipe | Aturan |
|---|---|---|
| `name` | string | Wajib, maks. 100 karakter. Spasi di awal/akhir dihapus **sebelum validasi**, sehingga nama kosong atau hanya berisi spasi ditolak 400 (`name should not be empty`) dan nama tersimpan tanpa spasi berlebih |
| `email` | string | Wajib, format email valid, maks. 255 karakter. Spasi di awal/akhir dihapus **sebelum validasi**. Disimpan dalam huruf kecil |
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
| 429 | Melebihi batas percobaan register (§2.4) | `"Terlalu banyak percobaan. Coba lagi nanti."` |

### 2.2 `POST /auth/login`

**Request body**

| Field | Tipe | Aturan |
|---|---|---|
| `email` | string | Wajib, format email valid. Spasi di awal/akhir dihapus sebelum validasi. Tidak peka huruf besar/kecil |
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
| 429 | Melebihi batas percobaan login (§2.4) | `"Terlalu banyak percobaan. Coba lagi nanti."` |

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

### 2.4 Rate Limiting Login dan Register

`POST /auth/login` dan `POST /auth/register` dibatasi **per IP**: maksimal `AUTH_RATE_LIMIT_PER_MINUTE` request per menit (default **5**), dihitung **terpisah** untuk login dan register. Request yang ditolak validasi (400) atau kredensial salah (401) tetap dihitung.

Request yang melebihi batas dijawab:

```json
{
  "statusCode": 429,
  "message": "Terlalu banyak percobaan. Coba lagi nanti."
}
```

dengan header `Retry-After` (detik sampai boleh mencoba lagi). Frontend sebaiknya menampilkan pesan ini dan tidak mencoba ulang otomatis. Endpoint lain (termasuk `GET /auth/me`) tidak dibatasi.

> Catatan: header `Retry-After` belum diizinkan lewat CORS (`Access-Control-Expose-Headers`), sehingga JavaScript di browser belum bisa membacanya (`null`). Frontend cukup menampilkan pesan dan menyarankan mencoba lagi sekitar 1 menit.

---

## 3. Categories

Kategori bersifat **global**: daftar yang sama untuk semua user, disediakan lewat seed database (`npm run db:seed`). User tidak dapat membuat, mengubah, atau menghapus kategori.

Daftar **final** (disepakati tim 2026-11-15, GitHub issue #11; PRD §4.3): `Fiction`, `Science`, `Technology`, `History`, `Education`, `Other`. Perubahan daftar ini adalah perubahan kontrak dan wajib diinformasikan ke Frontend Developer.

### 3.1 `GET /categories` 🔒

**Wajib login** (keputusan tim, issue #11). Kategori hanya dibutuhkan di form buku, sehingga frontend memanggil endpoint ini **setelah** user login. Tidak ada akses kategori sebelum login.

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
| `page` | integer | `1` | 1 – 90071992547409; di luar rentang → 400 |
| `limit` | integer | `10` | 1–100 |
| `search` | string | — | Cari di **judul**, tidak peka huruf besar/kecil, cocok sebagian (`clean` cocok dengan "Clean Code"). Karakter `%`, `_`, dan `\` dicari apa adanya (bukan wildcard). Maks. 200 karakter |
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

### 4.8 `GET /books/stats` 🔒

Ringkasan koleksi user yang sedang login, untuk halaman dashboard. Dihitung langsung di database (`GROUP BY`), sehingga frontend **tidak perlu** mengambil seluruh halaman `GET /books` untuk menghitung sendiri.

**Response `200 OK`**

```json
{
  "total": 3,
  "byStatus": { "WANT_TO_READ": 1, "READING": 1, "COMPLETED": 1 },
  "byCategory": [
    { "categoryId": "2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e", "name": "Science", "count": 2 },
    { "categoryId": null, "name": null, "count": 1 }
  ]
}
```

| Field | Tipe | Keterangan |
|---|---|---|
| `total` | integer | Jumlah seluruh buku milik user |
| `byStatus` | object | **Selalu** memuat ketiga status (`WANT_TO_READ`, `READING`, `COMPLETED`); bernilai `0` bila tidak ada buku dengan status itu |
| `byCategory` | array | Hanya kategori yang mempunyai buku; kategori tanpa buku tidak muncul. `categoryId` dan `name` **selalu sama-sama terisi atau sama-sama `null`**; entri `null` = buku tanpa kategori (paling banyak satu entri, hanya muncul bila ada). Urutan: `count` terbesar dulu; bila `count` sama, kategori bernama diurutkan `name` A–Z dan entri tanpa kategori paling akhir |

- Jumlah seluruh `count` di `byCategory` dan jumlah seluruh nilai `byStatus` keduanya **selalu** sama dengan `total`: semua angka dihitung dari satu query, sehingga tetap konsisten meski buku ditambah/dihapus bersamaan.
- Bila sebuah kategori terhapus tepat saat statistik dihitung, buku di dalamnya dihitung sebagai tanpa kategori (sesuai perilaku database: `categoryId` menjadi `null`).
- User tanpa buku → `{ "total": 0, "byStatus": { "WANT_TO_READ": 0, "READING": 0, "COMPLETED": 0 }, "byCategory": [] }`.
- Hanya buku milik user dari token yang dihitung (aturan kepemilikan yang sama dengan endpoint buku lain).
- Route ini didahulukan dari `GET /books/:id`, sehingga `stats` tidak pernah diperlakukan sebagai ID.

**Error**

| Status | Kondisi |
|---|---|
| 401 | Token tidak ada atau tidak valid |

### 4.9 Error Endpoint Books

| Status | Kondisi | `message` |
|---|---|---|
| 400 | Validasi body/query gagal, field tidak dikenal | array pesan validasi |
| 400 | `:id` bukan UUID | `"Validation failed (uuid is expected)"` |
| 400 | `categoryId` berformat UUID tetapi kategorinya tidak ada | `"Kategori tidak ditemukan"` |
| 400 | `PATCH` dengan body kosong `{}` | `"Tidak ada data yang diubah"` |
| 400 | Data terkait hilang saat buku disimpan (mis. kategori terhapus tepat saat itu) | `"Data terkait tidak ditemukan"` |
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
| 2026-11-14 | `POST /auth/register`: `name` di-trim sebelum validasi — nama berisi spasi saja kini ditolak 400 (sebelumnya diterima dan tersimpan kosong). Jumlah tes diperbarui |
| 2026-11-14 | Tambah `GET /books/stats` (§4.8) — ringkasan total, per status, per kategori untuk dashboard (permintaan mentor). Bagian error Books menjadi §4.9 |
| 2026-11-14 | §4.8 diperjelas setelah code review: jaminan konsistensi `total`, pasangan `categoryId`/`name` selalu sama-sama terisi atau `null`, aturan urutan saat `count` sama, perlakuan kategori terhapus. Bentuk response tidak berubah |
| 2026-11-15 | §3: daftar 6 kategori dinyatakan **final** dan `GET /categories` tetap wajib login (keputusan tim, issue #11). Endpoint dan bentuk response tidak berubah |
| 2026-11-17 | Hardening hasil audit (issue #22): `JWT_EXPIRES_IN` tanpa satuan = detik (§1.3); error database yang tidak ditangani → 409/400/404, bukan 500 (§1.5, §4.9); email di-trim sebelum validasi (§2.1, §2.2); batas atas `page` dan pencarian literal untuk `%`, `_`, `\` (§4.4). §1.3 diperbaiki agar sesuai implementasi untuk token milik user yang sudah dihapus (keputusan akhir di issue #15). Endpoint dan bentuk response sukses tidak berubah; jumlah tes diperbarui |
| 2026-11-17 | Token milik user yang sudah dihapus → 401 di semua endpoint 🔒 (issue #15, opsi a; §1.3, §4.9). Batas atas `page` menjadi 90071992547409 agar offset selalu tepat (§4.4). Bentuk response sukses tidak berubah; jumlah tes diperbarui |
| 2026-11-17 | Rate limiting login dan register per IP (issue #14): status 429 dengan `Retry-After` (§1.5, §2.1, §2.2, §2.4). Bentuk response sukses tidak berubah; jumlah tes diperbarui |
| 2026-11-17 | Tidak ada perubahan endpoint. Jumlah tes diperbarui dan CI GitHub Actions ditambahkan (issue #23) |
| 2026-11-17 | §2.4: catatan bahwa `Retry-After` belum terbaca oleh JavaScript di browser (CORS). Tidak ada perubahan endpoint |
