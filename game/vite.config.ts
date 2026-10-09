import { brandAssets } from '@pulsar/brand/vite';
import { DEV_PORT, publicUrls } from '@pulsar/platform';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import { devApi } from './dev-api';
import { seo } from './seo-plugin';

const root = fileURLToPath(new URL('.', import.meta.url));

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const { site } = publicUrls(loadEnv(mode, root, 'VITE_').VITE_SITE_URL);

  return {
    plugins: [react(), devApi(), brandAssets(), seo(site)],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      // Avoid the commonly-occupied 5173; bind to LAN for phone/tablet testing.
      port: DEV_PORT.game,
      host: true,
      // /api is served in-process by devApi() from ./api. Set VITE_API_TARGET to
      // proxy it to another backend instead (e.g. the deployed API).
      proxy: process.env.VITE_API_TARGET ? { '/api': { target: process.env.VITE_API_TARGET, changeOrigin: true } } : undefined,
    },
    preview: {
      port: DEV_PORT.game,
      host: true,
    },
  };
});
