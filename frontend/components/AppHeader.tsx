'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clearToken } from '@/lib/auth';
import { secondaryButtonClass } from '@/lib/ui';

/** Header untuk semua halaman yang butuh login. */
export function AppHeader({ userName }: { userName: string }) {
  const router = useRouter();

  function handleLogout() {
    clearToken();
    router.replace('/login');
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/books" className="text-lg font-semibold text-gray-900">
          Personal Library
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">
            Halo, <span className="font-medium text-gray-900">{userName}</span>
          </span>
          <button type="button" onClick={handleLogout} className={secondaryButtonClass}>
            Keluar
          </button>
        </div>
      </div>
    </header>
  );
}
