import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Resolves the path aliases declared in tsconfig.json, including the ones
  // added by `nest g library`. Requires Vite 8, which ships this option.
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['**/*.spec.ts'],
    // Unit test (src/**/*.spec.ts) memakai mock, tanpa database. Pengujian
    // API lengkap lewat e2e (npm run test:e2e) dan Bruno.
    passWithNoTests: true,
  },
});
