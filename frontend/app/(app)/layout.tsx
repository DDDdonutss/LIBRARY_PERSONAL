'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { ErrorAlert } from '@/components/ErrorAlert';
import { ApiError, errorMessages, getMe } from '@/lib/api';
import { useToken } from '@/lib/auth';
import type { User } from '@/lib/types';

interface Session {
  /** Token yang dipakai saat GET /auth/me. */
  token: string;
  user?: User;
  errors?: string[];
}

/**
 * Semua halaman di dalam folder (app) butuh login. Tanpa token langsung ke
 * /login; dengan token, GET /auth/me memastikan token masih berlaku.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  const token = useToken();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (token === null) router.replace('/login');
  }, [token, router]);

  useEffect(() => {
    if (!token) return;
    let active = true;
    getMe()
      .then((user) => {
        if (active) setSession({ token, user });
      })
      .catch((error: unknown) => {
        // 401: fungsi pemanggil API sudah menghapus token dan membuka /login.
        if (!active || (error instanceof ApiError && error.status === 401)) return;
        setSession({ token, errors: errorMessages(error) });
      });
    return () => {
      active = false;
    };
  }, [token]);

  const current = token && session?.token === token ? session : null;

  if (!current) {
    return <p className="p-6 text-sm text-gray-600">Memuat…</p>;
  }

  if (!current.user) {
    return (
      <div className="mx-auto w-full max-w-5xl p-6">
        <ErrorAlert messages={current.errors ?? []} />
      </div>
    );
  }

  return (
    <>
      <AppHeader userName={current.user.name} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </>
  );
}
