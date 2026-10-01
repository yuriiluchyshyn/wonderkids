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
  },
  preview: {
    port: 4321,
    host: true,
  },
});
