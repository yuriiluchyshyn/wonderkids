import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // Avoid the commonly-occupied 5173; bind to LAN for phone/tablet testing.
    port: 4321,
    host: true,
    proxy: {
      // Forward API calls to the backend so the browser stays same-origin
      // (no CORS) in dev. Override the backend port via VITE_API_TARGET.
      '/api': {
        target: process.env.VITE_API_TARGET ?? 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 4321,
    host: true,
  },
});
