/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const useFixture = (process.env.VITE_USE_FIXTURE ?? env.VITE_USE_FIXTURE) === '1';
  if (command === 'build' && useFixture && mode !== 'test') {
    throw new Error('VITE_USE_FIXTURE=1 is dev-only: fixtures must never be part of a production build.');
  }
  return {
    // GitHub Pages subpath support: VITE_BASE=/repo-name/ ; default relative './'
    base: process.env.VITE_BASE ?? env.VITE_BASE ?? './',
    publicDir: 'public',
    plugins: [react()],
    server: {
      fs: {
        deny: ['.env', '.env.*', '*.{crt,pem}', '**/.git/**', '**/.recovery/**'],
      },
    },
    build: {
      target: 'es2022',
      chunkSizeWarningLimit: 1200,
      // The previous public bundle is preserved in frontend/.recovery; only
      // this clean output tree is eligible for deployment.
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('node_modules/maplibre-gl')) return 'maplibre';
            if (id.includes('node_modules/react')) return 'react';
            return undefined;
          },
        },
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      css: false,
    },
  };
});
