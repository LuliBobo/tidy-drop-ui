import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';

// Check if building for web
const isWeb = process.env.VITE_IS_WEB_BUILD === 'true';

export default defineConfig({
  plugins: [
    react(),
    // Only include Electron plugins when not building for web
    ...(isWeb
      ? [] 
      : [
          electron([
            {
              entry: 'src/main/main.ts',
              vite: {
                build: {
                  outDir: 'dist',
                  sourcemap: true,
                },
              },
            },
            {
              entry: 'src/preload/preload.ts',
              onstart(options) {
                options.reload();
              },
              vite: {
                build: {
                  outDir: 'preload',
                  emptyOutDir: true,
                  rollupOptions: {
                    output: {
                      entryFileNames: 'preload.js'
                    }
                  }
                }
              }
            },
          ]),
          renderer()
        ]
    ),
  ],
  // Use conditional base path depending on environment
  base: isWeb ? '/' : './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'punycode': 'punycode/', // Add punycode polyfill
    },
  },
  build: {
    outDir: 'dist/renderer',
    emptyOutDir: true,
  },
});
