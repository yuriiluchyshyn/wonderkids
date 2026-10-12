import { createTranslator, type Dict } from '@pulsar/i18n';
import { readFileSync } from 'node:fs';
import type { Plugin } from 'vite';
import { DEFAULT_LANG, LANGUAGES, SITE_LANGS, sitePath, type SiteLang } from '../src/languages.ts';

/**
 * The public page in every language of the site.
 *
 * `index.html` is ONE template: it holds no text of its own, only keys of the
 * site's dictionary (`src/locales/<lang>.json` and `src/locales/seo/<lang>.json`). The build turns it into a
 * static page per language, so crawlers get real content at an address of its
 * own:
 *
 *   /      Ukrainian  (dist/index.html)
 *   /en/   English    (dist/en/index.html)
 *   /pl/   Polish     (dist/pl/index.html)
 *
 * What the template may say:
 *   {{section.key}}        a text, escaped for where it stands (HTML, or a JSON-LD string)
 *   {{{section.key}}}      a text that carries markup of its own (`<span>`, `<small>`)
 *   {{json:section}}       a whole section as a JSON object — the words of a script
 *   {{@lang}} {{@path}} {{@ogLocale}} {{@langShort}}            facts about the page
 *   {{@updated}} {{@updatedIso}}                                when the page was built, for a reader and for a machine
 *   {{@langList}}                                               every language of the site, as the items of a JSON list
 *   {{@alternates}} {{@ogAlternates}} {{@langLinks}}            links to its other languages
 *
 * A key the dictionary does not have fails the build. In dev the same pages
 * are served at `/` (`?lang=pl`), `/en/` and `/pl/`.
 *
 * Which language a visitor is sent to at `/` is decided by `vercel.json`.
 */

export type Dictionaries = Record<SiteLang, Dict>;

/**
 * A language's words come from two files: what the page says to a reader
 * (`src/locales/<lang>.json`) and what it says to search engines, link
 * previews and assistants (`src/locales/seo/<lang>.json` — title, description,
 * Open Graph, the texts of the structured data). The template asks for both
 * the same way, so a new SEO text is a key in the second file and its
 * `{{key}}` in `index.html`. A section may live in one file only.
 */
export function loadDictionaries(): Dictionaries {
  const read = (file: string): Dict => JSON.parse(readFileSync(new URL(`../src/locales/${file}.json`, import.meta.url), 'utf8')) as Dict;
  const of = (lang: SiteLang): Dict => {
    const [page, seo] = [read(lang), read(`seo/${lang}`)];
    const twice = Object.keys(seo).filter((section) => section in page);
    if (twice.length > 0) throw new Error(`src/locales/${lang}.json and src/locales/seo/${lang}.json both have «${twice.join('», «')}»`);
    return { ...seo, ...page };
  };
  return Object.fromEntries(SITE_LANGS.map((lang) => [lang, of(lang)])) as Dictionaries;
}

const html = (text: string): string => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/** The inside of a JSON string — and never a way out of the `<script>` it stands in. */
const jsonString = (text: string): string => JSON.stringify(text).slice(1, -1).replace(/</g, '\\u003c');

const BUILT = new Date();

const TOKEN = /\{\{\{([\w.]+)\}\}\}|\{\{json:([\w.]+)\}\}|\{\{@(\w+)\}\}|\{\{([\w.]+)\}\}/g;
const JSON_LD = /(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/g;

/** The page in `lang`, from the template. `site` is the public address the page names itself by. Throws on a key the dictionary does not have. */
export function renderPage(template: string, lang: SiteLang, site: string, dictionaries: Dictionaries = loadDictionaries()): string {
  const t = createTranslator<string, SiteLang>(dictionaries, DEFAULT_LANG);
  const known = t.keys();
  const text = (key: string): string => {
    if (!known.has(key)) throw new Error(`index.html asks for «${key}», which neither src/locales/${DEFAULT_LANG}.json nor src/locales/seo/${DEFAULT_LANG}.json has`);
    return t(lang, key);
  };
  const section = (name: string): string => {
    const prefix = `${name}.`;
    const keys = [...known.keys()].filter((key) => key.startsWith(prefix));
    if (keys.length === 0) throw new Error(`index.html asks for the section «${name}», which the site dictionary does not have`);
    return JSON.stringify(Object.fromEntries(keys.map((key) => [key.slice(prefix.length), t(lang, key)]))).replace(/</g, '\\u003c');
  };
  const links = SITE_LANGS.map((code) => `<li><a href="/${sitePath(code)}" lang="${code}" hreflang="${code}" data-lang="${code}"${code === lang ? ' aria-current="page"' : ''}>${html(LANGUAGES[code].name)}</a></li>`);
  const facts: Record<string, string> = {
    lang,
    path: sitePath(lang),
    ogLocale: LANGUAGES[lang].ogLocale,
    langShort: html(LANGUAGES[lang].short),
    langList: SITE_LANGS.map((code) => JSON.stringify(code)).join(', '),
    // When the page was last built — it is rebuilt only when it changed (`vercel.json`'s `ignoreCommand`).
    updatedIso: BUILT.toISOString().slice(0, 10),
    updated: html(new Intl.DateTimeFormat(lang, { dateStyle: 'long', timeZone: 'UTC' }).format(BUILT)),
    langLinks: links.join('\n            '),
    // Every page names all of its languages, itself included; `/` is where a visitor with no language yet lands.
    alternates: [...SITE_LANGS.map((code) => `<link rel="alternate" hreflang="${code}" href="${site}/${sitePath(code)}" />`), `<link rel="alternate" hreflang="x-default" href="${site}/" />`].join('\n    '),
    ogAlternates: SITE_LANGS.filter((code) => code !== lang)
      .map((code) => `<meta property="og:locale:alternate" content="${LANGUAGES[code].ogLocale}" />`)
      .join('\n    '),
  };
  const fill = (source: string, escape: (text: string) => string): string =>
    source.replace(TOKEN, (all, raw?: string, json?: string, fact?: string, key?: string) => {
      if (raw) return text(raw);
      if (json) return section(json);
      if (fact) {
        if (!(fact in facts)) throw new Error(`index.html asks for «@${fact}», which is not a fact about the page`);
        return facts[fact];
      }
      return key ? escape(text(key)) : all;
    });
  // JSON-LD is not HTML: an entity there would be read as it is written.
  return template.split(JSON_LD).map((part, i) => (i % 4 === 2 ? fill(part, jsonString) : fill(part, html))).join('');
}

const isSiteLang = (code: string | undefined): code is SiteLang => SITE_LANGS.some((lang) => lang === code);

/** The language a dev request asks for: `/en/`, `/pl/…`, or `?lang=`. */
function langOfUrl(url: string | undefined): SiteLang {
  const asked = /^\/(\w{2})(?:\/|$)/.exec(url ?? '')?.[1] ?? /[?&]lang=(\w{2})/.exec(url ?? '')?.[1];
  return isSiteLang(asked) ? asked : DEFAULT_LANG;
}

export function pages(site: string): Plugin {
  return {
    name: 'pulsar-site-pages',
    enforce: 'post',

    configureServer(server) {
      // `/en/` and `/pl/` are the page in that language (as the built files are).
      server.middlewares.use((req, _res, next) => {
        const lang = /^\/(\w{2})\/?(?:\?.*)?$/.exec(req.url ?? '')?.[1];
        if (isSiteLang(lang) && lang !== DEFAULT_LANG) req.url = `/index.html?lang=${lang}`;
        next();
      });
    },

    transformIndexHtml(source, ctx) {
      // Dev only: the build keeps the keys and renders every language at the end (`generateBundle`).
      if (!ctx.server) return source;
      return renderPage(source, langOfUrl(ctx.originalUrl ?? ctx.path), site);
    },

    generateBundle(_options, bundle) {
      const page = bundle['index.html'];
      if (!page || page.type !== 'asset') return;
      const template = String(page.source);
      const dictionaries = loadDictionaries();
      for (const lang of SITE_LANGS) {
        const rendered = renderPage(template, lang, site, dictionaries);
        if (lang === DEFAULT_LANG) page.source = rendered;
        else this.emitFile({ type: 'asset', fileName: `${sitePath(lang)}index.html`, source: rendered });
      }
    },
  };
}
