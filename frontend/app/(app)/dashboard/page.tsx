'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ErrorAlert } from '@/components/ErrorAlert';
import { errorMessages, getStats } from '@/lib/api';
import { BOOK_STATUSES, STATUS_LABELS } from '@/lib/labels';
import type { BookStats } from '@/lib/types';
import { cardClass } from '@/lib/ui';

interface StatsState {
  stats?: BookStats;
  errors?: string[];
}

export default function DashboardPage() {
  const [state, setState] = useState<StatsState | null>(null);

  useEffect(() => {
    let active = true;
    // Angka dihitung backend; tidak perlu mengambil seluruh GET /books.
    getStats()
      .then((stats) => {
        if (active) setState({ stats });
      })
      .catch((error: unknown) => {
        if (active) setState({ errors: errorMessages(error) });
      });
    return () => {
      active = false;
    };
  }, []);

  function renderContent() {
    if (!state) return <p className="text-sm text-gray-600">Memuat…</p>;
    if (!state.stats) return <ErrorAlert messages={state.errors ?? []} />;

    const { total, byStatus, byCategory } = state.stats;

    if (total === 0) {
      return (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white px-6 py-10 text-center text-sm text-gray-600">
          <p>Belum ada buku.</p>
          <Link href="/books" className="mt-2 inline-block font-medium text-blue-700 hover:underline">
            Tambah buku di halaman Daftar Buku
          </Link>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className={cardClass}>
            <p className="text-sm text-gray-600">Total buku</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{total}</p>
          </div>
          {BOOK_STATUSES.map((status) => (
            <div key={status} className={cardClass}>
              <p className="text-sm text-gray-600">{STATUS_LABELS[status]}</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{byStatus[status]}</p>
            </div>
          ))}
        </div>

        <section className={cardClass} aria-labelledby="category-heading">
          <h2 id="category-heading" className="mb-4 text-lg font-semibold text-gray-900">
            Per kategori
          </h2>
          <ul className="space-y-3">
            {byCategory.map((item) => {
              const name = item.name ?? 'Tanpa kategori';
              const percent = Math.round((item.count / total) * 100);
              return (
                <li key={item.categoryId ?? 'none'}>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-900">{name}</span>
                    <span className="text-gray-600">
                      {item.count} buku ({percent}%)
                    </span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-gray-100" aria-hidden="true">
                    <div className="h-2 rounded-full bg-blue-500" style={{ width: `${percent}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      {renderContent()}
    </div>
  );
}
