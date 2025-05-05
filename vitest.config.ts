import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '#imports': fileURLToPath(new URL('./.nuxt/imports.d.ts', import.meta.url)),
      '#auth-utils': fileURLToPath(new URL('./src/runtime/utils/index.ts', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
