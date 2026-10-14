import { dictionaryProblems, type Dict } from '@pulsar/i18n';
import { CONTACT_EMAIL, LANG_COOKIE, TRIAL_PATH, legalUrl, publicUrls } from '@pulsar/platform';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import { ALIKE_LIMIT, GAMES_SLUG, alikeness, catalogNumbers, gamesPages, trialOfGame } from '../build/games.ts';
import { legalText } from '../build/legal.ts';
import { markdownToHtml } from '../build/markdown.ts';
import { countedWords, loadDictionaries, renderGamesPage, renderLegalPage, renderPage } from '../build/pages.ts';
import { AI_CRAWLERS, llmsTxt, robotsTxt } from '../build/seo.ts';
import { DEFAULT_LANG, SITE_LANGS, sitePath, type SiteLang } from '../src/languages.ts';
import { LEGAL_DOCS, LEGAL_UPDATED, legalPath } from '../src/legal.ts';
import { OPERATOR, operatorGaps } from '../src/operator.ts';

const read = (file: string): string => readFileSync(new URL(file, import.meta.url), 'utf8');
const URLS = publicUrls();
const dictionaries = loadDictionaries();
const template = read('../index.html');
const legalTemplate = read('../legal.html');
const gamesTemplate = read('../games.html');

/** A text of the dictionary as the page shows it: `{games}`, `{levels}` and `{galaxies}` filled from the catalogue. */
const counts = Object.fromEntries(SITE_LANGS.map((lang) => [lang, countedWords(lang, dictionaries).params])) as Record<SiteLang, Record<string, string | number>>;
const filled = (lang: SiteLang, text: unknown): string => String(text).replace(/\{(\w+)\}/g, (all, name: string) => (name in counts[lang] ? String(counts[lang][name]) : all));

test('the site’s dictionary says the same things in every language', () => {
  assert.ok(JSON.stringify(dictionaries[DEFAULT_LANG]).length > 5_000, 'the dictionary is loaded');
  assert.deepEqual(dictionaryProblems(dictionaries, DEFAULT_LANG), []);
});

test('the page is made from one template for every language', () => {
  // The template holds no text of its own — only keys (a comment or a brand name aside).
  const own = template.split('\n').filter((line) => /[А-Яа-яІіЇїЄєҐґ]/.test(line) && !/^\s*\/\/|alternateName/.test(line));
  assert.deepEqual(own, []);

  for (const lang of SITE_LANGS) {
    const page = renderPage(template, lang, URLS.site, dictionaries);
    assert.ok(!page.includes('{{'), `${lang}: every key is filled`);
    assert.ok(page.includes(`<html lang="${lang}">`));
    assert.ok(page.includes(`rel="canonical" href="__SITE_URL__/${sitePath(lang)}"`));
    for (const other of SITE_LANGS) assert.ok(page.includes(`hreflang="${other}" href="${URLS.site}/${sitePath(other)}"`), `${lang}: names its ${other} page`);
    // Structured data stays valid JSON whatever the texts hold.
    const ld = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(page)?.[1] ?? '';
    const graph = JSON.parse(ld)['@graph'] as { '@type': string; '@id': string; inLanguage?: string | string[]; about?: string[] }[];
    assert.equal(graph[0].inLanguage, lang);
    // The page is its own; the site, its publisher and the game are the same things on every page.
    assert.deepEqual(graph.map((node) => node['@type']), ['WebPage', 'WebSite', 'Organization', 'WebApplication', 'FAQPage']);
    // The questions in the structured data are the ones a reader sees on the page.
    const asked = (graph[4] as unknown as { mainEntity: { name: string; acceptedAnswer: { text: string } }[] }).mainEntity;
    const faq = Object.values(dictionaries[lang].faq as Dict).filter((pair): pair is Dict => typeof pair !== 'string');
    assert.deepEqual(asked.map((q) => [q.name, q.acceptedAnswer.text]), faq.map((pair) => [pair.title, filled(lang, pair.text)]));
    for (const pair of faq) assert.ok(filled(lang, pair.text).length <= 420, `${lang}: «${pair.title}» is answered briefly`);
    assert.ok(graph[0]['@id'].startsWith(`__SITE_URL__/${sitePath(lang)}#`));
    for (const node of graph.slice(1, 4)) assert.ok(node['@id'].startsWith('__SITE_URL__/#'), `${lang}: ${node['@type']} has one id for every language`);
    assert.deepEqual(graph[1].inLanguage, [...SITE_LANGS]);
    assert.equal(graph[3].about?.length, 9);
    // The form's words reach its script whole.
    const words = JSON.parse(/<script type="application\/json" id="letter-words">(.*)<\/script>/.exec(page)?.[1] ?? '{}');
    assert.ok(words.send && words.tooBig.includes('{name}'));
  }
  assert.throws(() => renderPage('{{no.such.key}}', 'en', URLS.site, dictionaries), /no\.such\.key/);
});

test('what a search result shows fits into it', () => {
  for (const lang of SITE_LANGS) {
    const { title } = dictionaries[lang].meta as Record<string, string>;
    // Measured as a reader sees it: the counts of the catalogue are already filled in.
    const description = filled(lang, (dictionaries[lang].meta as Record<string, string>).description);
    assert.ok(title.length <= 62, `${lang}: the title is ${title.length} characters — a search result cuts it at about 60`);
    assert.ok(description.length >= 120 && description.length <= 160, `${lang}: the description is ${description.length} characters — a search result shows 150–160`);
    // What the page is comes first; the name closes the line.
    assert.ok(title.endsWith('Pulsar Kids'), `${lang}: the title ends with the name`);
  }
  const page = renderPage(template, DEFAULT_LANG, URLS.site, dictionaries);
  assert.equal(page.match(/<h1[\s>]/g)?.length, 1, 'one main heading');
});

test('llms.txt tells the page in plain words, with the page’s own numbers', () => {
  const text = llmsTxt(URLS, dictionaries);
  assert.ok(text.startsWith('# Pulsar Kids\n'));
  assert.ok(!/<[a-z]/.test(text) && !text.includes('undefined') && !text.includes('[object'), 'plain text, every line filled');
  const en = dictionaries.en as { games: { title: string; math: { title: string } } };
  // Its numbers are the catalogue's, counted — the dictionary says `{games}`, never a number of its own.
  assert.ok(!text.includes('{games}'), 'every number is filled in');
  assert.ok(text.includes(`## ${en.games.title.replace('{games}', String(catalogNumbers('en').games))}`));
  assert.ok(text.includes(`### ${en.games.math.title} (${countedWords('en', dictionaries).perGalaxy.countMath})`));
  for (const lang of SITE_LANGS) assert.ok(text.includes(`(${URLS.site}/${sitePath(lang)})`), `names the ${lang} page`);
  assert.ok(text.includes(`(${URLS.play}${TRIAL_PATH})`));
  // Every question of the page, with its answer — in each language's own Markdown.
  for (const lang of SITE_LANGS) {
    const md = llmsTxt(URLS, dictionaries, lang);
    for (const pair of Object.values(dictionaries[lang].faq as Dict)) if (typeof pair !== 'string') assert.ok(md.includes(`### ${pair.title}\n\n${filled(lang, pair.text)}`), `${lang}: ${pair.title}`);
  }
});

test('robots.txt lets the assistants in by name, and vercel.json points each page at its Markdown', () => {
  const robots = robotsTxt(URLS.site);
  for (const agent of Object.values(AI_CRAWLERS).flat()) assert.ok(robots.includes(`User-agent: ${agent}\n`), `${agent} is named`);
  assert.ok(!robots.includes('Disallow') && robots.includes(`Sitemap: ${URLS.site}/sitemap.xml`));
  const { headers } = JSON.parse(read('../vercel.json')) as { headers: { source: string; headers: { key: string; value: string }[] }[] };
  for (const lang of SITE_LANGS) {
    const link = headers.find((rule) => rule.source === `/${sitePath(lang)}`)?.headers.find((header) => header.key === 'Link')?.value;
    assert.equal(link, `</${sitePath(lang)}index.md>; rel="alternate"; type="text/markdown"`);
    assert.ok(template.includes('type="text/markdown" href="__SITE_URL__/{{@path}}index.md"'));
  }
});

test('every text of the dictionary is used — by the page, or by the form’s script', () => {
  const inPage = new Set([...(template + legalTemplate + gamesTemplate).matchAll(/\{\{\{?([\w.]+)\}\}\}?/g)].map((m) => m[1]));
  const scripts = readdirSync(new URL('../src/scripts/letter/', import.meta.url)).map((file) => read(`../src/scripts/letter/${file}`)).join('\n');
  // The words of the pages of games are asked for by their build (`t('step')`); the names of boards and languages by what a game has.
  const games = read('../build/games.ts');
  const PLURAL = /\.(zero|one|two|few|many|other)$/;
  const unused: string[] = [];
  const walk = (dict: Dict, prefix = ''): void => {
    for (const [key, node] of Object.entries(dict)) {
      if (typeof node !== 'string') walk(node, `${prefix}${key}.`);
      // A legal page's description is asked for by the build (`renderLegalPage`), one per text.
      else if (prefix.startsWith('catalog.')) {
        const asked = `${prefix}${key}`.replace(PLURAL, '').slice('catalog.'.length);
        // A paragraph about a game is asked for by the game's id — and there must be such a game.
        if (asked.startsWith('about.')) assert.ok(gamesPages(DEFAULT_LANG, URLS, dictionaries).some((page) => page.slug === `${GAMES_SLUG}${asked.slice('about.'.length).replace('.', '/').replaceAll('_', '-')}/`), `catalog.${asked}: no such game`);
        else if (!/^(mechanics|langNames)\./.test(asked) && !games.includes(`'${asked}'`) && !inPage.has(`catalog.${asked}`)) unused.push(`catalog.${asked}`);
      } else if (prefix === 'legalMeta.') assert.ok(LEGAL_DOCS.some((doc) => doc === key), `legalMeta.${key} is a legal text`);
      else if (prefix === 'js.' ? !scripts.includes(`words.${key}`) : !inPage.has(`${prefix}${key}`)) unused.push(`${prefix}${key}`);
    }
  };
  walk(dictionaries[DEFAULT_LANG]);
  assert.deepEqual(unused, []);
});

test('the legal texts are a page each, in every language, and say the same', () => {
  const sections = (markdown: string): number => markdown.match(/^## /gm)?.length ?? 0;
  for (const doc of LEGAL_DOCS) {
    assert.match(LEGAL_UPDATED[doc], /^\d{4}-\d{2}-\d{2}$/);
    const original = legalText(DEFAULT_LANG, doc, URLS);
    for (const lang of SITE_LANGS) {
      const text = legalText(lang, doc, URLS);
      assert.ok(!text.markdown.includes('{{'), `${lang}/${doc}: every name is filled`);
      // A translation has the sections of the original, in its numbers — a clause cannot go missing in one language.
      assert.equal(sections(text.markdown), sections(original.markdown), `${lang}/${doc}: as many sections as the original`);
      assert.equal(text.markdown.match(/^\|/gm)?.length, original.markdown.match(/^\|/gm)?.length, `${lang}/${doc}: as many table rows as the original`);
      assert.ok(text.markdown.includes(CONTACT_EMAIL), `${lang}/${doc}: says where to write`);

      const page = renderLegalPage(legalTemplate, lang, doc, URLS, dictionaries);
      assert.ok(!page.includes('{{'), `${lang}/${doc}: every key is filled`);
      assert.ok(page.includes(`<html lang="${lang}">`) && page.includes(`<title>${text.title} — Pulsar Kids</title>`));
      assert.ok(page.includes(`rel="canonical" href="__SITE_URL__/${legalPath(lang, doc)}"`));
      for (const other of SITE_LANGS) assert.ok(page.includes(`hreflang="${other}" href="${URLS.site}/${legalPath(other, doc)}"`), `${lang}/${doc}: names its ${other} page`);
      assert.equal(page.match(/<h1[\s>]/g)?.length, 1, `${lang}/${doc}: one main heading`);
      const graph = JSON.parse(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(page)?.[1] ?? '')['@graph'] as { '@type': string; dateModified?: string }[];
      assert.equal(graph[0].dateModified, LEGAL_UPDATED[doc]);
      // The main page leads to it — from the footer, in its own language.
      assert.ok(renderPage(template, lang, URLS.site, dictionaries).includes(`href="/${legalPath(lang, doc)}"`), `${lang}: the page links to its ${doc}`);
    }
  }
  // The privacy policy names what the site itself keeps on a device.
  for (const lang of SITE_LANGS) for (const kept of [LANG_COOKIE, 'pulsar-lang-v1', 'pulsar-source-v1', 'pulsar-visit-']) assert.ok(legalText(lang, 'privacy', URLS).markdown.includes(kept), `${lang}: the policy names ${kept}`);

  // What the texts are written in: nothing of the source reaches the page as markup.
  assert.equal(markdownToHtml('## A <b>\n\ntext **bold** [x](/y/)\n\n- one\n- two\n\n| h |\n|---|\n| c |'), '<h2 id="s1">A &lt;b&gt;</h2>\n<p>text <strong>bold</strong> <a href="/y/">x</a></p>\n<ul><li>one</li><li>two</li></ul>\n<div class="table"><table><thead><tr><th>h</th></tr></thead><tbody><tr><td>c</td></tr></tbody></table></div>');
});

test('every game has a page of its own, with real tasks from it and a way straight into it', () => {
  for (const lang of SITE_LANGS) {
    const pages = gamesPages(lang, URLS, dictionaries);
    const numbers = catalogNumbers(lang);
    assert.equal(pages.length, 1 + numbers.galaxies + numbers.games, `${lang}: a page for all games, for every galaxy and for every game`);
    assert.equal(new Set(pages.map((page) => page.slug)).size, pages.length, `${lang}: every page has an address of its own`);
    assert.equal(pages[0].slug, GAMES_SLUG);

    for (const page of pages) {
      const html = renderGamesPage(gamesTemplate, lang, page, URLS.site, dictionaries);
      const name = `${lang}/${page.slug}`;
      assert.ok(!html.includes('{{'), `${name}: every key is filled`);
      assert.ok(html.includes(`<html lang="${lang}">`) && html.includes(`rel="canonical" href="__SITE_URL__/${sitePath(lang)}${page.slug}"`), `${name}: says where it lives`);
      for (const other of page.langs) assert.ok(html.includes(`hreflang="${other}" href="${URLS.site}/${sitePath(other)}${page.slug}"`), `${name}: names its ${other} page`);
      assert.equal(html.match(/<h1[\s>]/g)?.length, 1, `${name}: one main heading`);
      assert.ok(page.title.length <= 70 && page.description.length >= 60 && page.description.length <= 180, `${name}: a title of ${page.title.length} and a description of ${page.description.length} characters fit a search result`);
      const graph = JSON.parse(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html)?.[1] ?? '')['@graph'] as { '@type': string }[];
      assert.deepEqual(graph.map((node) => node['@type']), [page.kind === 'game' ? 'LearningResource' : 'CollectionPage', 'BreadcrumbList']);
      assert.ok(!/undefined|\[object/.test(page.body + page.markdown), `${name}: every line is filled`);
      // Every address a page of games leads to inside the site is a page that is built.
      for (const [, href] of page.body.matchAll(/href="(\/[^"]*)"/g)) assert.ok(href === `/${sitePath(lang)}` || pages.some((other) => `/${sitePath(lang)}${other.slug}` === href), `${name}: ${href} leads nowhere`);
    }

    // A game's page opens THAT game, with no account: the link says which, and that a page sent the visitor.
    const games = pages.filter((page) => page.kind === 'game');
    for (const page of games) assert.match(page.body, /class="btn btn-try" data-portal="play" data-trial href="[^"]*\/try\?game=[a-z_]+%3A[a-z0-9_]+&amp;via=page"/);
    assert.equal(trialOfGame(URLS.play, 'geography:flags'), `${URLS.play}${TRIAL_PATH}?game=geography%3Aflags&via=page`);

    // A page is a game's own: what says mostly the same as the next game's page is not offered to search engines
    // (it is built and linked, `noindex`, and out of the sitemap).
    for (const page of games) {
      assert.equal(page.index, page.alike <= ALIKE_LIMIT, `${lang}/${page.slug}`);
      assert.ok(renderGamesPage(gamesTemplate, lang, page, URLS.site, dictionaries).includes(`<meta name="robots" content="${page.index ? 'index, follow' : 'noindex, follow'}`), `${lang}/${page.slug}: says whether it is to be listed`);
    }
    // That none is closed is `visibility.test.ts`'s business.
    assert.equal(alikeness('<h2>a</h2><p>own words</p><section class="more"><p>shared</p></section>', '<p>a</p><p>shared</p>'), 1 / 10);

    // What the main page says in numbers is what the catalogue has — and not one of those numbers is typed
    // into a text: the build counts them (`countedWords`), so adding a game to the game changes the page.
    const words = dictionaries[lang] as { games: Record<string, Record<string, string> | string>; meta: { description: string }; faq: { what: { text: string } } };
    for (const [where, text] of [['meta.description', words.meta.description], ['faq.what.text', words.faq.what.text], ['games.title', String(words.games.title)]] as const)
      assert.ok(text.includes('{games}'), `${lang}: ${where} writes down how many games there are — say «{games}» and let the build count them`);
    const home = renderPage(template, lang, URLS.site, dictionaries);
    const counted = countedWords(lang, dictionaries);
    for (const [galaxy, count] of Object.entries(numbers.perGalaxy)) {
      const tag = counted.perGalaxy[`count${galaxy.charAt(0).toUpperCase()}${galaxy.slice(1)}`];
      assert.ok(tag?.startsWith(`${count} `), `${lang}: the ${galaxy} card says «${tag}», the catalogue has ${count}`);
      assert.ok(home.includes(`>${tag}<`), `${lang}: the ${galaxy} card does not show «${tag}» — index.html asks for another key than {{@count…}}`);
    }
    // And the main page leads to the pages of games.
    assert.ok(home.includes(`<b>${numbers.games}</b>`) && home.includes(`<b>${numbers.steps}</b>`) && home.includes(`<b>${numbers.galaxies}</b>`), `${lang}: the main page counts its games, steps and galaxies`);
    assert.ok(home.includes(`href="/${sitePath(lang)}${GAMES_SLUG}"`));
    for (const galaxy of Object.keys(numbers.perGalaxy)) assert.ok(home.includes(`href="/${sitePath(lang)}${GAMES_SLUG}${galaxy}/"`), `${lang}: the main page leads to ${galaxy}`);
  }
});

test('the operator is named before the legal pages go out', () => {
  // GDPR art. 13 and the Polish act on electronic services: a policy and terms must say who stands behind the service.
  assert.deepEqual(operatorGaps(), [], 'fill in src/operator.ts — the registered name, address and NIP of whoever runs Pulsar Kids');
  assert.equal(OPERATOR.email, CONTACT_EMAIL);
});

test('nothing is fetched from another company’s servers when the page opens', () => {
  // Fonts are our own files (`@pulsar/brand/fonts.css`): a request to Google Fonts hands over the visitor's IP address unasked.
  for (const page of [template, legalTemplate, gamesTemplate]) {
    const foreign = [...page.matchAll(/<(?:link|script|img)\b[^>]*\b(?:href|src)="(https?:[^"]+)"/g)].map((m) => m[1]);
    assert.deepEqual(foreign, []);
  }
});

test('vercel.json speaks of the same cookie, languages and portals as the code', () => {
  interface Rule {
    source: string;
    destination: string;
    has?: { type: string; key?: string; value?: string }[];
    missing?: { type: string; key?: string }[];
  }
  const { redirects } = JSON.parse(read('../vercel.json')) as { redirects: Rule[] };

  // A visitor's choice of language is read from the cookie the site and the game write.
  const cookies = redirects.flatMap((rule) => [...(rule.has ?? []), ...(rule.missing ?? [])]).filter((when) => when.type === 'cookie');
  assert.ok(cookies.length > 0);
  for (const cookie of cookies) assert.equal(cookie.key, LANG_COOKIE);

  const toPortal = (path: string): string | undefined => redirects.find((rule) => rule.source === path)?.destination;

  // «/» only ever sends to a page that is built, and every language but the default has its way in.
  const sent = redirects.filter((rule) => rule.source === '/' && rule.destination.startsWith('/')).map((rule) => rule.destination);
  const built = SITE_LANGS.filter((lang) => lang !== DEFAULT_LANG).map((lang) => `/${sitePath(lang)}`);
  assert.deepEqual([...new Set(sent)].sort(), [...built].sort());
  // A language's page has one address — the one with the slash.
  for (const path of built) assert.equal(toPortal(path.replace(/\/$/, '')), path);
  // A legal text has one address too; and the game, which does not know which language sits at the root, may name any (`legalUrl`).
  for (const doc of LEGAL_DOCS) assert.equal(toPortal(`/${doc}`), `/${doc}/`);
  // `(.*)`, not `:path*`: the named wildcard does not match a trailing slash, so `/uk/terms/` was a 404.
  assert.equal(toPortal(`/${DEFAULT_LANG}/:path(.*)`), '/:path');
  assert.equal(legalUrl(URLS.site, 'pl', 'terms'), `${URLS.site}/${legalPath('pl', 'terms')}`);
  // Crawlers and the assistants' fetchers are never sent away from «/»: it is the Ukrainian page for them.
  const crawlers = new Set(redirects.flatMap((rule) => rule.missing ?? []).filter((when) => when.key === 'user-agent').map((when) => (when as { value?: string }).value));
  assert.equal(crawlers.size, 1, 'one list of crawlers in every rule');
  const crawler = new RegExp(`^${[...crawlers][0]}$`);
  for (const agent of ['Googlebot/2.1', 'bingbot/2.0', 'Google-InspectionTool/1.0', 'OAI-SearchBot/1.0', 'ChatGPT-User/1.0', 'ClaudeBot/1.0', 'Claude-User/1.0', 'PerplexityBot/1.0', 'Perplexity-User/1.0', 'facebookexternalhit/1.1', 'TelegramBot (like TwitterBot)']) assert.ok(crawler.test(`Mozilla/5.0 (compatible; ${agent})`), `${agent} is a crawler`);
  assert.ok(!crawler.test('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'));

  // The game's paths opened on the site go to the portal that serves them.
  assert.equal(toPortal('/login'), `${URLS.play}/login`);
  // «Play» is the child's door — the child's login, never the game's bare address (which sends a newcomer to the parents').
  const doors = [...template.matchAll(/data-portal="play"(?: data-trial)? href="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual([...new Set(doors)].sort(), ['__PLAY_URL__/login', `__PLAY_URL__${TRIAL_PATH}`]);
  // The trial game is the child portal's; the page's own button leads there too.
  assert.equal(toPortal(TRIAL_PATH), `${URLS.play}${TRIAL_PATH}`);
  assert.ok(template.includes(`data-trial href="__PLAY_URL__${TRIAL_PATH}"`));
  assert.equal(toPortal('/parent-login'), `${URLS.parents}/parent-login`);
  assert.equal(toPortal('/admin/:path*'), `${URLS.parents}/admin/:path*`);
});
