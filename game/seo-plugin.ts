import type { PublicUrls } from '@pulsar/platform';
import { readFileSync } from 'node:fs';
import type { Plugin } from 'vite';

/**
 * A page of the game that search engines may list. Everything else is behind
 * a session and personal; these two are the doors.
 */
export interface PublicPage {
  /** The shell built for it; `vercel.json` serves it at `path` on the page's portal. */
  file: string;
  /** The portal it belongs to, and its address there. */
  portal: 'play' | 'parents';
  path: string;
  /** The section of the SEO texts (`src/locales/seo/<lang>.json`) that holds its `title` and `description`. */
  texts: 'login' | 'parentLogin';
}

export const PUBLIC_PAGES: PublicPage[] = [
  { file: 'login.html', portal: 'play', path: '/login', texts: 'login' },
  { file: 'parent-login.html', portal: 'parents', path: '/parent-login', texts: 'parentLogin' },
];

/**
 * The language the shells are written in. A page of the game has one address
 * for every language, so what the server sends can speak only one; once the
 * app runs, `usePageMeta` says the same in the visitor's own.
 */
export const SHELL_LANG = 'uk';

type SeoTexts = Record<string, Record<string, string>>;

/** What the game says to search engines and link previews, in a language: `src/locales/seo/<lang>.json`. */
export const seoTexts = (lang: string = SHELL_LANG): SeoTexts => JSON.parse(readFileSync(new URL(`./src/locales/seo/${lang}.json`, import.meta.url), 'utf8')) as SeoTexts;

/** The app shell with its `{{section.key}}` filled from the SEO texts. Throws on a key they do not have. */
export function fillShell(shell: string, texts: SeoTexts = seoTexts()): string {
  return shell.replace(/\{\{(\w+)\.(\w+)\}\}/g, (_all, section: string, key: string) => {
    const text = texts[section]?.[key];
    if (text === undefined) throw new Error(`index.html asks for «${section}.${key}», which src/locales/seo/${SHELL_LANG}.json does not have`);
    return attr(text);
  });
}

const attr = (text: string): string => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * The (filled) app shell as a public page is served: listed (`index`), under its own
 * title and description, naming its one address. Throws when the shell no
 * longer has a tag this rewrites — a silent miss would leave a public page
 * saying `noindex`.
 */
export function publicShell(shell: string, page: PublicPage, urls: PublicUrls): string {
  const { title, description } = seoTexts()[page.texts];
  const url = `${urls[page.portal]}${page.path}`;
  const swap = (html: string, tag: RegExp, to: string): string => {
    if (!tag.test(html)) throw new Error(`index.html has no ${tag} for the public page ${page.path}`);
    return html.replace(tag, to);
  };
  let html = shell;
  html = swap(html, /<meta name="robots" content="[^"]*"\s*\/>/, `<meta name="robots" content="index, follow" />\n    <link rel="canonical" href="${url}" />`);
  html = swap(html, /<title>[^<]*<\/title>/, `<title>${attr(title)}</title>`);
  html = swap(html, /(<meta\s+name="description"\s+content=")[^"]*"/, `$1${attr(description)}"`);
  html = swap(html, /(<meta property="og:title" content=")[^"]*"/, `$1${attr(title)}"`);
  html = swap(html, /(<meta\s+property="og:description"\s+content=")[^"]*"/, `$1${attr(description)}"`);
  html = swap(html, /<meta property="og:image" /, `<meta property="og:url" content="${url}" />\n    <meta property="og:image" `);
  return html;
}

/**
 * What the game's pages say to search engines and link previews:
 *
 *  - fills the app shell's head: its words from `src/locales/seo/<lang>.json`
 *    (`{{shell.title}}`) and `__SITE_URL__` (its preview picture is the public
 *    site's);
 *  - builds a shell of its own for each public page (`PUBLIC_PAGES`): the app
 *    shell says `noindex`, and a crawler that reads that does not run the
 *    script that would change it — so the two login pages get theirs from the
 *    server, already saying `index`;
 *  - serves / emits `robots.txt`. Only the two login pages may be listed;
 *    everything behind a session is personal. (The sitemap is the public
 *    site's — `../site`.)
 */
export function seo(urls: PublicUrls): Plugin {
  const robots = [
    'User-agent: *',
    'Allow: /',
    // (`/parent$` and `/parent/` — but not the public `/parent-login`. The trial game counts every arrival — not a crawler's.)
    ...['/api/', '/admin', '/parent$', '/parent/', '/play/', '/world', '/vault', '/who', '/try'].map((p) => `Disallow: ${p}`),
    '',
  ].join('\n');

  return {
    name: 'pulsar-game-seo',
    enforce: 'post',

    transformIndexHtml: (html) => fillShell(html).replaceAll('__SITE_URL__', urls.site),

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url !== '/robots.txt') return next();
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end(robots);
      });
    },

    generateBundle(_options, bundle) {
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots });
      const shell = bundle['index.html'];
      if (!shell || shell.type !== 'asset') return;
      for (const page of PUBLIC_PAGES) this.emitFile({ type: 'asset', fileName: page.file, source: publicShell(String(shell.source), page, urls) });
    },
  };
}
