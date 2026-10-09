import { existsSync, renameSync } from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import { sitePath, siteUrl } from './landing-i18n';
import { LANG_CODES } from './src/core/lang/index.ts';

/**
 * Site-wide SEO plumbing that depends on the public address:
 *
 *  - replaces `__SITE_URL__`, `__PLAY_URL__`, `__PARENTS_URL__` and
 *    `__USE_SUBDOMAINS__` in every HTML entry (canonical links, Open Graph,
 *    JSON-LD, the landing page's default portal links);
 *  - serves / emits `robots.txt` and `sitemap.xml` (the landing page in every
 *    language — `landing-i18n.ts` makes the pages themselves);
 *  - on Vercel, renames the built app shell `index.html` → `app.html`. Vercel
 *    serves an existing file before it looks at rewrites, so with an
 *    `index.html` in the output the root URL would always be the (noindex) app
 *    shell and never the landing page that `vercel.json` rewrites `/` to.
 *
 * The address comes from VITE_SITE_URL (the ROOT domain, no trailing slash).
 */
export function seo(): Plugin {
  const site = siteUrl();
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
  const alternates = [...LANG_CODES.map((lang) => `<xhtml:link rel="alternate" hreflang="${lang}" href="${site}/${sitePath(lang)}"/>`), `<xhtml:link rel="alternate" hreflang="x-default" href="${site}/"/>`].join('');
  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    // The landing page in each language, every one naming the others.
    ...LANG_CODES.map(
      (lang) =>
        `  <url><loc>${site}/${sitePath(lang)}</loc>${alternates}<lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>`,
    ),
    '</urlset>',
    '',
  ].join('\n');

  let outDir = 'dist';

  return {
    name: 'wonderkids-seo',

    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },

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

    closeBundle() {
      const shell = path.join(outDir, 'index.html');
      if (process.env.VERCEL && existsSync(shell)) renameSync(shell, path.join(outDir, 'app.html'));
    },
  };
}
