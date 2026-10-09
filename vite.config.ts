import {defineConfig} from 'vitest/config';

export default defineConfig({
  // Vitest resolves test imports through the base path, so it only applies to the app.
  base: process.env.VITEST ? '/' : '/sales-performance/',
  server: {port: 5180, open: '/sales-performance/?page=sales'},
  test: {include: ['sales-performance/tests/**/*.test.ts']},
});
