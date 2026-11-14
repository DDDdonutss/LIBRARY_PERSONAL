import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

/**
 * E2E test terhadap aplikasi lengkap dan database dari .env.
 * Prasyarat: migration sudah diterapkan dan kategori sudah di-seed
 * (npm run db:migrate && npm run db:seed).
 *
 * Test membuat user sendiri dengan email unik, lalu menghapus HANYA user
 * tersebut di akhir (buku ikut terhapus karena onDelete: Cascade).
 */

const API = '/api/v1';
const PASSWORD = 'password123';
const NIL_UUID = '00000000-0000-4000-8000-000000000000';

interface TestUser {
  id: string;
  email: string;
  token: string;
}

function uniqueEmail(label: string): string {
  const suffix = Math.random().toString(36).slice(2, 8);
  return `e2e.${label}.${Date.now()}.${suffix}@example.com`;
}

describe('Personal Library API (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const createdUserIds: string[] = [];

  let userA: TestUser;
  let userB: TestUser;
  let scienceCategoryId: string;

  const api = () => request(app.getHttpServer());
  const bearer = (user: TestUser) => `Bearer ${user.token}`;

  async function registerUser(label: string): Promise<TestUser> {
    const email = uniqueEmail(label);
    const res = await api()
      .post(`${API}/auth/register`)
      .send({ name: `E2E ${label}`, email, password: PASSWORD })
      .expect(201);

    createdUserIds.push(res.body.user.id);
    return { id: res.body.user.id, email, token: res.body.accessToken };
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();

    prisma = app.get(PrismaService);
    userA = await registerUser('a');
    userB = await registerUser('b');
  });

  afterAll(async () => {
    if (prisma && createdUserIds.length > 0) {
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    }
    await app?.close();
  });

  describe('App', () => {
    it('tidak menyediakan endpoint root (Hello World sudah dihapus)', () =>
      api().get(API).expect(404));
  });

  describe('Auth', () => {
    it('login → 200 dengan user tanpa passwordHash dan accessToken', async () => {
      const res = await api()
        .post(`${API}/auth/login`)
        .send({ email: userA.email, password: PASSWORD })
        .expect(200);

      expect(Object.keys(res.body.user).sort()).toEqual(
        ['createdAt', 'email', 'id', 'name'].sort(),
      );
      expect(res.body.accessToken).toEqual(expect.any(String));
    });

    it('register dengan email yang sudah ada (beda huruf besar) → 409', () =>
      api()
        .post(`${API}/auth/register`)
        .send({
          name: 'Duplikat',
          email: userA.email.toUpperCase(),
          password: PASSWORD,
        })
        .expect(409));

    it('register dengan input invalid → 400', () =>
      api()
        .post(`${API}/auth/register`)
        .send({ name: '', email: 'bukan-email', password: '123' })
        .expect(400));

    it('register dengan field tidak dikenal → 400', () =>
      api()
        .post(`${API}/auth/register`)
        .send({
          name: 'X',
          email: uniqueEmail('x'),
          password: PASSWORD,
          userId: NIL_UUID,
        })
        .expect(400));

    it('login dengan password salah → 401 pesan generik', async () => {
      const res = await api()
        .post(`${API}/auth/login`)
        .send({ email: userA.email, password: 'password-salah' })
        .expect(401);

      expect(res.body.message).toBe('Email atau password salah');
    });

    it('GET /auth/me dengan token → 200 user yang login', async () => {
      const res = await api()
        .get(`${API}/auth/me`)
        .set('Authorization', bearer(userA))
        .expect(200);

      expect(res.body.id).toBe(userA.id);
      expect(res.body).not.toHaveProperty('passwordHash');
    });

    it('GET /auth/me tanpa token → 401', () =>
      api().get(`${API}/auth/me`).expect(401));

    it('GET /auth/me dengan token rusak → 401', () =>
      api()
        .get(`${API}/auth/me`)
        .set('Authorization', 'Bearer bukan.token.valid')
        .expect(401));
  });

  describe('Categories', () => {
    it('GET /categories → 200 berisi kategori hasil seed', async () => {
      const res = await api()
        .get(`${API}/categories`)
        .set('Authorization', bearer(userA))
        .expect(200);

      const science = res.body.find(
        (category: { name: string }) => category.name === 'Science',
      );
      expect(
        science,
        'Kategori belum di-seed: jalankan npm run db:seed',
      ).toBeDefined();
      scienceCategoryId = science.id;
    });

    it('GET /categories tanpa token → 401', () =>
      api().get(`${API}/categories`).expect(401));
  });

  describe('Books', () => {
    let bookId: string;

    it('POST /books → 201 dengan default status dan judul di-trim', async () => {
      const res = await api()
        .post(`${API}/books`)
        .set('Authorization', bearer(userA))
        .send({
          title: '  Clean Code  ',
          author: 'Robert C. Martin',
          categoryId: scienceCategoryId,
        })
        .expect(201);

      bookId = res.body.id;
      expect(res.body).toMatchObject({
        title: 'Clean Code',
        status: 'WANT_TO_READ',
        category: { id: scienceCategoryId, name: 'Science' },
      });
      expect(res.body).not.toHaveProperty('userId');
    });

    it('POST /books dengan input invalid → 400', () =>
      api()
        .post(`${API}/books`)
        .set('Authorization', bearer(userA))
        .send({ title: '   ', author: 'X', status: 'DIBACA' })
        .expect(400));

    it('POST /books dengan kategori yang tidak ada → 400', () =>
      api()
        .post(`${API}/books`)
        .set('Authorization', bearer(userA))
        .send({ title: 'Buku', author: 'X', categoryId: NIL_UUID })
        .expect(400));

    it('GET /books mendukung search, filter, dan pagination', async () => {
      await api()
        .post(`${API}/books`)
        .set('Authorization', bearer(userA))
        .send({ title: 'Dune', author: 'Frank Herbert', status: 'COMPLETED' })
        .expect(201);

      const all = await api()
        .get(`${API}/books?limit=1&page=2`)
        .set('Authorization', bearer(userA))
        .expect(200);
      expect(all.body.data).toHaveLength(1);
      expect(all.body.meta).toEqual({
        page: 2,
        limit: 1,
        total: 2,
        totalPages: 2,
      });

      const searched = await api()
        .get(`${API}/books?search=CLEAN`)
        .set('Authorization', bearer(userA))
        .expect(200);
      expect(searched.body.data.map((b: { id: string }) => b.id)).toEqual([
        bookId,
      ]);

      const filtered = await api()
        .get(`${API}/books?status=COMPLETED`)
        .set('Authorization', bearer(userA))
        .expect(200);
      expect(filtered.body.meta.total).toBe(1);
      expect(filtered.body.data[0].title).toBe('Dune');
    });

    it('GET /books dengan limit > 100 → 400', () =>
      api()
        .get(`${API}/books?limit=101`)
        .set('Authorization', bearer(userA))
        .expect(400));

    it('GET /books/:id dengan ID bukan UUID → 400', () =>
      api()
        .get(`${API}/books/bukan-uuid`)
        .set('Authorization', bearer(userA))
        .expect(400));

    it('PATCH /books/:id mengubah sebagian field dan bisa menghapus kategori', async () => {
      const res = await api()
        .patch(`${API}/books/${bookId}`)
        .set('Authorization', bearer(userA))
        .send({ status: 'READING', categoryId: null })
        .expect(200);

      expect(res.body).toMatchObject({
        title: 'Clean Code',
        status: 'READING',
        categoryId: null,
        category: null,
      });
    });

    it('PATCH /books/:id dengan title null → 400', () =>
      api()
        .patch(`${API}/books/${bookId}`)
        .set('Authorization', bearer(userA))
        .send({ title: null })
        .expect(400));

    describe('Ownership: user B terhadap buku user A', () => {
      it('tidak muncul di daftar buku user B', async () => {
        const res = await api()
          .get(`${API}/books?search=clean`)
          .set('Authorization', bearer(userB))
          .expect(200);
        expect(res.body.meta.total).toBe(0);
      });

      it('GET → 404', () =>
        api()
          .get(`${API}/books/${bookId}`)
          .set('Authorization', bearer(userB))
          .expect(404));

      it('PATCH → 404', () =>
        api()
          .patch(`${API}/books/${bookId}`)
          .set('Authorization', bearer(userB))
          .send({ title: 'Diubah oleh B' })
          .expect(404));

      it('DELETE → 404', () =>
        api()
          .delete(`${API}/books/${bookId}`)
          .set('Authorization', bearer(userB))
          .expect(404));

      it('buku user A tetap utuh', async () => {
        const res = await api()
          .get(`${API}/books/${bookId}`)
          .set('Authorization', bearer(userA))
          .expect(200);
        expect(res.body.title).toBe('Clean Code');
      });
    });

    it('DELETE /books/:id → 200, lalu buku tidak ditemukan', async () => {
      const res = await api()
        .delete(`${API}/books/${bookId}`)
        .set('Authorization', bearer(userA))
        .expect(200);
      expect(res.body).toEqual({
        message: 'Buku berhasil dihapus',
        id: bookId,
      });

      await api()
        .get(`${API}/books/${bookId}`)
        .set('Authorization', bearer(userA))
        .expect(404);
    });

    it('endpoint buku tanpa token → 401', () =>
      api().get(`${API}/books`).expect(401));
  });
});
