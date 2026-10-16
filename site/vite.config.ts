import { brandAssets } from '@pulsar/brand/vite';
import { DEV_PORT, publicUrls } from '@pulsar/platform';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import { pages } from './build/pages.ts';
import { seo } from './build/seo.ts';

const root = fileURLToPath(new URL('.', import.meta.url));

// The public site: one static page per language, no framework. https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, root, 'VITE_');
  const urls = publicUrls(env.VITE_SITE_URL, { play: env.VITE_PLAY_URL, parents: env.VITE_PARENTS_URL, api: env.VITE_API_URL });

  return {
    plugins: [brandAssets(), seo(urls), pages(urls)],
    // Bound to the LAN, so the page can be read on a phone beside the game's dev server.
    server: { port: DEV_PORT.site, host: true },
    preview: { port: DEV_PORT.site, host: true },
    // Four templates: the page itself, the page a legal text stands in, the page of a game and the page of prices (`build/pages.ts` fills each per language).
    build: {
      rollupOptions: { input: { index: `${root}index.html`, legal: `${root}legal.html`, games: `${root}games.html`, pricing: `${root}pricing.html` } },
      // A font is a file of its own, never text inside the stylesheet: a browser then fetches only the subsets a page uses.
      assetsInlineLimit: (file) => (/\.woff2?$/.test(file) ? false : undefined),
    },
  };
});
