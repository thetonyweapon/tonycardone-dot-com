/// <reference types="vitest" />
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function spaFallbackPlugin() {
  return {
    name: 'spa-fallback',
    apply: 'build',
    closeBundle() {
      const indexFile = resolve(process.cwd(), 'dist', 'index.html');
      if (existsSync(indexFile)) {
        writeFileSync(resolve(process.cwd(), 'dist', '404.html'), readFileSync(indexFile));
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), spaFallbackPlugin()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
});
