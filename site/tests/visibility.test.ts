/**
 * Can a new game be found — by a search engine and by an AI assistant?
 *
 * A game added to the game is not yet a game anyone can find. These tests go
 * through EVERY game of the catalogue (`@pulsar/catalog`), in every language,
 * and fail — naming the game and what to do — when one of the things that make
 * it findable is missing:
 *
 *   1. it is in `sitemap.xml`, in `llms.txt` and has its page as Markdown;
 *   2. the numbers the main site states agree with the games there are;
 *   3. its card says enough, and its page carries everything a search result
 *      and an assistant need;
 *   4. its page is open to search engines — none is `noindex`;
 *   5. the lists lead only to pages that are built, and the pages only to one another;
 *   6. the button on its page is understood by the game, and its words are in the page's language.
 *
 * The steps for a new game are in `CLAUDE.md`, «Adding or changing a game:
 * what makes it findable».
 */
import { CATALOG_LANGS, agesOf, loadCatalog, type CatalogGalaxy, type CatalogGame } from '@pulsar/catalog';
import { LEGAL_DOCS, gameOfId, publicUrls } from '@pulsar/platform';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { ALIKE_LIMIT, GAMES_SLUG, galaxySlug, gamePageSlug, gamesPages, trialOfGame, type GamesPage } from '../build/games.ts';
import { countedWords, loadDictionaries, renderGamesPage, renderPage } from '../build/pages.ts';
import { PRICING_SLUG } from '../build/pricing.ts';
import { AI_CRAWLERS, llmsTxt, robotsTxt, sitemapXml } from '../build/seo.ts';
import { DEFAULT_LANG, SITE_LANGS, sitePath, type SiteLang } from '../src/languages.ts';
import { legalPath } from '../src/legal.ts';

const read = (file: string): string => readFileSync(new URL(file, import.meta.url), 'utf8');
const URLS = publicUrls();
const dictionaries = loadDictionaries();
const homeTemplate = read('../index.html');
const gamesTemplate = read('../games.html');

const CATALOG = Object.fromEntries(CATALOG_LANGS.map((lang) => [lang, loadCatalog(lang)])) as Record<SiteLang, CatalogGalaxy[]>;
const PAGES = Object.fromEntries(SITE_LANGS.map((lang) => [lang, gamesPages(lang, URLS, dictionaries)])) as Record<SiteLang, GamesPage[]>;

/** Every game of a language, with its galaxy and the page made for it. */
function* everyGame(lang: SiteLang): Generator<{ galaxy: CatalogGalaxy; game: CatalogGame; page: GamesPage | undefined; name: string }> {
  for (const galaxy of CATALOG[lang]) {
    for (const game of galaxy.games) {
      const slug = gamePageSlug(galaxy.id, game.sub);
      yield { galaxy, game, page: PAGES[lang].find((page) => page.slug === slug), name: `${lang} · ${game.id} «${game.title}»` };
    }
  }
}

const address = (lang: SiteLang, slug: string): string => `${URLS.site}/${sitePath(lang)}${slug}`;
/** The languages a game is written in — the ones its page must name. */
const langsOf = (id: string): SiteLang[] => SITE_LANGS.filter((lang) => CATALOG[lang].some((galaxy) => galaxy.games.some((game) => game.id === id)));
const words = (lang: SiteLang): Record<string, Record<string, unknown>> => dictionaries[lang] as Record<string, Record<string, unknown>>;

test('the site’s languages are the catalogue’s, and every language has games', () => {
  assert.deepEqual([...CATALOG_LANGS].sort(), [...SITE_LANGS].sort(), 'a language of the catalogue (game/scripts/catalog.mjs) has no site, or the other way round');
  for (const lang of SITE_LANGS) assert.ok(CATALOG[lang].flatMap((galaxy) => galaxy.games).length > 0, `${lang}: packages/catalog/src/${lang}.json has no games — run «npm run catalog» in game/`);
});

test('1 · every game is in sitemap.xml, in llms.txt and has its page as Markdown', () => {
  const sitemap = sitemapXml(URLS, dictionaries);
  const robots = robotsTxt(URLS.site);
  // What lets a crawler in at all: the sitemap is named, and the assistants' crawlers are let in by name.
  assert.ok(robots.includes(`Sitemap: ${URLS.site}/sitemap.xml`) && !robots.includes('Disallow'), 'robots.txt names the sitemap and shuts nobody out');
  for (const agent of [...AI_CRAWLERS.search, ...AI_CRAWLERS.user]) assert.ok(robots.includes(`User-agent: ${agent}\n`), `robots.txt lets ${agent} in`);

  for (const lang of SITE_LANGS) {
    const llms = llmsTxt(URLS, dictionaries, lang);
    // The pages that lead to the games: all of them, and each galaxy.
    for (const slug of [GAMES_SLUG, ...CATALOG[lang].map((galaxy) => galaxySlug(galaxy.id))]) {
      assert.ok(sitemap.includes(`<loc>${address(lang, slug)}</loc>`), `${lang}: ${slug} is not in sitemap.xml`);
      assert.ok(llms.includes(`(${address(lang, slug)})`), `${lang}: ${slug} is not in llms.txt`);
    }

    for (const { galaxy, game, page, name } of everyGame(lang)) {
      assert.ok(page, `${name}: no page was made for it — is its galaxy «${galaxy.id}» one the site builds?`);
      const url = address(lang, page.slug);

      // The search engines' list: the page itself, and its other languages.
      const entry = new RegExp(`<url><loc>${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</loc>(.*?)</url>`).exec(sitemap)?.[1];
      assert.ok(entry !== undefined, `${name}: ${url} is not in sitemap.xml (a page marked noindex is left out — see test 4)`);
      for (const other of langsOf(game.id)) assert.ok(entry.includes(`hreflang="${other}" href="${address(other, page.slug)}"`), `${name}: its sitemap entry does not name its ${other} page`);
      assert.match(entry, /<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/, `${name}: its sitemap entry has no date`);

      // The assistants' list: a line with its name, its address and what it is.
      assert.ok(llms.includes(`- [${game.title}](${url}): `), `${name}: no line in llms.txt`);

      // The page as Markdown, served beside it and named in its head.
      assert.ok(page.markdown.startsWith(`# ${game.title}\n`), `${name}: its Markdown does not begin with its name`);
      assert.ok(page.markdown.includes(trialOfGame(URLS.play, game.id)), `${name}: its Markdown has no way into the game`);
      for (const task of game.samples) assert.ok(page.markdown.includes(task.prompt), `${name}: its Markdown lacks the task «${task.prompt}»`);
      const html = renderGamesPage(gamesTemplate, lang, page, URLS.site, dictionaries);
      assert.ok(html.includes(`<link rel="alternate" type="text/markdown" href="__SITE_URL__/${sitePath(lang)}${page.slug}index.md" />`), `${name}: the page does not name its Markdown`);
    }
  }

  // `llms-full.txt` is every language's text in one: a game of any language is in it by its own address.
  const full = SITE_LANGS.map((lang) => llmsTxt(URLS, dictionaries, lang)).join('\n');
  for (const lang of SITE_LANGS) for (const { page, name } of everyGame(lang)) assert.ok(page && full.includes(`(${address(lang, page.slug)})`), `${name}: not in llms-full.txt`);
});

test('2 · the numbers the main site states are the numbers of games there are', () => {
  for (const lang of SITE_LANGS) {
    const galaxies = CATALOG[lang];
    const games = galaxies.flatMap((galaxy) => galaxy.games);
    const steps = games.reduce((sum, game) => sum + game.steps, 0);
    const home = renderPage(homeTemplate, lang, URLS.site, dictionaries);
    const counted = countedWords(lang, dictionaries);
    const fix = `— say «{games}» in the text and let the build count them (site/build/pages.ts, countedWords)`;

    // The band of big numbers: all three are counted from the catalogue.
    assert.ok(home.includes(`<b>${games.length}</b>`), `${lang}: the main page does not show ${games.length} games`);
    assert.ok(home.includes(`<b>${steps}</b>`), `${lang}: the main page does not show ${steps} steps`);
    assert.ok(home.includes(`<b>${galaxies.length}</b>`), `${lang}: the main page does not show ${galaxies.length} galaxies`);

    // Wherever the copy says how many games there are, it asks the catalogue — a number of its own would go stale.
    const said: [where: string, text: unknown][] = [
      ['games.title', words(lang).games.title],
      ['faq.what.text', (words(lang).faq.what as Record<string, unknown>).text],
      ['meta.description', words(lang).meta.description],
      ['meta.ogDescription', words(lang).meta.ogDescription],
      ['meta.twitterDescription', words(lang).meta.twitterDescription],
    ];
    for (const [where, text] of said) assert.ok(String(text).includes('{games}'), `${lang}: ${where} writes down how many games there are ${fix}`);
    // And the page comes out with the number, not with the word for it.
    assert.ok(!home.includes('{games}'), `${lang}: the main page still says «{games}» — the build did not fill it`);

    // Every galaxy has its card on the main page, leading to its page and saying how many games it has — counted, never typed.
    for (const galaxy of galaxies) {
      const card = words(lang).games[galaxy.id] as { title?: string } | undefined;
      assert.ok(card?.title, `${lang}: the galaxy «${galaxy.id}» has no card on the main page (games.${galaxy.id} in the dictionary, and its <article> in site/index.html)`);
      assert.ok(home.includes(`href="/${sitePath(lang)}${galaxySlug(galaxy.id)}"`), `${lang}: the main page does not lead to ${galaxySlug(galaxy.id)}`);
      const count = galaxy.games.length;
      const tag = counted.perGalaxy[`count${galaxy.id.charAt(0).toUpperCase()}${galaxy.id.slice(1)}`];
      assert.ok(tag?.startsWith(`${count} `), `${lang}: the «${galaxy.id}» card says «${tag}», and the galaxy has ${count} games`);
      assert.ok(home.includes(`>${tag}<`), `${lang}: the «${galaxy.id}» card on the main page does not show «${tag}» — site/index.html asks for another key than {{@count…}}`);
    }

    // The structured data names every galaxy as a subject of the application.
    const graph = JSON.parse(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(home)?.[1] ?? '{}')['@graph'] as { '@type': string; about?: string[] }[];
    assert.equal(graph.find((node) => node['@type'] === 'WebApplication')?.about?.length, galaxies.length, `${lang}: the WebApplication's «about» in site/index.html does not list ${galaxies.length} galaxies`);
  }
});

test('3 · every game’s card says enough, and its page carries what a search result and an assistant need', () => {
  for (const lang of SITE_LANGS) {
    const mechanics = (words(lang).catalog.mechanics ?? {}) as Record<string, string>;
    const about = (words(lang).catalog.about ?? {}) as Record<string, Record<string, string>>;
    const titles = new Set<string>();
    const descriptions = new Set<string>();

    for (const { galaxy, game, page, name } of everyGame(lang)) {
      // --- the card, as the game wrote it (packages/catalog) ---
      assert.ok(game.title.trim().length >= 3, `${name}: no name`);
      assert.ok(game.icon.trim().length > 0, `${name}: no icon`);
      assert.ok(game.blurb.trim().length >= 10, `${name}: its blurb «${game.blurb}» says too little — write what the child does, in the game's card`);
      assert.ok(game.stars.every((star) => Number.isInteger(star) && star >= 1 && star <= 3) && game.stars[0] <= game.stars[1], `${name}: its difficulty ${game.stars} is not 1–3 stars — the page's age is read off it`);
      assert.ok(Number.isInteger(game.steps) && game.steps >= 1, `${name}: no steps`);
      assert.ok(game.tasksPerLevel >= 5 && game.tasksPerLevel <= 10, `${name}: ${game.tasksPerLevel} tasks a level`);
      assert.ok(game.mechanics.length > 0, `${name}: its card names no board (mechanics) — the page cannot say how it is played`);
      for (const board of game.mechanics) assert.ok(mechanics[board], `${name}: the board ${board} has no phrase — add catalog.mechanics.${board} to site/src/locales/${lang}.json`);

      // Real tasks are what makes the page the game's own: from each step sampled, or a few of a free game.
      const sampled = new Set(game.samples.map((task) => task.step));
      const wanted = game.kind === 'path' ? new Set([1, Math.ceil(game.steps / 2), game.steps]) : new Set([1]);
      for (const step of wanted) assert.ok(sampled.has(step), `${name}: no task from step ${step} — run «npm run catalog» in game/`);
      for (const task of game.samples) assert.ok(task.prompt.trim().length >= 5 && !/undefined|\[object/.test(task.prompt), `${name}: a task without words: «${task.prompt}»`);
      // The same question may come back on a later step with other numbers; within a step it is one task.
      assert.equal(new Set(game.samples.map((task) => `${task.step}|${task.prompt}`)).size, game.samples.length, `${name}: the same task twice on one step`);

      // Something of its own to tell a parent beyond the blurb: what the game says before play, or a paragraph written for the site.
      const told = game.intro.trim() || about[galaxy.id]?.[game.sub] || '';
      assert.ok(told.length >= 60, `${name}: nothing but a blurb to tell — give the game an intro (SubCategory.intro), or write catalog.about.${galaxy.id}.${game.sub} in site/src/locales/${lang}.json`);

      // --- the page made of it ---
      assert.ok(page, `${name}: no page`);
      const html = renderGamesPage(gamesTemplate, lang, page, URLS.site, dictionaries);
      assert.ok(!html.includes('{{') && !/undefined|\[object/.test(page.body), `${name}: a hole in its page`);
      assert.ok(page.title.includes(game.title) && page.title.length <= 70, `${name}: its title «${page.title}» (${page.title.length}) must name the game and fit a search result`);
      assert.ok(page.description.length >= 60 && page.description.length <= 180, `${name}: a description of ${page.description.length} characters — a search result shows about 160`);
      assert.ok(!titles.has(page.title) && !descriptions.has(page.description), `${name}: another game has the same title or description`);
      titles.add(page.title);
      descriptions.add(page.description);
      assert.equal(html.match(/<h1[\s>]/g)?.length, 1, `${name}: one main heading`);
      assert.ok(html.includes(`<html lang="${lang}">`) && html.includes(`<title>${page.title.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}</title>`), `${name}: its head`);
      assert.ok(html.includes(`<meta property="og:title"`) && html.includes(`<meta property="og:description"`) && html.includes(`<meta property="og:image"`), `${name}: no link preview`);

      // What it shows a reader: its tasks, what it is, and the way straight into it.
      for (const task of game.samples) assert.ok(page.body.includes(task.prompt.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')), `${name}: the page lacks the task «${task.prompt}»`);
      const [from, to] = agesOf(game);
      assert.ok(page.body.includes(`${from}–${to}`), `${name}: the page does not say the age ${from}–${to}`);
      assert.ok(page.body.includes(`href="${trialOfGame(URLS.play, game.id).replace(/&/g, '&amp;')}"`), `${name}: its button does not open this very game`);
      assert.ok(page.body.includes(`href="/${sitePath(lang)}${galaxySlug(galaxy.id)}"`) && page.body.includes(`href="/${sitePath(lang)}${GAMES_SLUG}"`), `${name}: no way back to its galaxy and to all games`);

      // What it tells a machine: a learning resource with its name, age, subject and language, and where it stands on the site.
      const graph = JSON.parse(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html)?.[1] ?? '{}')['@graph'] as Record<string, unknown>[];
      const resource = graph.find((node) => node['@type'] === 'LearningResource');
      assert.ok(resource, `${name}: no LearningResource in its structured data`);
      assert.deepEqual(
        { name: resource.name, url: resource.url, inLanguage: resource.inLanguage, typicalAgeRange: resource.typicalAgeRange, teaches: resource.teaches },
        { name: game.title, url: address(lang, page.slug), inLanguage: lang, typicalAgeRange: `${from}-${to}`, teaches: galaxy.title },
        `${name}: its structured data`,
      );
      assert.ok(String(resource.description).length >= 10, `${name}: its structured data has no description`);
      const crumbs = (graph.find((node) => node['@type'] === 'BreadcrumbList') as { itemListElement?: { name: string }[] } | undefined)?.itemListElement;
      assert.deepEqual(crumbs?.slice(-2).map((crumb) => crumb.name), [galaxy.title, game.title], `${name}: its breadcrumbs`);
    }
  }

  // A game is the same game in every language it is written in: one address, and each page names the others.
  for (const { game, page } of everyGame(DEFAULT_LANG)) assert.deepEqual(page?.langs, langsOf(game.id), `${game.id}: its page names other languages than the game is written in`);
});

test('4 · every game’s page is open to search engines — none is noindex', () => {
  const sitemap = sitemapXml(URLS, dictionaries);
  const closed: string[] = [];
  for (const lang of SITE_LANGS) {
    for (const { page, name } of everyGame(lang)) {
      assert.ok(page, `${name}: no page`);
      const html = renderGamesPage(gamesTemplate, lang, page, URLS.site, dictionaries);
      const robots = /<meta name="robots" content="([^"]*)"/.exec(html)?.[1] ?? '';
      const open = page.index && robots.startsWith('index, follow') && sitemap.includes(`<loc>${address(lang, page.slug)}</loc>`);
      // A page is closed for one reason only: it says mostly what the next game's page says.
      if (!open) closed.push(`${name} — ${Math.round(page.alike * 100)}% of it is said on the next game's page too (the limit is ${ALIKE_LIMIT * 100}%)`);
      // The address a search engine keeps is the page's own, in its own language.
      assert.ok(html.includes(`<link rel="canonical" href="__SITE_URL__/${sitePath(lang)}${page.slug}" />`), `${name}: its canonical address is not its own`);
      assert.ok(html.includes(`hreflang="${lang}" href="${address(lang, page.slug)}"`), `${name}: it does not name itself among its languages`);
      assert.ok(!/noindex/.test(robots) || !page.index, `${name}: marked noindex though it is its own`);
    }
    // The pages that lead to the games are open too.
    for (const page of PAGES[lang].filter((other) => other.kind !== 'game')) assert.ok(page.index && sitemap.includes(`<loc>${address(lang, page.slug)}</loc>`), `${lang}: ${page.slug} is closed to search engines`);
  }
  assert.deepEqual(closed, [], 'these games are hidden from search engines. Give each more of its own to say — a fuller blurb or an intro in the game, or catalog.about.<galaxy>.<game> in the site’s dictionary — and run «npm run catalog»; do not raise the limit');

  // Nothing shuts the pages of games out at the door either: no rule of robots.txt, no header of vercel.json.
  const { headers } = JSON.parse(read('../vercel.json')) as { headers: { source: string; headers: { key: string; value: string }[] }[] };
  for (const rule of headers.filter((candidate) => candidate.headers.some((header) => header.key === 'X-Robots-Tag' && /noindex/.test(header.value)))) {
    assert.ok(!new RegExp(`^${rule.source}$`).test(`/${GAMES_SLUG}math/add/`), `vercel.json: the rule «${rule.source}» marks the pages of games noindex`);
  }
});

test('5 · sitemap.xml and llms.txt lead only to pages that are built, and the pages only to one another', () => {
  // Every address the build makes a page at.
  const built = new Set<string>();
  for (const lang of SITE_LANGS) {
    built.add(address(lang, ''));
    for (const doc of LEGAL_DOCS) built.add(`${URLS.site}/${legalPath(lang, doc)}`);
    built.add(address(lang, PRICING_SLUG));
    for (const page of PAGES[lang]) built.add(address(lang, page.slug));
  }

  // A search engine sent to an address that is not there thinks less of the whole list.
  const listed = [...sitemapXml(URLS, dictionaries).matchAll(/<loc>([^<]+)<\/loc>/g)].map((found) => found[1]);
  assert.equal(new Set(listed).size, listed.length, 'sitemap.xml names an address twice');
  for (const url of listed) assert.ok(built.has(url), `sitemap.xml names ${url}, which the build does not make`);
  for (const [, url] of sitemapXml(URLS, dictionaries).matchAll(/hreflang="[^"]+" href="([^"]+)"/g)) assert.ok(built.has(url), `sitemap.xml names ${url} as another language of a page, and it is not built`);

  for (const lang of SITE_LANGS) {
    // An assistant follows the links of llms.txt: those into the site must be pages.
    for (const [, url] of llmsTxt(URLS, dictionaries, lang).matchAll(/\]\((https?:[^)]+)\)/g)) {
      if (url.startsWith(`${URLS.site}/`)) assert.ok(built.has(url), `${lang}: llms.txt leads to ${url}, which the build does not make`);
    }
    // A reader — and a crawler — follows the links of a page: each leads to a page of this language.
    for (const page of PAGES[lang]) {
      for (const [, href] of page.body.matchAll(/href="(\/[^"#]*)"/g)) assert.ok(built.has(`${URLS.site}${href}`), `${lang}/${page.slug}: its link ${href} leads nowhere`);
    }
    const home = renderPage(homeTemplate, lang, URLS.site, dictionaries);
    for (const [, href] of home.matchAll(/href="(\/(?!assets\/|src\/|favicon|apple-touch)[^"#]*)"/g)) assert.ok(built.has(`${URLS.site}${href}`), `${lang}: the main page's link ${href} leads nowhere`);
    // No game's page is an orphan: its galaxy's page and the page of all games both lead to it.
    for (const { galaxy, page, name } of everyGame(lang)) {
      assert.ok(page, `${name}: no page`);
      const link = `href="/${sitePath(lang)}${page.slug}"`;
      for (const from of [galaxySlug(galaxy.id), GAMES_SLUG]) assert.ok(PAGES[lang].find((other) => other.slug === from)?.body.includes(link), `${name}: ${from} does not lead to it`);
    }
  }
});

test('6 · the button on a game’s page is understood by the game, and its words are in the page’s language', () => {
  /** What the API keeps of a visit's game (`Marketing.java`, `GAME`): anything else is dropped, and the visit is counted without its game. */
  const KEPT_BY_API = /^[a-z][a-z0-9_]{0,29}:[a-z][a-z0-9_]{0,39}$/;
  for (const lang of SITE_LANGS) {
    for (const { galaxy, game, page, name } of everyGame(lang)) {
      // `play.…/try?game=<id>`: the game reads the id with `gameOfId`, and opens `/play/<module>/<sub>`.
      assert.deepEqual(gameOfId(game.id), { module: galaxy.id, sub: game.sub }, `${name}: the game would not understand «${game.id}» in a link, and the trial would open in the hub`);
      assert.match(game.id, KEPT_BY_API, `${name}: the API would not keep «${game.id}» with the visit`);
      assert.ok(page && /^games\/[a-z0-9-]+\/[a-z0-9-]+\/$/.test(page.slug), `${name}: its address «${page?.slug}» is not plain lower-case words`);

      // A page in English or Polish with Ukrainian left in it was not translated to the end. The games of the
      // Language galaxy are the exception: a pack's name and words are in the pack's own language by design.
      if (lang === DEFAULT_LANG || game.set) continue;
      const own = [game.title, game.blurb, game.intro, page.title, page.description, ...game.samples.map((task) => task.prompt)];
      for (const text of own) assert.ok(!/[А-Яа-яІіЇїЄєҐґ]/.test(text), `${name}: Ukrainian left in its ${lang} words: «${text.slice(0, 80)}»`);
    }
    // The words around the games — the site's own — are in the page's language too.
    if (lang !== DEFAULT_LANG) {
      const flat = JSON.stringify(words(lang).catalog);
      const about = JSON.stringify((words(lang).catalog as Record<string, unknown>).about ?? {});
      assert.ok(!/[А-Яа-яІіЇїЄєҐґ]/.test(flat.replace(about, '')), `${lang}: Ukrainian left in catalog.* of site/src/locales/${lang}.json`);
    }
  }
});
