import type { ReactNode } from 'react';
import { cardClass } from '@/lib/ui';

/** Kerangka halaman Masuk dan Daftar Akun. */
export function AuthCard({
  title,
  children,
  footer,
}: {
  title: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <p className="mb-6 text-center text-lg font-semibold text-gray-900">Personal Library</p>
        <div className={cardClass}>
          <h1 className="mb-6 text-2xl font-semibold text-gray-900">{title}</h1>
          {children}
        </div>
        <p className="mt-4 text-center text-sm text-gray-600">{footer}</p>
      </div>
    </main>
  );
}
