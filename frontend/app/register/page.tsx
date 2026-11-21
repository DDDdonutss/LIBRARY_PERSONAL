'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { AuthCard } from '@/components/AuthCard';
import { ErrorAlert } from '@/components/ErrorAlert';
import { errorMessages, register } from '@/lib/api';
import { saveToken } from '@/lib/auth';
import { inputClass, labelClass, primaryButtonClass } from '@/lib/ui';
import { validateRegister } from '@/lib/validation';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const problems = validateRegister({ name, email, password });
    if (problems.length > 0) {
      setErrors(problems);
      return;
    }

    setErrors([]);
    setSubmitting(true);
    try {
      const result = await register({ name: name.trim(), email: email.trim(), password });
      // Backend langsung mengembalikan token: pengguna tidak perlu masuk ulang.
      saveToken(result.accessToken);
      router.replace('/books');
    } catch (error) {
      // 409 = email sudah terdaftar, 400 = validasi, 429 = terlalu banyak percobaan.
      setErrors(errorMessages(error));
      setSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Daftar Akun"
      footer={
        <>
          Sudah punya akun?{' '}
          <Link href="/login" className="font-medium text-blue-700 hover:underline">
            Masuk
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <ErrorAlert messages={errors} />

        <div>
          <label htmlFor="name" className={labelClass}>
            Nama
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            maxLength={100}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            maxLength={255}
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
            autoComplete="new-password"
            maxLength={72}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-gray-500">8–72 karakter.</p>
        </div>

        <button type="submit" disabled={submitting} className={`${primaryButtonClass} w-full`}>
          {submitting ? 'Memproses…' : 'Daftar'}
        </button>
      </form>
    </AuthCard>
  );
}
