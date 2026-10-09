import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vitest/config';

export default defineConfig({
  base: '/',
  server: {port: 5182, strictPort: true, open: '/sales-performance/?page=sales'},
  build: {rollupOptions: {input: {
    home: fileURLToPath(new URL('./index.html', import.meta.url)),
    salesPerformance: fileURLToPath(new URL('./sales-performance/index.html', import.meta.url)),
    salesGrowth: fileURLToPath(new URL('./sales-growth/index.html', import.meta.url)),
  }}},
  test: {include: ['sales-performance/tests/**/*.test.ts']},
});
