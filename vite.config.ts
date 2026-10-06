import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { devApi } from './dev-api';
import { seo } from './seo-plugin';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), devApi(), seo()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // Avoid the commonly-occupied 5173; bind to LAN for phone/tablet testing.
    port: 4321,
    host: true,
    // /api is served in-process by devApi() from ./api. Set VITE_API_TARGET to
    // proxy it to another backend instead (e.g. the deployed API).
    proxy: process.env.VITE_API_TARGET
      ? { '/api': { target: process.env.VITE_API_TARGET, changeOrigin: true } }
      : undefined,
  },
  build: {
    rollupOptions: {
      // Two pages: the app, and the static public landing page (root domain).
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        landing: fileURLToPath(new URL('./landing.html', import.meta.url)),
      },
    },
  },
  preview: {
    port: 4321,
    host: true,
  },
});
