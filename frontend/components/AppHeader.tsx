'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearToken } from '@/lib/auth';
import { secondaryButtonClass } from '@/lib/ui';

const NAV_ITEMS = [
  { href: '/books', label: 'Buku' },
  { href: '/dashboard', label: 'Dashboard' },
] as const;

/** Header untuk semua halaman yang butuh login. */
export function AppHeader({ userName }: { userName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    clearToken();
    router.replace('/login');
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/books" className="text-lg font-semibold text-gray-900">
            Personal Library
          </Link>
          <nav aria-label="Menu utama" className="flex gap-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                    active ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

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
