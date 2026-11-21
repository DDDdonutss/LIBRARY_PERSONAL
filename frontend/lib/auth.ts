import { useSyncExternalStore } from 'react';

const TOKEN_KEY = 'accessToken';

// Event `storage` bawaan browser hanya terkirim ke tab lain. Event ini
// memberi tahu komponen di tab yang sama bahwa token berubah.
const TOKEN_CHANGE_EVENT = 'auth-token-change';

/** Token yang tersimpan, atau `null`. Aman dipanggil di server (selalu `null`). */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function saveToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.dispatchEvent(new Event(TOKEN_CHANGE_EVENT));
}

/** Logout: backend tidak punya endpoint logout, cukup hapus token di browser. */
export function clearToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new Event(TOKEN_CHANGE_EVENT));
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener('storage', onChange);
  window.addEventListener(TOKEN_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(TOKEN_CHANGE_EVENT, onChange);
  };
}

/**
 * Token yang tersimpan, dibaca lewat useSyncExternalStore agar tidak dibaca
 * saat render di server dan tidak membuat hydration mismatch.
 *
 * - `undefined`: belum diketahui (render di server / saat hydration)
 * - `null`: belum login
 * - string: token
 */
export function useToken(): string | null | undefined {
  return useSyncExternalStore(subscribe, getToken, () => undefined);
}
