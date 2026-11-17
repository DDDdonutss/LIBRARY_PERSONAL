import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { MAX_PAGE, MAX_PAGE_LIMIT, QueryBooksDto } from './query-books.dto.js';

/**
 * Batas `page` harus menjaga offset (page - 1) * limit tetap bilangan bulat
 * aman (tepat), bukan sekadar di bawah batas int64 database.
 */

const invalidProperties = async (query: Record<string, string>) => {
  const errors = await validate(plainToInstance(QueryBooksDto, query));
  return errors.map((error) => error.property);
};

describe('QueryBooksDto.page', () => {
  it('offset terbesar ((MAX_PAGE - 1) × MAX_PAGE_LIMIT) adalah bilangan bulat aman', () => {
    expect(Number.isSafeInteger((MAX_PAGE - 1) * MAX_PAGE_LIMIT)).toBe(true);
  });

  it('page = MAX_PAGE dengan limit maksimal diterima', async () => {
    await expect(
      invalidProperties({
        page: String(MAX_PAGE),
        limit: String(MAX_PAGE_LIMIT),
      }),
    ).resolves.toEqual([]);
  });

  it.each(['0', String(MAX_PAGE + 1), '1e20', '1.5', 'abc'])(
    'page=%s ditolak',
    async (page) => {
      await expect(invalidProperties({ page })).resolves.toEqual(['page']);
    },
  );
});
