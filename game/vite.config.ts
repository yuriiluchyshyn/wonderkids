import { brandAssets } from '@pulsar/brand/vite';
import { DEV_PORT, publicUrls } from '@pulsar/platform';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import { seo } from './seo-plugin';

const root = fileURLToPath(new URL('.', import.meta.url));

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, root, 'VITE_');
  const urls = publicUrls(env.VITE_SITE_URL, { play: env.VITE_PLAY_URL, parents: env.VITE_PARENTS_URL, api: env.VITE_API_URL });
  const { api } = urls;
  // The API is a deployment of its own (`../backend`). The production build
  // calls it at its own address; every other build (a preview, `vite preview`)
  // asks its own origin's `/api`, which `vercel.json` passes on to the API.
  if (process.env.VERCEL_ENV === 'production') process.env.VITE_API_URL ??= api;

  return {
    // A font is a file of its own, never text inside the stylesheet: a browser then fetches only the subsets a screen uses.
    build: { assetsInlineLimit: (file: string) => (/\.woff2?$/.test(file) ? false : undefined) },
    plugins: [react(), brandAssets(), seo(urls)],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      // Avoid the commonly-occupied 5173; bind to LAN for phone/tablet testing.
      port: DEV_PORT.game,
      host: true,
      // /api is the Java backend (`../backend`, started by `scripts/dev.sh`) on
      // its own port. Set VITE_API_TARGET to ask another one instead (e.g. the
      // deployed API: VITE_API_TARGET=https://api.pulsarkids.com).
      proxy: { '/api': { target: process.env.VITE_API_TARGET ?? `http://localhost:${DEV_PORT.api}`, changeOrigin: Boolean(process.env.VITE_API_TARGET), xfwd: true } },
    },
    preview: {
      port: DEV_PORT.game,
      host: true,
    },
  };
});
