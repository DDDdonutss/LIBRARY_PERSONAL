import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { BooksService } from './books.service.js';

/**
 * Unit test BooksService.getStats(): logika penjumlahan dan pengurutan
 * diuji dengan Prisma dan CategoriesService tiruan, termasuk kondisi yang
 * sulit dibuat lewat e2e (kategori terhapus di tengah request).
 */

type Status = 'WANT_TO_READ' | 'READING' | 'COMPLETED';

interface GroupRow {
  status: Status;
  categoryId: string | null;
  _count: { _all: number };
}

const USER_ID = 'user-1';
const SCIENCE = { id: 'cat-science', name: 'Science' };
const HISTORY = { id: 'cat-history', name: 'History' };
const FICTION = { id: 'cat-fiction', name: 'Fiction' };

const row = (
  status: Status,
  categoryId: string | null,
  count: number,
): GroupRow => ({ status, categoryId, _count: { _all: count } });

function setup(
  rows: GroupRow[],
  categories: { id: string; name: string }[] = [],
) {
  const groupBy = vi.fn().mockResolvedValue(rows);
  const findByIds = vi.fn().mockResolvedValue(categories);

  // Sengaja hanya `book.groupBy`: akses kategori harus lewat CategoriesService.
  const prisma = { book: { groupBy } };
  const categoriesService = { findByIds };

  const service = new BooksService(prisma as never, categoriesService as never);
  return { service, groupBy, findByIds };
}

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

describe('BooksService.getStats', () => {
  it('memakai SATU groupBy (status, categoryId) yang dibatasi userId', async () => {
    const { service, groupBy } = setup([]);

    await service.getStats(USER_ID);

    expect(groupBy).toHaveBeenCalledTimes(1);
    expect(groupBy).toHaveBeenCalledWith({
      by: ['status', 'categoryId'],
      where: { userId: USER_ID },
      _count: { _all: true },
    });
  });

  it('menghitung total, byStatus, dan byCategory dari baris yang sama', async () => {
    const { service, findByIds } = setup(
      [
        row('WANT_TO_READ', SCIENCE.id, 1),
        row('COMPLETED', SCIENCE.id, 1),
        row('READING', HISTORY.id, 1),
        row('READING', FICTION.id, 1),
        row('WANT_TO_READ', null, 1),
      ],
      [SCIENCE, HISTORY, FICTION],
    );

    const stats = await service.getStats(USER_ID);

    expect(stats).toEqual({
      total: 5,
      byStatus: { WANT_TO_READ: 2, READING: 2, COMPLETED: 1 },
      byCategory: [
        { categoryId: SCIENCE.id, name: 'Science', count: 2 },
        // Jumlah sama: nama A–Z (Fiction sebelum History), tanpa kategori terakhir.
        { categoryId: FICTION.id, name: 'Fiction', count: 1 },
        { categoryId: HISTORY.id, name: 'History', count: 1 },
        { categoryId: null, name: null, count: 1 },
      ],
    });
    expect(findByIds).toHaveBeenCalledTimes(1);
    expect(sum(Object.values(stats.byStatus))).toBe(stats.total);
    expect(sum(stats.byCategory.map((c) => c.count))).toBe(stats.total);
  });

  it('kategori yang terhapus setelah GROUP BY digabung ke "tanpa kategori"', async () => {
    // Buku pada kategori terhapus menjadi categoryId = null (onDelete: SetNull),
    // jadi entri dengan categoryId terisi tetapi name null tidak boleh muncul.
    const { service } = setup(
      [
        row('WANT_TO_READ', 'cat-deleted', 2),
        row('READING', null, 1),
        row('COMPLETED', SCIENCE.id, 1),
      ],
      [SCIENCE],
    );

    const stats = await service.getStats(USER_ID);

    expect(stats.total).toBe(4);
    expect(stats.byCategory).toEqual([
      { categoryId: null, name: null, count: 3 },
      { categoryId: SCIENCE.id, name: 'Science', count: 1 },
    ]);
    for (const entry of stats.byCategory) {
      expect(entry.categoryId === null).toBe(entry.name === null);
    }
  });

  it('tanpa kategori diurutkan terakhir hanya bila jumlahnya sama', async () => {
    const { service } = setup(
      [row('READING', null, 3), row('READING', SCIENCE.id, 1)],
      [SCIENCE],
    );

    const stats = await service.getStats(USER_ID);

    expect(stats.byCategory.map((c) => c.categoryId)).toEqual([
      null,
      SCIENCE.id,
    ]);
  });

  it('user tanpa buku: semua nol dan tidak mencari nama kategori', async () => {
    const { service, findByIds } = setup([]);

    await expect(service.getStats(USER_ID)).resolves.toEqual({
      total: 0,
      byStatus: { WANT_TO_READ: 0, READING: 0, COMPLETED: 0 },
      byCategory: [],
    });
    expect(findByIds).not.toHaveBeenCalled();
  });
});

/**
 * Pemetaan error di update/remove (issue #23): P2025 berarti buku tidak ada
 * ATAU milik user lain — keduanya 404 dengan pesan yang sama, sehingga
 * keberadaan buku user lain tidak bocor.
 */
describe('BooksService.update dan remove', () => {
  const BOOK_ID = 'book-1';
  const NOT_FOUND = new NotFoundException('Buku tidak ditemukan');

  const prismaError = (code: string) =>
    new Prisma.PrismaClientKnownRequestError(`Prisma error ${code}`, {
      code,
      clientVersion: 'test',
    });

  function setupWrites() {
    const update = vi.fn();
    const remove = vi.fn();
    const ensureExists = vi.fn().mockResolvedValue(undefined);
    const prisma = { book: { update, delete: remove } };
    const service = new BooksService(
      prisma as never,
      { ensureExists } as never,
    );
    return { service, update, remove, ensureExists };
  }

  it('update selalu dibatasi id DAN userId dari token', async () => {
    const { service, update } = setupWrites();
    update.mockResolvedValue({ id: BOOK_ID });

    await service.update(USER_ID, BOOK_ID, { status: 'READING' });

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: BOOK_ID, userId: USER_ID },
        data: { status: 'READING' },
      }),
    );
  });

  it('update: P2025 (tidak ada / milik user lain) → 404', async () => {
    const { service, update } = setupWrites();
    update.mockRejectedValue(prismaError('P2025'));

    await expect(
      service.update(USER_ID, BOOK_ID, { title: 'Baru' }),
    ).rejects.toThrow(NOT_FOUND);
  });

  it('update: body kosong → 400 tanpa menyentuh database', async () => {
    const { service, update } = setupWrites();

    await expect(service.update(USER_ID, BOOK_ID, {})).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(update).not.toHaveBeenCalled();
  });

  it('update: categoryId divalidasi lewat CategoriesService, null tidak', async () => {
    const { service, update, ensureExists } = setupWrites();
    update.mockResolvedValue({ id: BOOK_ID });

    await service.update(USER_ID, BOOK_ID, { categoryId: 'cat-1' });
    await service.update(USER_ID, BOOK_ID, { categoryId: null });

    expect(ensureExists).toHaveBeenCalledTimes(1);
    expect(ensureExists).toHaveBeenCalledWith('cat-1');
  });

  it('remove: berhasil → pesan dan id, dibatasi userId', async () => {
    const { service, remove } = setupWrites();
    remove.mockResolvedValue({ id: BOOK_ID });

    await expect(service.remove(USER_ID, BOOK_ID)).resolves.toEqual({
      message: 'Buku berhasil dihapus',
      id: BOOK_ID,
    });
    expect(remove).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: BOOK_ID, userId: USER_ID } }),
    );
  });

  it('remove: P2025 → 404', async () => {
    const { service, remove } = setupWrites();
    remove.mockRejectedValue(prismaError('P2025'));

    await expect(service.remove(USER_ID, BOOK_ID)).rejects.toThrow(NOT_FOUND);
  });

  it('error database lain diteruskan apa adanya (ditangani filter global)', async () => {
    const { service, remove } = setupWrites();
    const error = prismaError('P2003');
    remove.mockRejectedValue(error);

    await expect(service.remove(USER_ID, BOOK_ID)).rejects.toBe(error);
  });
});
