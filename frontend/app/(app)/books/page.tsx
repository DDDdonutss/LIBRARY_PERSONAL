'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ErrorAlert } from '@/components/ErrorAlert';
import { errorMessages, getBooks } from '@/lib/api';
import { STATUS_LABELS } from '@/lib/labels';
import type { BookList } from '@/lib/types';
import { primaryButtonClass } from '@/lib/ui';

interface ListState {
  list?: BookList;
  errors?: string[];
}

const emptyBoxClass =
  'rounded-lg border border-dashed border-gray-300 bg-white px-6 py-10 text-center text-sm text-gray-600';

export default function BooksPage() {
  const [listState, setListState] = useState<ListState | null>(null);

  useEffect(() => {
    let active = true;
    // Untuk sementara cukup halaman pertama (10 buku terbaru).
    getBooks()
      .then((list) => {
        if (active) setListState({ list });
      })
      .catch((error: unknown) => {
        if (active) setListState({ errors: errorMessages(error) });
      });
    return () => {
      active = false;
    };
  }, []);

  function renderList() {
    if (!listState) return <p className="text-sm text-gray-600">Memuat…</p>;
    if (!listState.list) return <ErrorAlert messages={listState.errors ?? []} />;

    const { data } = listState.list;

    if (data.length === 0) {
      return (
        <div className={emptyBoxClass}>
          <p>Belum ada buku.</p>
          <Link href="/books/new" className="mt-2 inline-block font-medium text-blue-700 hover:underline">
            Tambah buku pertama
          </Link>
        </div>
      );
    }

    return (
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
                <td className="px-4 py-3 font-medium text-gray-900">{book.title}</td>
                <td className="px-4 py-3 text-gray-700">{book.author}</td>
                <td className="px-4 py-3 text-gray-700">{STATUS_LABELS[book.status]}</td>
                <td className="px-4 py-3 text-gray-700">{book.category?.name ?? 'Tanpa kategori'}</td>
              </tr>
            ))}
          </tbody>
        </table>
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

      {renderList()}
    </div>
  );
}
