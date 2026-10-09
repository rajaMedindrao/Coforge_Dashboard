import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vitest/config';
import sharedConfig from '../vite.config';

export default defineConfig({
  ...sharedConfig,
  root: fileURLToPath(new URL('..', import.meta.url)),
  server: {...sharedConfig.server, open: '/sales-growth/'},
  test: {include: ['sales-growth/tests/**/*.test.ts']},
});
