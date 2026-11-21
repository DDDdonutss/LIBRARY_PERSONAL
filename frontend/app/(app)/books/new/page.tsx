'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookForm, EMPTY_BOOK_VALUES, type BookFormValues } from '@/components/BookForm';
import { ErrorAlert } from '@/components/ErrorAlert';
import { createBook } from '@/lib/api';
import { cardClass } from '@/lib/ui';
import { useCategories } from '@/lib/useCategories';

export default function NewBookPage() {
  const router = useRouter();
  const { categories, errors: categoryErrors } = useCategories();

  async function handleCreate(values: BookFormValues) {
    await createBook({
      title: values.title.trim(),
      author: values.author.trim(),
      status: values.status,
      // "Tanpa kategori" dikirim sebagai null, tidak pernah string kosong.
      categoryId: values.categoryId || null,
    });
    router.push('/books');
  }

  return (
    <div className="max-w-xl space-y-6">
      <Link href="/books" className="text-sm font-medium text-blue-700 hover:underline">
        ← Kembali ke daftar buku
      </Link>
      <h1 className="text-2xl font-semibold text-gray-900">Tambah Buku</h1>
      <ErrorAlert messages={categoryErrors} />
      <div className={cardClass}>
        <BookForm
          initialValues={EMPTY_BOOK_VALUES}
          categories={categories}
          submitLabel="Simpan buku"
          onSubmit={handleCreate}
        />
      </div>
    </div>
  );
}
