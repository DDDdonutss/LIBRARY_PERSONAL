import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    // E2E memakai aplikasi dan database sungguhan, jadi butuh variabel dari .env
    // (DATABASE_URL, JWT_SECRET, ...). Prefix '' = muat semua variabel.
    env: loadEnv('test', process.cwd(), ''),
    // bcrypt (cost 12) dan query database membuat beberapa test > 5 detik default.
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
