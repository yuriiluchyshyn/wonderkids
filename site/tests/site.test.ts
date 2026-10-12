import { dictionaryProblems, type Dict } from '@pulsar/i18n';
import { LANG_COOKIE, TRIAL_PATH, publicUrls } from '@pulsar/platform';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import { loadDictionaries, renderPage } from '../build/pages.ts';
import { AI_CRAWLERS, llmsTxt, robotsTxt } from '../build/seo.ts';
import { DEFAULT_LANG, SITE_LANGS, sitePath } from '../src/languages.ts';

const read = (file: string): string => readFileSync(new URL(file, import.meta.url), 'utf8');
const URLS = publicUrls();
const dictionaries = loadDictionaries();
const template = read('../index.html');

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
    assert.deepEqual(asked.map((q) => [q.name, q.acceptedAnswer.text]), faq.map((pair) => [pair.title, pair.text]));
    for (const pair of faq) assert.ok(String(pair.text).length <= 420, `${lang}: «${pair.title}» is answered briefly`);
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
    const { title, description } = dictionaries[lang].meta as Record<string, string>;
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
  const en = dictionaries.en as { games: { title: string; math: { title: string; tag: string } } };
  assert.ok(text.includes(`## ${en.games.title}`) && text.includes(`### ${en.games.math.title} (${en.games.math.tag})`));
  for (const lang of SITE_LANGS) assert.ok(text.includes(`(${URLS.site}/${sitePath(lang)})`), `names the ${lang} page`);
  assert.ok(text.includes(`(${URLS.play}${TRIAL_PATH})`));
  // Every question of the page, with its answer — in each language's own Markdown.
  for (const lang of SITE_LANGS) {
    const md = llmsTxt(URLS, dictionaries, lang);
    for (const pair of Object.values(dictionaries[lang].faq as Dict)) if (typeof pair !== 'string') assert.ok(md.includes(`### ${pair.title}\n\n${pair.text}`), `${lang}: ${pair.title}`);
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
  const inPage = new Set([...template.matchAll(/\{\{\{?([\w.]+)\}\}\}?/g)].map((m) => m[1]));
  const scripts = readdirSync(new URL('../src/scripts/letter/', import.meta.url)).map((file) => read(`../src/scripts/letter/${file}`)).join('\n');
  const unused: string[] = [];
  const walk = (dict: Dict, prefix = ''): void => {
    for (const [key, node] of Object.entries(dict)) {
      if (typeof node !== 'string') walk(node, `${prefix}${key}.`);
      else if (prefix === 'js.' ? !scripts.includes(`words.${key}`) : !inPage.has(`${prefix}${key}`)) unused.push(`${prefix}${key}`);
    }
  };
  walk(dictionaries[DEFAULT_LANG]);
  assert.deepEqual(unused, []);
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
  // Crawlers and the assistants' fetchers are never sent away from «/»: it is the Ukrainian page for them.
  const crawlers = new Set(redirects.flatMap((rule) => rule.missing ?? []).filter((when) => when.key === 'user-agent').map((when) => (when as { value?: string }).value));
  assert.equal(crawlers.size, 1, 'one list of crawlers in every rule');
  const crawler = new RegExp(`^${[...crawlers][0]}$`);
  for (const agent of ['Googlebot/2.1', 'bingbot/2.0', 'Google-InspectionTool/1.0', 'OAI-SearchBot/1.0', 'ChatGPT-User/1.0', 'ClaudeBot/1.0', 'Claude-User/1.0', 'PerplexityBot/1.0', 'Perplexity-User/1.0', 'facebookexternalhit/1.1', 'TelegramBot (like TwitterBot)']) assert.ok(crawler.test(`Mozilla/5.0 (compatible; ${agent})`), `${agent} is a crawler`);
  assert.ok(!crawler.test('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'));

  // The game's paths opened on the site go to the portal that serves them.
  assert.equal(toPortal('/login'), `${URLS.play}/login`);
  // «Play» and the footer's link are the child's door — the child's login, never the game's bare address (which sends a newcomer to the parents').
  const doors = [...template.matchAll(/data-portal="play"(?: data-trial)? href="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual([...new Set(doors)].sort(), ['__PLAY_URL__/login', `__PLAY_URL__${TRIAL_PATH}`]);
  // The trial game is the child portal's; the page's own button leads there too.
  assert.equal(toPortal(TRIAL_PATH), `${URLS.play}${TRIAL_PATH}`);
  assert.ok(template.includes(`data-trial href="__PLAY_URL__${TRIAL_PATH}"`));
  assert.equal(toPortal('/parent-login'), `${URLS.parents}/parent-login`);
  assert.equal(toPortal('/admin/:path*'), `${URLS.parents}/admin/:path*`);
});
