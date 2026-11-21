'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useToken } from '@/lib/auth';

/** Halaman awal: langsung ke daftar buku bila sudah login, atau ke halaman Masuk. */
export default function HomePage() {
  const token = useToken();
  const router = useRouter();

  useEffect(() => {
    if (token === undefined) return; // belum diketahui (saat hydration)
    router.replace(token ? '/books' : '/login');
  }, [token, router]);

  return <p className="p-6 text-sm text-gray-600">Memuat…</p>;
}
