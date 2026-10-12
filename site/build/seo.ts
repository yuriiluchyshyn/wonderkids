import type { Dict } from '@pulsar/i18n';
import { TRIAL_PATH, type PublicUrls } from '@pulsar/platform';
import type { Plugin } from 'vite';
import { LANGUAGES, SITE_LANGS, sitePath, type SiteLang } from '../src/languages.ts';
import { loadDictionaries, type Dictionaries } from './pages.ts';

/** The language `llms.txt` is written in: the one an assistant of any country reads. */
const LLMS_LANG: SiteLang = 'en';

/**
 * `/llms.txt` — the page told plainly, for the assistants that answer a
 * parent's question instead of a search page (llmstxt.org): what Pulsar Kids
 * is, every game it has, what it does about mistakes and screen time, and
 * where its pages are. It has no words of its own: every line is a text of the
 * site's dictionary, so it says what the page says — numbers included.
 */
export function llmsTxt(urls: PublicUrls, dictionaries: Dictionaries = loadDictionaries(), lang: SiteLang = LLMS_LANG): string {
  const words = dictionaries[lang];
  const group = (name: string): Dict => words[name] as Dict;
  const text = (of: Dict, key: string): string => String(of[key]).replace(/<[^>]+>/g, '');
  /** The cards of a section — each a `title` and a `text` —, as a list. */
  const cards = (of: Dict): string[] => Object.values(of).flatMap((card) => (typeof card === 'string' ? [] : [`- **${text(card, 'title')}**: ${text(card, 'text')}`]));
  const [meta, hero, about, games, world, parents, start, faq, cta] = ['meta', 'hero', 'about', 'games', 'world', 'parents', 'start', 'faq', 'cta'].map(group);
  /** Questions with their answers: a heading each, so one can be quoted whole. */
  const answers = Object.values(faq).flatMap((pair) => (typeof pair === 'string' ? [] : ['', `### ${text(pair, 'title')}`, '', text(pair, 'text')]));

  const subjects = Object.values(games).flatMap((subject) => {
    if (typeof subject === 'string') return [];
    const lines = Object.entries(subject).flatMap(([key, line]) => (/^\d+$/.test(key) ? [`- ${line}`] : []));
    return ['', `### ${text(subject, 'title')}${subject.tag ? ` (${text(subject, 'tag')})` : ''}`, '', ...lines];
  });

  return [
    '# Pulsar Kids',
    '',
    `> ${text(meta, 'description')}`,
    '',
    text(hero, 'lead'),
    '',
    `## ${text(about, 'title')}`,
    '',
    text(about, 'sub'),
    '',
    ...cards(about),
    '',
    `## ${text(games, 'title')}`,
    '',
    text(games, 'sub'),
    ...subjects,
    '',
    `## ${text(world, 'title')}`,
    '',
    text(world, 'sub'),
    '',
    ...cards(world),
    '',
    `## ${text(cta, 'parents')}`,
    '',
    text(parents, 'sub'),
    '',
    ...cards(parents),
    '',
    `## ${text(start, 'title')}`,
    '',
    ...cards(start),
    '',
    `## ${text(faq, 'title')}`,
    ...answers,
    '',
    '## Links',
    '',
    ...SITE_LANGS.map((lang) => `- [${text(dictionaries[lang].meta as Dict, 'title')}](${urls.site}/${sitePath(lang)}) — ${LANGUAGES[lang].name}`),
    `- [${text(cta, 'try')}](${urls.play}${TRIAL_PATH}): ${text(hero, 'tryNote')}`,
    `- [${text(cta, 'parents')}](${urls.parents}/)`,
    '',
  ].join('\n');
}

/**
 * The site's SEO plumbing that depends on the public addresses:
 *
 *  - fills `__SITE_URL__`, `__PLAY_URL__`, `__PARENTS_URL__` and `__API_URL__` in the page
 *    (canonical links, Open Graph, JSON-LD, the links into the game and the
 *    address its letters go to);
 *  - serves / emits `robots.txt`, `sitemap.xml` (the page in every
 *    language — `pages.ts` makes the pages themselves) and `llms.txt`.
 *
 * `robots.txt` lets everyone in — search engines and the assistants' crawlers
 * alike, the latter by name (`AI_CRAWLERS`): the page is there to be found and
 * quoted. For the assistants there are also `llms.txt` (the page in English),
 * `llms-full.txt` (in every language) and each page as Markdown (`index.md`).
 */
/**
 * The crawlers of the AI assistants, by what each is for. All are let in — the
 * page is there to be found, quoted and known —, and they are named so that
 * this is a decision, not an oversight: to keep the texts out of the training
 * of models while staying in the assistants' search, turn `training` to
 * `Disallow` and leave the rest.
 */
export const AI_CRAWLERS = {
  /** The assistants' own search indexes: who can be cited in an answer. */
  search: ['OAI-SearchBot', 'PerplexityBot', 'Claude-SearchBot', 'Applebot', 'DuckAssistBot'],
  /** A page fetched because a person asked the assistant about it. */
  user: ['ChatGPT-User', 'Claude-User', 'Perplexity-User', 'MistralAI-User'],
  /** Training of models, and Gemini's use of what Google already crawled. */
  training: ['GPTBot', 'ClaudeBot', 'Google-Extended', 'Applebot-Extended', 'CCBot', 'meta-externalagent'],
} as const;

export function robotsTxt(site: string): string {
  const group = (agents: readonly string[]): string[] => [...agents.map((agent) => `User-agent: ${agent}`), 'Allow: /', ''];
  return ['User-agent: *', 'Allow: /', '', '# AI assistants: their search, pages fetched for a person, and training — all welcome.', ...group(AI_CRAWLERS.search), ...group(AI_CRAWLERS.user), ...group(AI_CRAWLERS.training), `Sitemap: ${site}/sitemap.xml`, ''].join('\n');
}

export function seo(urls: PublicUrls): Plugin {
  const { site } = urls;

  const robots = robotsTxt(site);

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
    '/llms.txt': ['text/plain; charset=utf-8', llmsTxt(urls)],
    // Everything, in every language, in one request.
    '/llms-full.txt': ['text/plain; charset=utf-8', SITE_LANGS.map((lang) => llmsTxt(urls, undefined, lang)).join('\n---\n\n')],
    // Each page as Markdown, beside it: `/index.md`, `/en/index.md` (the page names it in a `<link>` and a `Link` header).
    ...Object.fromEntries(SITE_LANGS.map((lang) => [`/${sitePath(lang)}index.md`, ['text/markdown; charset=utf-8', llmsTxt(urls, undefined, lang)] as [string, string]])),
  };

  return {
    name: 'pulsar-site-seo',

    transformIndexHtml: (html) => html.replaceAll('__SITE_URL__', site).replaceAll('__PLAY_URL__', urls.play).replaceAll('__PARENTS_URL__', urls.parents).replaceAll('__API_URL__', urls.api),

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const file = served[req.url ?? ''];
        if (!file) return next();
        res.setHeader('Content-Type', file[0]);
        res.end(file[1]);
      });
    },

    generateBundle() {
      for (const [path, [, body]] of Object.entries(served)) this.emitFile({ type: 'asset', fileName: path.slice(1), source: body });
    },
  };
}
