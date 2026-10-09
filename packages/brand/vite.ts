import { readFileSync } from 'node:fs';
import type { Plugin } from 'vite';

/** The brand's files and the type each is served with. */
const ASSETS: Record<string, string> = {
  'favicon.svg': 'image/svg+xml',
  'apple-touch-icon.png': 'image/png',
};

const read = (name: string): Buffer => readFileSync(new URL(`./assets/${name}`, import.meta.url));

/**
 * Puts the brand's icons at the root of a deployment (`/favicon.svg`,
 * `/apple-touch-icon.png`): served by the dev server, emitted by the build.
 * The site and the game each deploy on their own, so each needs the files —
 * and they are kept once, here.
 */
export function brandAssets(): Plugin {
  return {
    name: 'pulsar-brand-assets',

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const name = (req.url ?? '').split('?')[0].slice(1);
        if (!(name in ASSETS)) return next();
        res.setHeader('Content-Type', ASSETS[name]);
        res.end(read(name));
      });
    },

    generateBundle() {
      for (const name of Object.keys(ASSETS)) this.emitFile({ type: 'asset', fileName: name, source: read(name) });
    },
  };
}
