'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BookForm, type BookFormValues } from '@/components/BookForm';
import { ErrorAlert } from '@/components/ErrorAlert';
import {
  ApiError,
  deleteBook,
  errorMessages,
  getBook,
  updateBook,
  type BookInput,
} from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import { STATUS_LABELS } from '@/lib/labels';
import type { Book } from '@/lib/types';
import { cardClass, dangerButtonClass } from '@/lib/ui';
import { useCategories } from '@/lib/useCategories';

interface DetailState {
  /** ID buku yang menghasilkan data ini. */
  id: string;
  book?: Book;
  notFound?: boolean;
  errors?: string[];
}

const backLink = (
  <Link href="/books" className="text-sm font-medium text-blue-700 hover:underline">
    ← Kembali ke daftar buku
  </Link>
);

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  // Diambil sekali per halaman, agar form yang diisi ulang setelah disimpan
  // tidak mengambil kategori lagi.
  const { categories, errors: categoryErrors } = useCategories();

  const [detail, setDetail] = useState<DetailState | null>(null);
  const [notice, setNotice] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteErrors, setDeleteErrors] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    getBook(id)
      .then((book) => {
        if (active) setDetail({ id, book });
      })
      .catch((error: unknown) => {
        if (!active) return;
        // 404 = tidak ada atau milik akun lain; 400 = ID di alamat bukan UUID.
        if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
          setDetail({ id, notFound: true });
        } else {
          setDetail({ id, errors: errorMessages(error) });
        }
      });
    return () => {
      active = false;
    };
  }, [id]);

  const current = detail?.id === id ? detail : null;

  if (!current) {
    return <p className="text-sm text-gray-600">Memuat…</p>;
  }

  if (current.notFound) {
    return (
      <div className="space-y-4">
        {backLink}
        <div className="rounded-lg border border-dashed border-gray-300 bg-white px-6 py-10 text-center">
          <p className="text-lg font-medium text-gray-900">Buku tidak ditemukan</p>
          <p className="mt-1 text-sm text-gray-600">
            Buku ini tidak ada, sudah dihapus, atau bukan milik akun Anda.
          </p>
        </div>
      </div>
    );
  }

  const book = current.book;
  if (!book) {
    return (
      <div className="space-y-4">
        {backLink}
        <ErrorAlert messages={current.errors ?? []} />
      </div>
    );
  }

  async function handleSave(values: BookFormValues) {
    if (!book) return;
    setNotice('');

    // Kirim hanya field yang berubah (PATCH).
    const changes: Partial<BookInput> = {};
    const title = values.title.trim();
    const author = values.author.trim();
    const categoryId = values.categoryId || null;
    if (title !== book.title) changes.title = title;
    if (author !== book.author) changes.author = author;
    if (values.status !== book.status) changes.status = values.status;
    if (categoryId !== book.categoryId) changes.categoryId = categoryId;

    if (Object.keys(changes).length === 0) {
      // Backend menolak PATCH kosong ("Tidak ada data yang diubah").
      setNotice('Tidak ada perubahan.');
      return;
    }

    const updated = await updateBook(book.id, changes);
    setDetail({ id, book: updated });
    setNotice('Perubahan disimpan');
  }

  async function handleDelete() {
    if (!book) return;
    if (!window.confirm(`Hapus buku "${book.title}"? Tindakan ini tidak bisa dibatalkan.`)) {
      return;
    }

    setDeleting(true);
    setDeleteErrors([]);
    try {
      await deleteBook(book.id);
      router.push('/books');
    } catch (error) {
      setDeleteErrors(errorMessages(error));
      setDeleting(false);
    }
  }

  const details = [
    { label: 'Judul', value: book.title },
    { label: 'Penulis', value: book.author },
    { label: 'Status', value: STATUS_LABELS[book.status] },
    { label: 'Kategori', value: book.category?.name ?? 'Tanpa kategori' },
    { label: 'Ditambahkan', value: formatDateTime(book.createdAt) },
    { label: 'Terakhir diubah', value: formatDateTime(book.updatedAt) },
  ];

  return (
    <div className="max-w-2xl space-y-6">
      {backLink}
      <h1 className="text-2xl font-semibold text-gray-900">{book.title}</h1>

      <div className={cardClass}>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          {details.map((item) => (
            <div key={item.label}>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">{item.label}</dt>
              <dd className="mt-1 text-sm text-gray-900">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <section className={cardClass} aria-labelledby="edit-heading">
        <h2 id="edit-heading" className="mb-4 text-lg font-semibold text-gray-900">
          Ubah buku
        </h2>
        {notice && (
          <p role="status" className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {notice}
          </p>
        )}
        <div className="mb-4">
          <ErrorAlert messages={categoryErrors} />
        </div>
        {/* key: form diisi ulang dengan data tersimpan setelah berhasil diubah. */}
        <BookForm
          key={book.updatedAt}
          initialValues={{
            title: book.title,
            author: book.author,
            status: book.status,
            categoryId: book.categoryId ?? '',
          }}
          categories={categories}
          submitLabel="Simpan perubahan"
          onSubmit={handleSave}
        />
      </section>

      <section className={cardClass} aria-labelledby="delete-heading">
        <h2 id="delete-heading" className="mb-2 text-lg font-semibold text-gray-900">
          Hapus buku
        </h2>
        <p className="mb-4 text-sm text-gray-600">Buku yang dihapus tidak bisa dikembalikan.</p>
        <div className="space-y-3">
          <ErrorAlert messages={deleteErrors} />
          <button type="button" onClick={() => void handleDelete()} disabled={deleting} className={dangerButtonClass}>
            {deleting ? 'Menghapus…' : 'Hapus'}
          </button>
        </div>
      </section>
    </div>
  );
}
