import type { Plugin } from 'vite';

/**
 * Site-wide SEO plumbing that depends on the public address:
 *
 *  - replaces `__SITE_URL__`, `__PLAY_URL__`, `__PARENTS_URL__` and
 *    `__USE_SUBDOMAINS__` in every HTML entry (canonical links, Open Graph,
 *    JSON-LD, the landing page's default portal links);
 *  - serves / emits `robots.txt` and `sitemap.xml`.
 *
 * The address comes from VITE_SITE_URL (the ROOT domain, no trailing slash).
 */
export function seo(): Plugin {
  const site = (process.env.VITE_SITE_URL ?? 'https://wonderkids.yluch.app').replace(/\/$/, '');
  const useSubdomains = process.env.VITE_USE_SUBDOMAINS !== 'false';
  const sub = (name: string) => (useSubdomains ? site.replace('://', `://${name}.`) : site);

  const robots = [
    'User-agent: *',
    'Allow: /',
    // Personal, behind-a-session and machine endpoints have no place in search.
    // (`/parent$` and `/parent/` — but not the public `/parent-login`.)
    ...['/api/', '/admin', '/parent$', '/parent/', '/play/', '/world', '/vault', '/who'].map((p) => `Disallow: ${p}`),
    '',
    `Sitemap: ${site}/sitemap.xml`,
    '',
  ].join('\n');

  const today = new Date().toISOString().slice(0, 10);
  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    `  <url><loc>${site}/</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>`,
    '</urlset>',
    '',
  ].join('\n');

  return {
    name: 'wonderkids-seo',

    transformIndexHtml(html) {
      return html
        .replaceAll('__SITE_URL__', site)
        .replaceAll('__PLAY_URL__', sub('play'))
        .replaceAll('__PARENTS_URL__', sub('parents'))
        .replaceAll('__USE_SUBDOMAINS__', String(useSubdomains));
    },

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/robots.txt') {
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          return res.end(robots);
        }
        if (req.url === '/sitemap.xml') {
          res.setHeader('Content-Type', 'application/xml; charset=utf-8');
          return res.end(sitemap);
        }
        return next();
      });
    },

    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots });
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap });
    },
  };
}
