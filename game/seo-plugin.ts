import type { Plugin } from 'vite';

/**
 * What the game's pages say to search engines and link previews:
 *
 *  - fills `__SITE_URL__` in the app shell (its preview picture is the public
 *    site's);
 *  - serves / emits `robots.txt`. Only the two login pages may be listed;
 *    everything behind a session is personal. (The sitemap is the public
 *    site's — `../site`.)
 */
export function seo(siteUrl: string): Plugin {
  const robots = [
    'User-agent: *',
    'Allow: /',
    // (`/parent$` and `/parent/` — but not the public `/parent-login`.)
    ...['/api/', '/admin', '/parent$', '/parent/', '/play/', '/world', '/vault', '/who'].map((p) => `Disallow: ${p}`),
    '',
  ].join('\n');

  return {
    name: 'pulsar-game-seo',

    transformIndexHtml: (html) => html.replaceAll('__SITE_URL__', siteUrl),

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url !== '/robots.txt') return next();
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end(robots);
      });
    },

    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots });
    },
  };
}
