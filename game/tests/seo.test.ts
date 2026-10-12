import { dictionaryProblems, type Dict } from '@pulsar/i18n';
import { publicUrls } from '@pulsar/platform';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { LANG_CODES } from '../src/core/language/index.ts';
import { PUBLIC_PAGES, SHELL_LANG, fillShell, publicShell, seoTexts } from '../seo-plugin.ts';

const read = (file: string): string => readFileSync(new URL(file, import.meta.url), 'utf8');
const URLS = publicUrls();
const template = read('../index.html');
const shell = fillShell(template);
const hostOf = (url: string): string => new URL(url).host;

test('the SEO texts say the same things in every language, and the shell asks only for what they have', () => {
  const texts = Object.fromEntries(LANG_CODES.map((lang) => [lang, seoTexts(lang)])) as Record<string, Dict>;
  assert.deepEqual(dictionaryProblems(texts, SHELL_LANG), []);
  for (const page of PUBLIC_PAGES) for (const lang of LANG_CODES) assert.ok(seoTexts(lang)[page.texts]?.title && seoTexts(lang)[page.texts]?.description, `${lang}: ${page.texts} has a title and a description`);
  // The head holds keys, not words — and every key is filled.
  assert.ok(template.includes('<title>{{shell.title}}</title>') && !shell.includes('{{'));
  assert.throws(() => fillShell('{{shell.nothing}}'), /shell\.nothing/);
  for (const lang of LANG_CODES) assert.ok(seoTexts(lang).shell.description.length <= 160, `${lang}: the shell’s description fits a search result`);
});

test('the app shell is out of search; a public page’s own shell is in it', () => {
  assert.match(shell, /<meta name="robots" content="noindex, nofollow" \/>/);
  assert.ok(!shell.includes('rel="canonical"'), 'the shell is every personal page: it names no address');

  for (const page of PUBLIC_PAGES) {
    const html = publicShell(shell, page, URLS);
    const url = `${URLS[page.portal]}${page.path}`;
    assert.match(html, /<meta name="robots" content="index, follow" \/>/);
    assert.ok(!/<meta[^>]*noindex/.test(html), `${page.path}: no tag left says noindex`);
    assert.ok(html.includes(`<link rel="canonical" href="${url}" />`) && html.includes(`<meta property="og:url" content="${url}" />`));
    const title = /<title>([^<]*)<\/title>/.exec(html)?.[1] ?? '';
    assert.ok(title.endsWith('— Pulsar Kids') && title !== /<title>([^<]*)<\/title>/.exec(shell)?.[1], `${page.path}: a title of its own`);
    // The same app underneath.
    assert.ok(html.includes('<div id="root">') && html.includes('src="/src/main.tsx"'));
  }
  // A shell that lost a tag must stop the build, not ship a public page that says noindex.
  assert.throws(() => publicShell(shell.replace('name="robots"', 'name="bots"'), PUBLIC_PAGES[0], URLS), /robots/);
});

test('vercel.json serves each public page from its shell, on its own portal only', () => {
  interface Rule {
    source: string;
    destination: string;
    permanent?: boolean;
    has?: { type: string; value?: string }[];
  }
  const { redirects, rewrites, headers } = JSON.parse(read('../vercel.json')) as { redirects: Rule[]; rewrites: Rule[]; headers: { source: string }[] };
  const on = (rules: Rule[], source: string, host: string): Rule | undefined => rules.find((rule) => rule.source === source && rule.has?.some((when) => when.type === 'host' && when.value === host));

  for (const page of PUBLIC_PAGES) assert.equal(on(rewrites, page.path, hostOf(URLS[page.portal]))?.destination, `/${page.file}`);
  // The shells come before the rule that sends everything to the app.
  assert.ok(rewrites.at(-1)?.destination === '/index.html' && !rewrites.at(-1)?.has);

  // One parents' login, at one address: the child portal sends there, and so does the parents' own `/login`.
  assert.equal(on(redirects, '/parent-login', hostOf(URLS.play))?.destination, `${URLS.parents}/parent-login`);
  assert.equal(on(redirects, '/login', hostOf(URLS.parents))?.destination, '/parent-login');

  // What is personal says so in a header too — and no public page is among it.
  const personal = new RegExp(`^${headers[0].source}$`);
  for (const path of ['/play/math/add', '/parent', '/parent/audio', '/admin', '/world', '/vault', '/who', '/try']) assert.ok(personal.test(path), `${path} is personal`);
  for (const page of PUBLIC_PAGES) assert.ok(!personal.test(page.path), `${page.path} is public`);
});
