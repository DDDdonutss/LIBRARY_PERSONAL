'use client';

import { useState, type FormEvent } from 'react';
import { ErrorAlert } from './ErrorAlert';
import { errorMessages } from '@/lib/api';
import { BOOK_STATUSES, STATUS_LABELS } from '@/lib/labels';
import type { BookStatus, Category } from '@/lib/types';
import { inputClass, labelClass, primaryButtonClass } from '@/lib/ui';
import { validateBook } from '@/lib/validation';

/** Isi form buku. `categoryId: ''` berarti "Tanpa kategori". */
export interface BookFormValues {
  title: string;
  author: string;
  status: BookStatus;
  categoryId: string;
}

export const EMPTY_BOOK_VALUES: BookFormValues = {
  title: '',
  author: '',
  status: 'WANT_TO_READ',
  categoryId: '',
};

interface BookFormProps {
  initialValues: BookFormValues;
  /** Pilihan kategori dari GET /categories (diambil halaman); `null` = masih dimuat. */
  categories: Category[] | null;
  submitLabel: string;
  /** Dipanggil setelah isian valid. Error yang dilempar ditampilkan di form. */
  onSubmit: (values: BookFormValues) => Promise<void>;
}

/** Form tambah/ubah buku (dipakai di /books/new dan /books/[id]). */
export function BookForm({ initialValues, categories, submitLabel, onSubmit }: BookFormProps) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof BookFormValues>(field: K, value: BookFormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const problems = validateBook(values);
    if (problems.length > 0) {
      setErrors(problems);
      return;
    }

    setErrors([]);
    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      setErrors(errorMessages(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <ErrorAlert messages={errors} />

      <div>
        <label htmlFor="book-title" className={labelClass}>
          Judul
        </label>
        <input
          id="book-title"
          type="text"
          value={values.title}
          maxLength={200}
          onChange={(event) => update('title', event.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="book-author" className={labelClass}>
          Penulis
        </label>
        <input
          id="book-author"
          type="text"
          value={values.author}
          maxLength={150}
          onChange={(event) => update('author', event.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="book-status" className={labelClass}>
          Status
        </label>
        <select
          id="book-status"
          value={values.status}
          onChange={(event) => update('status', event.target.value as BookStatus)}
          className={inputClass}
        >
          {BOOK_STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="book-category" className={labelClass}>
          Kategori
        </label>
        {/* ID kategori selalu diambil dari GET /categories, tidak pernah ditulis di kode. */}
        <select
          id="book-category"
          value={values.categoryId}
          onChange={(event) => update('categoryId', event.target.value)}
          disabled={categories === null}
          className={inputClass}
        >
          <option value="">{categories === null ? 'Memuat kategori…' : 'Tanpa kategori'}</option>
          {categories?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" disabled={submitting} className={primaryButtonClass}>
        {submitting ? 'Menyimpan…' : submitLabel}
      </button>
    </form>
  );
}
