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
