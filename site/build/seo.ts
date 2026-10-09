import type { PublicUrls } from '@pulsar/platform';
import type { Plugin } from 'vite';
import { SITE_LANGS, sitePath } from '../src/languages.ts';

/**
 * The site's SEO plumbing that depends on the public addresses:
 *
 *  - fills `__SITE_URL__`, `__PLAY_URL__` and `__PARENTS_URL__` in the page
 *    (canonical links, Open Graph, JSON-LD, the links into the game and the
 *    address its letters go to);
 *  - serves / emits `robots.txt` and `sitemap.xml` (the page in every
 *    language — `pages.ts` makes the pages themselves).
 */
export function seo(urls: PublicUrls): Plugin {
  const { site } = urls;

  const robots = ['User-agent: *', 'Allow: /', '', `Sitemap: ${site}/sitemap.xml`, ''].join('\n');

  const today = new Date().toISOString().slice(0, 10);
  const alternates = [...SITE_LANGS.map((lang) => `<xhtml:link rel="alternate" hreflang="${lang}" href="${site}/${sitePath(lang)}"/>`), `<xhtml:link rel="alternate" hreflang="x-default" href="${site}/"/>`].join('');
  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    // The page in each language, every one naming the others.
    ...SITE_LANGS.map((lang) => `  <url><loc>${site}/${sitePath(lang)}</loc>${alternates}<lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>`),
    '</urlset>',
    '',
  ].join('\n');

  const served: Record<string, [type: string, body: string]> = {
    '/robots.txt': ['text/plain; charset=utf-8', robots],
    '/sitemap.xml': ['application/xml; charset=utf-8', sitemap],
  };

  return {
    name: 'pulsar-site-seo',

    transformIndexHtml: (html) => html.replaceAll('__SITE_URL__', site).replaceAll('__PLAY_URL__', urls.play).replaceAll('__PARENTS_URL__', urls.parents),

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const file = served[req.url ?? ''];
        if (!file) return next();
        res.setHeader('Content-Type', file[0]);
        res.end(file[1]);
      });
    },

    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots });
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap });
    },
  };
}
