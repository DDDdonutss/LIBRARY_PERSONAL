# API Contract
# Personal Library Management — Backend REST API

**Status:** Draft — diperbarui setiap kali endpoint selesai diimplementasikan dan diuji.
**Pemilik:** Panji (Backend). Perubahan kontrak wajib diinformasikan ke Frontend Developer.

Setiap endpoint di dokumen ini sudah **diimplementasikan dan lolos uji** koleksi Bruno di `backend/bruno/`, kecuali ditandai lain.

---

## 1. Konvensi Umum

### 1.1 Base URL

| Lingkungan | Base URL |
|---|---|
| Lokal | `http://localhost:3001/api/v1` |

Semua path di bawah ini **relatif terhadap base URL**. Contoh: `POST /auth/register` → `POST http://localhost:3001/api/v1/auth/register`.

Path di luar `/api/v1` tidak dilayani dan mengembalikan 404 berupa HTML bawaan Express (bukan JSON). Pastikan frontend selalu memakai base URL di atas.

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
| `name` | string | Wajib, tidak kosong, maks. 100 karakter |
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

*Belum diimplementasikan.*

## 4. Books

*Belum diimplementasikan.*

---

## Riwayat Perubahan

| Tanggal | Perubahan |
|---|---|
| 2026-11-13 | Draft awal: konvensi umum, `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
