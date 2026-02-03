import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Relative paths for GitHub Pages
  build: {
    outDir: 'docs', // Build output directory
    emptyOutDir: true
  },
  server: {
    host: true,
    open: true
  }
});
