# Jobdesk Panji
# Backend, Database & Integration Developer

**Project:** Personal Library Management  
**Version:** 1.0  
**Status:** Final — Baseline Tanggung Jawab  
**Role:** Team Lead, Backend Developer, Database Developer, Integration Developer

---

## 1. Role Overview

Panji bertanggung jawab terhadap pengembangan backend, database, autentikasi, API, dan integrasi sistem Personal Library Management.

Panji juga bertanggung jawab mengoordinasikan pekerjaan tim, memastikan implementasi mengikuti PRD, dan menjaga agar integrasi frontend dan backend berjalan sesuai kontrak API.

## 2. Main Responsibilities

### A. Backend Development
Mengembangkan backend menggunakan NestJS.

Tanggung jawab:
- Inisialisasi proyek NestJS.
- Mengatur struktur module.
- Membuat controller dan service.
- Membuat REST API.
- Mengimplementasikan DTO.
- Mengatur validasi request.
- Menangani error dan exception.
- Menjaga konsistensi respons API.

### B. Database Development
Mengelola PostgreSQL dan Prisma.

Tanggung jawab:
- Menyiapkan database PostgreSQL.
- Mengintegrasikan Prisma.
- Membuat Prisma schema.
- Membuat migration.
- Membuat seed kategori global.
- Mengatur relasi User, Book, dan Category.
- Memastikan integritas data.

### C. Authentication & Authorization
Mengimplementasikan sistem autentikasi.

Tanggung jawab:
- Register.
- Login.
- Password hashing.
- JWT generation.
- JWT strategy dan guard.
- Current user endpoint.
- Proteksi endpoint privat.
- Validasi kepemilikan data.

### D. Book Management API
Mengimplementasikan:
- Create Book.
- Get Books.
- Get Book Detail.
- Update Book.
- Delete Book.
- Search berdasarkan judul.
- Filter status.
- Filter kategori.
- Pagination.

### E. Category API
Mengimplementasikan:
- Endpoint `GET /categories`.
- Pengambilan kategori global.
- Validasi kategori saat buku dibuat atau diperbarui.
- Seed kategori awal.

### F. Integration
Bertanggung jawab menghubungkan backend dengan frontend yang dikerjakan X.

Tanggung jawab:
- Menyediakan API Contract.
- Menjelaskan request dan response.
- Menyediakan konfigurasi base URL.
- Menangani CORS.
- Membantu debugging integrasi.
- Memastikan API dapat digunakan frontend.

### G. Team Lead
- Membagi pekerjaan dan prioritas.
- Menjaga kesesuaian implementasi dengan PRD.
- Mengelola workflow GitHub.
- Melakukan review Pull Request.
- Mengidentifikasi hambatan teknis.
- Menjaga dokumentasi proyek.

## 3. Technology Stack

| Technology | Responsibility |
|---|---|
| NestJS | Backend framework |
| PostgreSQL | Relational database |
| Prisma | ORM |
| JWT | Authentication |
| class-validator | DTO validation |
| Bruno / Postman | API testing |
| Git & GitHub | Version control |

## 4. Database Design

### User
- id
- name
- email
- passwordHash
- createdAt
- updatedAt

### Book
- id
- title
- author
- status
- userId
- categoryId
- createdAt
- updatedAt

### Category
- id
- name
- createdAt
- updatedAt

### Relationships
- User memiliki banyak Book.
- Book dimiliki satu User.
- Category dapat digunakan banyak Book.
- Book memiliki nol atau satu Category.

### Database Constraints
- Email unik.
- Nama kategori unik.
- UserId wajib.
- CategoryId nullable.
- Status menggunakan enum.
- Foreign key harus valid.

## 5. Backend Functional Requirements

| ID | Requirement | Endpoint |
|---|---|---|
| BE-01 | Register | POST /auth/register |
| BE-02 | Login | POST /auth/login |
| BE-03 | Current User | GET /auth/me |
| BE-04 | Create Book | POST /books |
| BE-05 | Get Books | GET /books |
| BE-06 | Get Book Detail | GET /books/:id |
| BE-07 | Update Book | PATCH /books/:id |
| BE-08 | Delete Book | DELETE /books/:id |
| BE-09 | Get Categories | GET /categories |

Semua endpoint buku memerlukan autentikasi.

## 6. Security Requirements

### Authentication
- Gunakan JWT untuk autentikasi.
- Password harus di-hash.
- Jangan mengembalikan password atau passwordHash.
- Endpoint privat harus menggunakan JWT Guard.

### Authorization
Setiap query terhadap buku harus mempertimbangkan pemiliknya.

Contoh konsep:

```typescript
where: {
  id: bookId,
  userId: authenticatedUser.id
}
```

Jangan menggunakan userId dari request body untuk menentukan pemilik buku.

### Logout
Gunakan pendekatan stateless. Frontend menghapus token. Backend tidak membuat blacklist atau refresh token pada versi ini.

## 7. API Contract Responsibility

Panji harus menyediakan dokumentasi:

### Authentication
- Register request dan response.
- Login request dan response.
- Current user response.

### Books
- Create request dan response.
- List response.
- Detail response.
- Update request dan response.
- Delete response.

### Categories
- Category list response.

### Query Parameters
- page
- limit
- search
- status
- categoryId

### Error Handling
Gunakan HTTP status yang sesuai:
- 200 OK
- 201 Created
- 400 Bad Request
- 401 Unauthorized
- 404 Not Found
- 409 Conflict
- 500 Internal Server Error

## 8. Suggested Backend Structure

```text
backend/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── src/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── dto/
│   │   └── strategies/
│   │
│   ├── books/
│   │   ├── books.controller.ts
│   │   ├── books.service.ts
│   │   ├── books.module.ts
│   │   └── dto/
│   │
│   ├── categories/
│   │   ├── categories.controller.ts
│   │   ├── categories.service.ts
│   │   └── categories.module.ts
│   │
│   ├── prisma/
│   │   ├── prisma.service.ts
│   │   └── prisma.module.ts
│   │
│   ├── app.module.ts
│   └── main.ts
│
├── .env
├── .env.example
└── package.json
```

Struktur ini merupakan rancangan awal dan dapat disesuaikan dengan kebutuhan implementasi NestJS.

## 9. Environment Variables

Contoh variabel:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"
JWT_SECRET="CHANGE_THIS_SECRET"
JWT_EXPIRES_IN="1d"
PORT=3001
```

Ketentuan:
- `.env` tidak boleh di-commit.
- `.env.example` harus disediakan.
- Jangan menaruh credential asli di GitHub.
- Gunakan secret yang aman di lingkungan deployment.

## 10. Implementation Phases

### Phase 1 — Project Preparation
- Memahami PRD.
- Memahami ERD.
- Memahami API Contract.
- Menyiapkan repository.
- Menyiapkan struktur backend.

### Phase 2 — Backend Setup
- Membuat NestJS project.
- Mengatur konfigurasi.
- Menghubungkan PostgreSQL.
- Mengintegrasikan Prisma.

### Phase 3 — Database
- Membuat schema.
- Membuat migration.
- Membuat seed kategori.
- Menguji koneksi database.

### Phase 4 — Authentication
- Register.
- Password hashing.
- Login.
- JWT.
- Current user.
- Guard.

### Phase 5 — Book Management
- Create.
- Read.
- Update.
- Delete.
- Search.
- Filter.
- Pagination.

### Phase 6 — Category
- Global category.
- Seed.
- Get categories.
- Validasi categoryId.

### Phase 7 — Integration
- Menyiapkan API untuk X.
- Menguji komunikasi frontend-backend.
- Memperbaiki CORS.
- Debugging integrasi.

### Phase 8 — Testing & Documentation
- API testing.
- Ownership testing.
- Authentication testing.
- README.
- Dokumentasi teknis.

## 11. Testing Checklist

### Authentication
- [ ] Register berhasil.
- [ ] Email duplikat ditolak.
- [ ] Password di-hash.
- [ ] Login berhasil.
- [ ] Password salah ditolak.
- [ ] Token invalid ditolak.
- [ ] Current user berjalan.

### Books
- [ ] Create berhasil.
- [ ] Get list berhasil.
- [ ] Get detail berhasil.
- [ ] Update berhasil.
- [ ] Delete berhasil.
- [ ] Search berhasil.
- [ ] Filter berhasil.
- [ ] Pagination berhasil.

### Data Ownership
- [ ] Pengguna A hanya melihat buku miliknya.
- [ ] Pengguna A tidak dapat membaca buku pengguna B.
- [ ] Pengguna A tidak dapat mengubah buku pengguna B.
- [ ] Pengguna A tidak dapat menghapus buku pengguna B.

### Category
- [ ] Kategori tersedia.
- [ ] Semua pengguna mendapatkan kategori yang sama.
- [ ] CategoryId tidak valid ditolak.

## 12. Definition of Done

- [ ] Backend NestJS berjalan.
- [ ] PostgreSQL terhubung.
- [ ] Prisma berjalan.
- [ ] Schema dan migration tersedia.
- [ ] Kategori global tersedia.
- [ ] Authentication berjalan.
- [ ] JWT Guard berjalan.
- [ ] CRUD buku berjalan.
- [ ] Ownership berjalan.
- [ ] Search dan filter berjalan.
- [ ] Pagination berjalan.
- [ ] API Contract sesuai implementasi.
- [ ] Frontend dapat menggunakan API.
- [ ] Dokumentasi backend tersedia.

## 13. Working Principles

1. Jangan mengerjakan semua fitur sekaligus.
2. Kerjakan berdasarkan phase.
3. Uji setiap fitur sebelum berpindah tahap.
4. Jangan mengubah database schema tanpa mempertimbangkan dampak relasi.
5. Jangan mengubah API Contract tanpa menginformasikan X.
6. Gunakan Git branch untuk pekerjaan terpisah.
7. Gunakan Pull Request untuk menggabungkan pekerjaan.
8. Pastikan kode dapat dipahami dan dijelaskan kembali oleh Panji.

**Prinsip utama:** Panji bertanggung jawab memastikan backend aman, database konsisten, API jelas, dan integrasi frontend-backend berjalan.
