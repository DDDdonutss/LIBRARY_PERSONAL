import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { getJwtExpiresIn } from '../src/auth/jwt.config.js';
import { MAX_PAGE } from '../src/books/dto/query-books.dto.js';
import { CategoriesService } from '../src/categories/categories.service.js';
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

/** Isi (payload) JWT tanpa verifikasi tanda tangan — hanya untuk memeriksa klaim. */
function decodeJwtPayload(token: string): { iat: number; exp: number } {
  const [, payload] = token.split('.');
  return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
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

    it('register dengan name hanya spasi → 400', async () => {
      const res = await api()
        .post(`${API}/auth/register`)
        .send({ name: '   ', email: uniqueEmail('ws'), password: PASSWORD });

      // Bila regresi membuat request ini lolos, user tetap dibersihkan.
      if (res.body?.user?.id) createdUserIds.push(res.body.user.id);

      expect(res.status).toBe(400);
      expect(res.body.message.join(' ')).toContain('name');
    });

    it('register dengan name berspasi di awal/akhir → 201 dan name di-trim', async () => {
      const res = await api()
        .post(`${API}/auth/register`)
        .send({
          name: '  Panji  ',
          email: uniqueEmail('trim'),
          password: PASSWORD,
        })
        .expect(201);

      createdUserIds.push(res.body.user.id);
      expect(res.body.user.name).toBe('Panji');
    });

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

    it('masa berlaku token = JWT_EXPIRES_IN dalam detik (issue #22)', () => {
      // Regresi: string angka seperti "60" dulu dibaca jsonwebtoken sebagai
      // milidetik, sehingga exp = iat dan token langsung kedaluwarsa.
      const { iat, exp } = decodeJwtPayload(userA.token);

      expect(exp - iat).toBe(getJwtExpiresIn());
      expect(exp - iat).toBeGreaterThan(0);
    });

    it('register dan login dengan email berspasi di awal/akhir → di-trim (issue #22)', async () => {
      const email = uniqueEmail('spaced');

      const registered = await api()
        .post(`${API}/auth/register`)
        .send({
          name: 'Spasi',
          email: `  ${email.toUpperCase()}  `,
          password: PASSWORD,
        })
        .expect(201);
      createdUserIds.push(registered.body.user.id);
      expect(registered.body.user.email).toBe(email);

      const loggedIn = await api()
        .post(`${API}/auth/login`)
        .send({ email: `  ${email}  `, password: PASSWORD })
        .expect(200);
      expect(loggedIn.body.user.id).toBe(registered.body.user.id);
    });
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

    it('GET /categories → tepat 6 kategori final (issue #11), urut A–Z, hanya id dan name', async () => {
      const res = await api()
        .get(`${API}/categories`)
        .set('Authorization', bearer(userA))
        .expect(200);

      expect(res.body.map((c: { name: string }) => c.name)).toEqual([
        'Education',
        'Fiction',
        'History',
        'Other',
        'Science',
        'Technology',
      ]);
      for (const category of res.body) {
        expect(Object.keys(category).sort()).toEqual(['id', 'name']);
      }
    });

    it('GET /categories tanpa token → 401 (tetap dilindungi JWT, issue #11)', () =>
      api().get(`${API}/categories`).expect(401));

    it('GET /categories dengan token rusak → 401', () =>
      api()
        .get(`${API}/categories`)
        .set('Authorization', 'Bearer bukan.token.valid')
        .expect(401));
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

      it('statistik user B tidak memuat buku user A', async () => {
        const res = await api()
          .get(`${API}/books/stats`)
          .set('Authorization', bearer(userB))
          .expect(200);

        expect(res.body).toEqual({
          total: 0,
          byStatus: { WANT_TO_READ: 0, READING: 0, COMPLETED: 0 },
          byCategory: [],
        });
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

  describe('Stats', () => {
    it('GET /books/stats → 200 ringkasan konsisten per status dan kategori', async () => {
      // User dan buku sendiri, agar angka tidak bergantung pada test lain.
      const user = await registerUser('stats');

      const categories = await api()
        .get(`${API}/categories`)
        .set('Authorization', bearer(user))
        .expect(200);
      const idOf = (name: string): string =>
        categories.body.find((c: { name: string }) => c.name === name).id;
      const science = idOf('Science');
      const history = idOf('History');
      const fiction = idOf('Fiction');

      // History dibuat sebelum Fiction: urutan hasil harus mengikuti nama,
      // bukan urutan pembuatan.
      const books = [
        { title: 'S1', author: 'A', categoryId: science },
        { title: 'S2', author: 'A', categoryId: science, status: 'COMPLETED' },
        { title: 'H1', author: 'A', categoryId: history, status: 'READING' },
        { title: 'F1', author: 'A', categoryId: fiction, status: 'READING' },
        { title: 'N1', author: 'A' },
      ];
      for (const book of books) {
        await api()
          .post(`${API}/books`)
          .set('Authorization', bearer(user))
          .send(book)
          .expect(201);
      }

      const res = await api()
        .get(`${API}/books/stats`)
        .set('Authorization', bearer(user))
        .expect(200);

      expect(res.body).toEqual({
        total: 5,
        byStatus: { WANT_TO_READ: 2, READING: 2, COMPLETED: 1 },
        byCategory: [
          { categoryId: science, name: 'Science', count: 2 },
          { categoryId: fiction, name: 'Fiction', count: 1 },
          { categoryId: history, name: 'History', count: 1 },
          { categoryId: null, name: null, count: 1 },
        ],
      });
    });

    it('GET /books/stats tanpa token → 401', () =>
      api().get(`${API}/books/stats`).expect(401));
  });

  describe('Hardening input dan error database (issue #22)', () => {
    it.each(['1e20', String(MAX_PAGE + 1)])(
      'GET /books?page=%s → 400 (dulu 500 karena offset melewati batas int64)',
      async (page) => {
        await api()
          .get(`${API}/books`)
          .query({ page })
          .set('Authorization', bearer(userA))
          .expect(400);
      },
    );

    it('GET /books dengan page = MAX_PAGE dan limit 100 → 200 data kosong', async () => {
      const res = await api()
        .get(`${API}/books`)
        .query({ page: String(MAX_PAGE), limit: '100' })
        .set('Authorization', bearer(userA))
        .expect(200);

      expect(res.body.data).toEqual([]);
      expect(res.body.meta.page).toBe(MAX_PAGE);
    });

    it('search memperlakukan %, _, dan \\ sebagai karakter biasa', async () => {
      // User sendiri, agar jumlah hasil tidak bergantung pada test lain.
      const user = await registerUser('search');
      const titles = ['100% Organic', 'snake_case Guide', 'AC\\DC', 'Plain'];
      for (const title of titles) {
        await api()
          .post(`${API}/books`)
          .set('Authorization', bearer(user))
          .send({ title, author: 'A' })
          .expect(201);
      }

      const titlesFor = async (search: string) => {
        const res = await api()
          .get(`${API}/books`)
          .query({ search })
          .set('Authorization', bearer(user))
          .expect(200);
        return res.body.data.map((book: { title: string }) => book.title);
      };

      // Tanpa escape, '%' dan '_' adalah wildcard ILIKE dan cocok dengan
      // semua judul; '\' adalah karakter escape bawaan PostgreSQL.
      expect(await titlesFor('%')).toEqual(['100% Organic']);
      expect(await titlesFor('_')).toEqual(['snake_case Guide']);
      expect(await titlesFor('\\')).toEqual(['AC\\DC']);
      expect(await titlesFor('100%')).toEqual(['100% Organic']);
    });

    it('error foreign key (P2003) → 400 lewat filter global: kategori terhapus di antara pengecekan dan penyimpanan', async () => {
      // Race nyata: categoryId lolos ensureExists(), lalu kategorinya hilang
      // sebelum buku disimpan. Database menolak dengan pelanggaran foreign key.
      const category = await prisma.category.create({
        data: { name: `E2E Race ${Date.now()}` },
        select: { id: true },
      });
      const ensureExists = vi
        .spyOn(app.get(CategoriesService), 'ensureExists')
        .mockImplementationOnce(async (id: string) => {
          await prisma.category.delete({ where: { id } });
        });

      try {
        const res = await api()
          .post(`${API}/books`)
          .set('Authorization', bearer(userA))
          .send({ title: 'Race', author: 'A', categoryId: category.id })
          .expect(400);

        expect(res.body.message).toBe('Data terkait tidak ditemukan');
        expect(ensureExists).toHaveBeenCalledOnce();
      } finally {
        ensureExists.mockRestore();
        await prisma.category.deleteMany({ where: { id: category.id } });
      }
    });
  });

  describe('Token milik user yang sudah dihapus → 401 di semua endpoint (issue #15)', () => {
    type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';
    let deleted: TestUser;

    beforeAll(async () => {
      // Token bertanda tangan valid, tetapi user-nya dihapus langsung di database.
      deleted = await registerUser('deleted');
      await prisma.user.delete({ where: { id: deleted.id } });
    });

    const call = (method: Method, url: string) => {
      switch (method) {
        case 'GET':
          return api().get(url);
        case 'POST':
          return api().post(url).send({ title: 'Buku', author: 'A' });
        case 'PATCH':
          return api().patch(url).send({ title: 'Buku' });
        case 'DELETE':
          return api().delete(url);
      }
    };

    const cases: [Method, string][] = [
      ['GET', '/auth/me'],
      ['GET', '/categories'],
      ['GET', '/books'],
      ['GET', '/books/stats'],
      ['GET', `/books/${NIL_UUID}`],
      ['POST', '/books'],
      ['PATCH', `/books/${NIL_UUID}`],
      ['DELETE', `/books/${NIL_UUID}`],
    ];

    it.each(cases)('%s %s → 401', async (method, path) => {
      await call(method, `${API}${path}`)
        .set('Authorization', bearer(deleted))
        .expect(401);
    });
  });
});
