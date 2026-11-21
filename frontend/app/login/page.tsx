'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { AuthCard } from '@/components/AuthCard';
import { ErrorAlert } from '@/components/ErrorAlert';
import { errorMessages, login } from '@/lib/api';
import { saveToken } from '@/lib/auth';
import { inputClass, labelClass, primaryButtonClass } from '@/lib/ui';
import { validateLogin } from '@/lib/validation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const problems = validateLogin({ email, password });
    if (problems.length > 0) {
      setErrors(problems);
      return;
    }

    setErrors([]);
    setSubmitting(true);
    try {
      const result = await login({ email: email.trim(), password });
      saveToken(result.accessToken);
      router.replace('/books');
    } catch (error) {
      // 401 = "Email atau password salah", 429 = terlalu banyak percobaan.
      setErrors(errorMessages(error));
      setSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Masuk"
      footer={
        <>
          Belum punya akun?{' '}
          <Link href="/register" className="font-medium text-blue-700 hover:underline">
            Daftar akun
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <ErrorAlert messages={errors} />

        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="password" className={labelClass}>
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={inputClass}
          />
        </div>

        <button type="submit" disabled={submitting} className={`${primaryButtonClass} w-full`}>
          {submitting ? 'Memproses…' : 'Masuk'}
        </button>
      </form>
    </AuthCard>
  );
}
