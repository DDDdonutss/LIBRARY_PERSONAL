// Pemeriksaan isian sebelum dikirim. Aturannya mengikuti backend
// (docs/API-CONTRACT.md §2 dan §4.2); backend tetap pemeriksa akhir.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email: string): string[] {
  if (!email) return ['Email wajib diisi.'];
  if (email.length > 255) return ['Email maksimal 255 karakter.'];
  if (!EMAIL_PATTERN.test(email)) return ['Format email tidak valid.'];
  return [];
}

export function validateRegister(values: {
  name: string;
  email: string;
  password: string;
}): string[] {
  const errors: string[] = [];
  const name = values.name.trim();

  if (!name) errors.push('Nama wajib diisi.');
  else if (name.length > 100) errors.push('Nama maksimal 100 karakter.');

  errors.push(...validateEmail(values.email.trim()));

  if (values.password.length < 8) errors.push('Password minimal 8 karakter.');
  else if (values.password.length > 72) errors.push('Password maksimal 72 karakter.');

  return errors;
}

export function validateLogin(values: { email: string; password: string }): string[] {
  const errors = validateEmail(values.email.trim());

  if (!values.password) errors.push('Password wajib diisi.');
  else if (values.password.length > 72) errors.push('Password maksimal 72 karakter.');

  return errors;
}

export function validateBook(values: { title: string; author: string }): string[] {
  const errors: string[] = [];
  const title = values.title.trim();
  const author = values.author.trim();

  if (!title) errors.push('Judul wajib diisi.');
  else if (title.length > 200) errors.push('Judul maksimal 200 karakter.');

  if (!author) errors.push('Penulis wajib diisi.');
  else if (author.length > 150) errors.push('Penulis maksimal 150 karakter.');

  return errors;
}
