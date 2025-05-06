import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    coverage: {
      provider: 'v8',
    },
    include: ['./tests/frontend/**/*.{test,spec}.{js,ts,jsx,tsx}'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});