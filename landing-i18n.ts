import { readFileSync } from 'node:fs';
import type { Plugin } from 'vite';
import { createTranslator, type Dict } from './src/core/i18n/engine.ts';
import { DEFAULT_LANG, LANG_CODES, LANGUAGES, type LangCode } from './src/core/lang/index.ts';

/**
 * The public landing page in every language of the site.
 *
 * `landing.html` is ONE template: it holds no text of its own, only keys of
 * the site's dictionary (`src/locales/site/<lang>.json` — kept apart from the
 * game's, `src/locales/app`). The build turns it into a static page per
 * language, so crawlers get real content at an address of its own:
 *
 *   /      Ukrainian  (dist/landing.html — `vercel.json` rewrites `/` to it)
 *   /en/   English    (dist/en/index.html)
 *   /pl/   Polish     (dist/pl/index.html)
 *
 * What the template may say:
 *   {{section.key}}        a text, escaped for where it stands (HTML, or a JSON-LD string)
 *   {{{section.key}}}      a text that carries markup of its own (`<span>`, `<small>`)
 *   {{json:section}}       a whole section as a JSON object — the words of an inline script
 *   {{@lang}} {{@path}} {{@ogLocale}} {{@langShort}}            facts about the page
 *   {{@alternates}} {{@ogAlternates}} {{@langLinks}}            links to its other languages
 *
 * A key the dictionary does not have fails the build. In dev the same page is
 * served at `/landing.html` (`?lang=pl`), `/en/` and `/pl/`.
 *
 * Which language a visitor is sent to at `/` is decided by `vercel.json`.
 */

const here = (file: string): URL => new URL(file, import.meta.url);

/** The address of a language's page under the site root: `''`, `'en/'`, `'pl/'`. */
export const sitePath = (lang: LangCode): string => (lang === DEFAULT_LANG ? '' : `${lang}/`);

/** The public address of the site (the ROOT domain, no trailing slash). */
export const siteUrl = (): string => (process.env.VITE_SITE_URL ?? 'https://pulsarkids.com').replace(/\/$/, '');

export function loadSiteDictionaries(): Record<LangCode, Dict> {
  return Object.fromEntries(LANG_CODES.map((lang) => [lang, JSON.parse(readFileSync(here(`./src/locales/site/${lang}.json`), 'utf8')) as Dict])) as Record<LangCode, Dict>;
}

const html = (text: string): string => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/** The inside of a JSON string — and never a way out of the `<script>` it stands in. */
const jsonString = (text: string): string => JSON.stringify(text).slice(1, -1).replace(/</g, '\\u003c');

const TOKEN = /\{\{\{([\w.]+)\}\}\}|\{\{json:([\w.]+)\}\}|\{\{@(\w+)\}\}|\{\{([\w.]+)\}\}/g;
const JSON_LD = /(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/g;

/** The landing page in `lang`, from the template. Throws on a key the dictionary does not have. */
export function renderLanding(template: string, lang: LangCode, dictionaries: Record<LangCode, Dict> = loadSiteDictionaries()): string {
  const t = createTranslator<string>(dictionaries, DEFAULT_LANG);
  const known = t.keys();
  const site = siteUrl();
  const text = (key: string): string => {
    if (!known.has(key)) throw new Error(`landing.html asks for «${key}», which src/locales/site/${DEFAULT_LANG}.json does not have`);
    return t(lang, key);
  };
  const section = (name: string): string => {
    const prefix = `${name}.`;
    const keys = [...known.keys()].filter((key) => key.startsWith(prefix));
    if (keys.length === 0) throw new Error(`landing.html asks for the section «${name}», which the site dictionary does not have`);
    return JSON.stringify(Object.fromEntries(keys.map((key) => [key.slice(prefix.length), t(lang, key)]))).replace(/</g, '\\u003c');
  };
  const links = LANG_CODES.map((code) => `<li><a href="/${sitePath(code)}" lang="${code}" hreflang="${code}" data-lang="${code}"${code === lang ? ' aria-current="page"' : ''}>${html(LANGUAGES[code].name)}</a></li>`);
  const facts: Record<string, string> = {
    lang,
    path: sitePath(lang),
    ogLocale: LANGUAGES[lang].locale.replace('-', '_'),
    langShort: html(LANGUAGES[lang].short),
    langLinks: links.join('\n            '),
    // Every page names all of its languages, itself included; `/` is where a visitor with no language yet lands.
    alternates: [...LANG_CODES.map((code) => `<link rel="alternate" hreflang="${code}" href="${site}/${sitePath(code)}" />`), `<link rel="alternate" hreflang="x-default" href="${site}/" />`].join('\n    '),
    ogAlternates: LANG_CODES.filter((code) => code !== lang)
      .map((code) => `<meta property="og:locale:alternate" content="${LANGUAGES[code].locale.replace('-', '_')}" />`)
      .join('\n    '),
  };
  const fill = (source: string, escape: (text: string) => string): string =>
    source.replace(TOKEN, (all, raw?: string, json?: string, fact?: string, key?: string) => {
      if (raw) return text(raw);
      if (json) return section(json);
      if (fact) {
        if (!(fact in facts)) throw new Error(`landing.html asks for «@${fact}», which is not a fact about the page`);
        return facts[fact];
      }
      return key ? escape(text(key)) : all;
    });
  // JSON-LD is not HTML: an entity there would be read as it is written.
  return template.split(JSON_LD).map((part, i) => (i % 4 === 2 ? fill(part, jsonString) : fill(part, html))).join('');
}

/** The language a dev request asks for: `/en/`, `/pl/…`, or `?lang=`. */
function langOfUrl(url: string | undefined): LangCode {
  const asked = /^\/(\w{2})(?:\/|$)/.exec(url ?? '')?.[1] ?? /[?&]lang=(\w{2})/.exec(url ?? '')?.[1];
  return LANG_CODES.find((code) => code === asked) ?? DEFAULT_LANG;
}

export function landingI18n(): Plugin {
  return {
    name: 'pulsar-landing-i18n',
    enforce: 'post',

    configureServer(server) {
      // `/en/` and `/pl/` are the landing page in that language (as the built files are).
      server.middlewares.use((req, _res, next) => {
        const lang = /^\/(\w{2})\/?(?:\?.*)?$/.exec(req.url ?? '')?.[1];
        if (lang && lang !== DEFAULT_LANG && LANG_CODES.some((code) => code === lang)) req.url = `/landing.html?lang=${lang}`;
        next();
      });
    },

    transformIndexHtml(source, ctx) {
      // Dev only: the build keeps the keys and renders every language at the end (`generateBundle`).
      if (!ctx.server || !ctx.path.startsWith('/landing.html')) return source;
      return renderLanding(source, langOfUrl(ctx.originalUrl?.startsWith('/landing.html') ? ctx.originalUrl : (ctx.originalUrl ?? ctx.path)));
    },

    generateBundle(_options, bundle) {
      const page = bundle['landing.html'];
      if (!page || page.type !== 'asset') return;
      const template = String(page.source);
      const dictionaries = loadSiteDictionaries();
      for (const lang of LANG_CODES) {
        const rendered = renderLanding(template, lang, dictionaries);
        if (lang === DEFAULT_LANG) page.source = rendered;
        else this.emitFile({ type: 'asset', fileName: `${sitePath(lang)}index.html`, source: rendered });
      }
    },
  };
}
