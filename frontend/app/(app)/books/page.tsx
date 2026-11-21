'use client';

import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { ErrorAlert } from '@/components/ErrorAlert';
import { errorMessages, getBooks, updateBook } from '@/lib/api';
import { BOOK_STATUSES, STATUS_LABELS } from '@/lib/labels';
import type { Book, BookList, BookStatus } from '@/lib/types';
import {
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '@/lib/ui';
import { useCategories } from '@/lib/useCategories';

interface ListState {
  /** Kombinasi halaman + pencarian + filter yang menghasilkan data ini. */
  key: string;
  list?: BookList;
  errors?: string[];
}

const emptyBoxClass =
  'rounded-lg border border-dashed border-gray-300 bg-white px-6 py-10 text-center text-sm text-gray-600';

export default function BooksPage() {
  const { categories } = useCategories();

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<BookStatus | ''>('');
  const [categoryId, setCategoryId] = useState('');
  const [page, setPage] = useState(1);

  const [listState, setListState] = useState<ListState | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [statusErrors, setStatusErrors] = useState<string[]>([]);

  const key = JSON.stringify([page, search, status, categoryId]);

  useEffect(() => {
    let active = true;
    getBooks({ page, search, status, categoryId })
      .then((list) => {
        if (!active) return;
        // Halaman melewati halaman terakhir (mis. buku terakhirnya baru dihapus):
        // pindah ke halaman terakhir yang masih ada.
        if (list.data.length === 0 && list.meta.totalPages > 0 && page > list.meta.totalPages) {
          setPage(list.meta.totalPages);
          return;
        }
        setListState({ key, list });
      })
      .catch((error: unknown) => {
        if (active) setListState({ key, errors: errorMessages(error) });
      });
    return () => {
      active = false;
    };
  }, [key, page, search, status, categoryId]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  }

  async function handleStatusChange(book: Book, nextStatus: BookStatus) {
    if (nextStatus === book.status) return;
    setSavingId(book.id);
    setStatusErrors([]);
    try {
      const updated = await updateBook(book.id, { status: nextStatus });
      setListState((current) =>
        current?.list
          ? {
              ...current,
              list: {
                ...current.list,
                data: current.list.data.map((item) => (item.id === updated.id ? updated : item)),
              },
            }
          : current,
      );
    } catch (error) {
      // Data baris tidak diubah, jadi pilihan kembali ke status sebelumnya.
      setStatusErrors(errorMessages(error));
    } finally {
      setSavingId(null);
    }
  }

  const current = listState?.key === key ? listState : null;
  const hasFilters = search !== '' || status !== '' || categoryId !== '';

  function renderList() {
    if (!current) return <p className="text-sm text-gray-600">Memuat…</p>;
    if (!current.list) return <ErrorAlert messages={current.errors ?? []} />;

    const { data, meta } = current.list;

    if (meta.total === 0) {
      return hasFilters ? (
        <p className={emptyBoxClass}>Tidak ada buku yang cocok.</p>
      ) : (
        <div className={emptyBoxClass}>
          <p>Belum ada buku.</p>
          <Link href="/books/new" className="mt-2 inline-block font-medium text-blue-700 hover:underline">
            Tambah buku pertama
          </Link>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-600">{meta.total} buku</p>

        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  Judul
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Penulis
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Kategori
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((book) => (
                <tr key={book.id}>
                  <td className="px-4 py-3">
                    <Link href={`/books/${book.id}`} className="font-medium text-blue-700 hover:underline">
                      {book.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{book.author}</td>
                  <td className="px-4 py-3">
                    <select
                      aria-label={`Status buku ${book.title}`}
                      value={book.status}
                      disabled={savingId === book.id}
                      onChange={(event) => void handleStatusChange(book, event.target.value as BookStatus)}
                      className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm disabled:bg-gray-100"
                    >
                      {BOOK_STATUSES.map((value) => (
                        <option key={value} value={value}>
                          {STATUS_LABELS[value]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{book.category?.name ?? 'Tanpa kategori'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <nav aria-label="Navigasi halaman" className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setPage(page - 1)}
            disabled={meta.page <= 1}
            className={secondaryButtonClass}
          >
            Sebelumnya
          </button>
          <span className="text-sm text-gray-600">
            Halaman {meta.page} dari {meta.totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage(page + 1)}
            disabled={meta.page >= meta.totalPages}
            className={secondaryButtonClass}
          >
            Berikutnya
          </button>
        </nav>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-gray-900">Daftar Buku</h1>
        <Link href="/books/new" className={primaryButtonClass}>
          Tambah buku
        </Link>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <form onSubmit={handleSearch} role="search" className="flex min-w-64 flex-1 items-end gap-2">
          <div className="flex-1">
            <label htmlFor="search" className={labelClass}>
              Cari judul
            </label>
            <input
              id="search"
              type="search"
              maxLength={200}
              placeholder="Mis. clean code"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              className={inputClass}
            />
          </div>
          <button type="submit" className={secondaryButtonClass}>
            Cari
          </button>
        </form>

        <div>
          <label htmlFor="status-filter" className={labelClass}>
            Status
          </label>
          <select
            id="status-filter"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as BookStatus | '');
              setPage(1);
            }}
            className={inputClass}
          >
            <option value="">Semua status</option>
            {BOOK_STATUSES.map((value) => (
              <option key={value} value={value}>
                {STATUS_LABELS[value]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="category-filter" className={labelClass}>
            Kategori
          </label>
          <select
            id="category-filter"
            value={categoryId}
            onChange={(event) => {
              setCategoryId(event.target.value);
              setPage(1);
            }}
            disabled={categories === null}
            className={inputClass}
          >
            <option value="">Semua kategori</option>
            {categories?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ErrorAlert messages={statusErrors} />

      {renderList()}
    </div>
  );
}
