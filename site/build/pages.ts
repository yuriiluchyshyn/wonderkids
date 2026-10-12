import { createTranslator, type Dict } from '@pulsar/i18n';
import { CONTACT_EMAIL, type PublicUrls } from '@pulsar/platform';
import { readFileSync } from 'node:fs';
import type { Plugin } from 'vite';
import { DEFAULT_LANG, LANGUAGES, SITE_LANGS, sitePath, type SiteLang } from '../src/languages.ts';
import { LEGAL_DOCS, LEGAL_UPDATED, legalPath, type LegalDoc } from '../src/legal.ts';
import { catalogNumbers, gamesPages, type GamesPage } from './games.ts';
import { legalText } from './legal.ts';

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
 * `legal.html` is the second template — the page a legal text stands in. The
 * build fills it once per text and language (`/privacy/`, `/en/terms/`…; the
 * texts are `src/legal/<lang>/<doc>.md`, see `legal.ts`) and puts the text
 * beside it as Markdown (`index.md`). `games.html` is the third: the page of
 * a game, of a galaxy, and of all the games (`games.ts` — made from the game's
 * own catalogue: `/games/`, `/games/math/`, `/games/math/add/`…).
 *
 * What the template may say:
 *   {{section.key}}        a text, escaped for where it stands (HTML, or a JSON-LD string)
 *   {{{section.key}}}      a text that carries markup of its own (`<span>`, `<small>`)
 *   {{json:section}}       a whole section as a JSON object — the words of a script
 *   {{@lang}} {{@path}} {{@home}} {{@ogLocale}} {{@langShort}}  facts about the page (`@home` — the language's main page; on it the same as `@path`)
 *   {{@email}}                                                  where to write
 *   {{@gamesCount}} {{@levelsCount}}                            how many games and steps the language has (`@pulsar/catalog`)
 *   {{@docTitle}} {{@docDescription}} {{@docBody}} {{@docUpdatedIso}}   `legal.html` only: the text it holds
 *   {{@pageTitle}} {{@pageDescription}} {{@pageBody}} {{@ld}}           `games.html` only: the page of games it holds
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

/** What a template is filled with besides the dictionary, when it is the page of a text of its own. */
export interface PageOfItsOwn {
  /** Its address under a language's main page: `'privacy/'`. */
  slug: string;
  /** Ready HTML, put in as it is. */
  facts: Record<string, string>;
  /** Plain texts, escaped for where they stand — like the dictionary's. */
  texts: Record<string, string>;
  /** The languages the page exists in, when not all: only they are named as its other languages. */
  langs?: readonly SiteLang[];
}

/** The page in `lang`, from the template. `site` is the public address the page names itself by. Throws on a key the dictionary does not have. */
export function renderPage(template: string, lang: SiteLang, site: string, dictionaries: Dictionaries = loadDictionaries(), own?: PageOfItsOwn): string {
  const slug = own?.slug ?? '';
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
  // A language that does not have this page is offered its main page instead — never an address that is not there.
  const there = own?.langs ?? SITE_LANGS;
  const links = SITE_LANGS.map((code) => `<li><a href="/${sitePath(code)}${there.includes(code) ? slug : ''}" lang="${code}" hreflang="${code}" data-lang="${code}"${code === lang ? ' aria-current="page"' : ''}>${html(LANGUAGES[code].name)}</a></li>`);
  const facts: Record<string, string> = {
    lang,
    path: sitePath(lang) + slug,
    home: sitePath(lang),
    email: CONTACT_EMAIL,
    // How many games and steps there are — counted from the game's own catalogue, never typed: they change with the game.
    gamesCount: String(catalogNumbers(lang).games),
    levelsCount: String(catalogNumbers(lang).steps),
    ogLocale: LANGUAGES[lang].ogLocale,
    langShort: html(LANGUAGES[lang].short),
    langList: SITE_LANGS.map((code) => JSON.stringify(code)).join(', '),
    // When the page was last built — it is rebuilt only when it changed (`vercel.json`'s `ignoreCommand`).
    updatedIso: BUILT.toISOString().slice(0, 10),
    updated: html(new Intl.DateTimeFormat(lang, { dateStyle: 'long', timeZone: 'UTC' }).format(BUILT)),
    langLinks: links.join('\n            '),
    // Every page names all of its languages, itself included; `/` is where a visitor with no language yet lands.
    alternates: [...there.map((code) => `<link rel="alternate" hreflang="${code}" href="${site}/${sitePath(code)}${slug}" />`), ...(there.includes(DEFAULT_LANG) ? [`<link rel="alternate" hreflang="x-default" href="${site}/${slug}" />`] : [])].join('\n    '),
    ogAlternates: SITE_LANGS.filter((code) => code !== lang)
      .map((code) => `<meta property="og:locale:alternate" content="${LANGUAGES[code].ogLocale}" />`)
      .join('\n    '),
    ...own?.facts,
  };
  const fill = (source: string, escape: (text: string) => string): string =>
    source.replace(TOKEN, (all, raw?: string, json?: string, fact?: string, key?: string) => {
      if (raw) return text(raw);
      if (json) return section(json);
      if (fact) {
        if (own && fact in own.texts) return escape(own.texts[fact]);
        if (!(fact in facts)) throw new Error(`the template asks for «@${fact}», which is not a fact about the page`);
        return facts[fact];
      }
      return key ? escape(text(key)) : all;
    });
  // JSON-LD is not HTML: an entity there would be read as it is written.
  return template.split(JSON_LD).map((part, i) => (i % 4 === 2 ? fill(part, jsonString) : fill(part, html))).join('');
}

/** The page of a legal text in `lang`, from `legal.html`. */
export function renderLegalPage(template: string, lang: SiteLang, doc: LegalDoc, urls: PublicUrls, dictionaries: Dictionaries = loadDictionaries()): string {
  const text = legalText(lang, doc, urls);
  const description = ((dictionaries[lang].legalMeta ?? dictionaries[DEFAULT_LANG].legalMeta) as Dict)[doc] as string;
  return renderPage(template, lang, urls.site, dictionaries, {
    slug: `${doc}/`,
    facts: { docBody: text.html, docUpdatedIso: LEGAL_UPDATED[doc] },
    texts: { docTitle: text.title, docDescription: description },
  });
}

/** A page of games in `lang`, from `games.html`. */
export function renderGamesPage(template: string, lang: SiteLang, page: GamesPage, site: string, dictionaries: Dictionaries = loadDictionaries()): string {
  const ld = JSON.stringify({ '@context': 'https://schema.org', '@graph': page.ld }).replace(/</g, '\\u003c');
  return renderPage(template, lang, site, dictionaries, {
    slug: page.slug,
    langs: page.langs,
    facts: { pageBody: page.body, ld, pageRobots: page.index ? 'index, follow, max-image-preview:large' : 'noindex, follow' },
    texts: { pageTitle: page.title, pageDescription: page.description },
  });
}

const isLegalDoc = (name: string | undefined): name is LegalDoc => LEGAL_DOCS.some((doc) => doc === name);

const isSiteLang = (code: string | undefined): code is SiteLang => SITE_LANGS.some((lang) => lang === code);

/** The language a dev request asks for: `/en/`, `/pl/…`, or `?lang=`. */
function langOfUrl(url: string | undefined): SiteLang {
  const asked = /^\/(\w{2})(?:\/|$)/.exec(url ?? '')?.[1] ?? /[?&]lang=(\w{2})/.exec(url ?? '')?.[1];
  return isSiteLang(asked) ? asked : DEFAULT_LANG;
}

/** The legal text a dev request asks for: `/privacy/`, `/pl/terms/`, or `?doc=`. */
function docOfUrl(url: string): LegalDoc {
  const asked = /^\/(?:\w{2}\/)?(\w+)\/?(?:\?|$)/.exec(url)?.[1] ?? /[?&]doc=(\w+)/.exec(url)?.[1];
  return isLegalDoc(asked) ? asked : LEGAL_DOCS[0];
}

export function pages(urls: PublicUrls): Plugin {
  const { site } = urls;
  return {
    name: 'pulsar-site-pages',
    enforce: 'post',

    configureServer(server) {
      // `/en/` and `/pl/` are the page in that language (as the built files are).
      server.middlewares.use((req, _res, next) => {
        const lang = /^\/(\w{2})\/?(?:\?.*)?$/.exec(req.url ?? '')?.[1];
        if (isSiteLang(lang) && lang !== DEFAULT_LANG) req.url = `/index.html?lang=${lang}`;
        // `/privacy/`, `/pl/terms/` are a legal text in its page.
        const legal = /^\/(?:(\w{2})\/)?(\w+)\/?(?:\?.*)?$/.exec(req.url ?? '');
        if (legal && isLegalDoc(legal[2]) && (legal[1] === undefined || isSiteLang(legal[1]))) req.url = `/legal.html?lang=${legal[1] ?? DEFAULT_LANG}&doc=${legal[2]}`;
        // `/games/`, `/pl/games/math/add/` are a page of games.
        const games = /^\/(?:(\w{2})\/)?games(?:\/[\w-]+){0,2}\/?(?:\?.*)?$/.exec(req.url ?? '');
        if (games && (games[1] === undefined || isSiteLang(games[1]))) req.url = '/games.html';
        next();
      });
    },

    transformIndexHtml(source, ctx) {
      // Dev only: the build keeps the keys and renders every language at the end (`generateBundle`).
      if (!ctx.server) return source;
      const asked = ctx.originalUrl ?? ctx.path;
      if (ctx.path.endsWith('/legal.html')) return renderLegalPage(source, langOfUrl(asked), docOfUrl(asked), urls);
      if (ctx.path.endsWith('/games.html')) {
        const lang = langOfUrl(asked);
        const all = gamesPages(lang, urls, loadDictionaries());
        const slug = asked.replace(/\?.*$/, '').replace(/^\/(?:\w{2}\/)?(?=games)/, '').replace(/\/?$/, '/');
        return renderGamesPage(source, lang, all.find((page) => page.slug === slug) ?? all[0], site);
      }
      return renderPage(source, langOfUrl(asked), site);
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

      // The legal texts: each in its page, and beside it as Markdown. The template itself is not a page.
      const legal = bundle['legal.html'];
      if (legal && legal.type === 'asset') {
      for (const lang of SITE_LANGS) {
        for (const doc of LEGAL_DOCS) {
          this.emitFile({ type: 'asset', fileName: `${legalPath(lang, doc)}index.html`, source: renderLegalPage(String(legal.source), lang, doc, urls, dictionaries) });
          this.emitFile({ type: 'asset', fileName: `${legalPath(lang, doc)}index.md`, source: legalText(lang, doc, urls).markdown });
        }
      }
      delete bundle['legal.html'];
      }

      // The pages of games: each in its page, and beside it as Markdown.
      const games = bundle['games.html'];
      if (!games || games.type !== 'asset') return;
      for (const lang of SITE_LANGS) {
        for (const page of gamesPages(lang, urls, dictionaries)) {
          this.emitFile({ type: 'asset', fileName: `${sitePath(lang)}${page.slug}index.html`, source: renderGamesPage(String(games.source), lang, page, site, dictionaries) });
          this.emitFile({ type: 'asset', fileName: `${sitePath(lang)}${page.slug}index.md`, source: page.markdown });
        }
      }
      delete bundle['games.html'];
    },
  };
}
