import { dictionaryProblems, type Dict } from '@pulsar/i18n';
import { LANG_COOKIE, publicUrls } from '@pulsar/platform';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import { loadDictionaries, renderPage } from '../build/pages.ts';
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
    assert.equal(JSON.parse(ld)['@graph'][0].inLanguage, lang);
    // The form's words reach its script whole.
    const words = JSON.parse(/<script type="application\/json" id="letter-words">(.*)<\/script>/.exec(page)?.[1] ?? '{}');
    assert.ok(words.send && words.tooBig.includes('{name}'));
  }
  assert.throws(() => renderPage('{{no.such.key}}', 'en', URLS.site, dictionaries), /no\.such\.key/);
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

  // «/» only ever sends to a page that is built, and every language but the default has its way in.
  const sent = redirects.filter((rule) => rule.source === '/' && rule.destination.startsWith('/')).map((rule) => rule.destination);
  const built = SITE_LANGS.filter((lang) => lang !== DEFAULT_LANG).map((lang) => `/${sitePath(lang)}`);
  assert.deepEqual([...new Set(sent)].sort(), [...built].sort());

  // The game's paths opened on the site go to the portal that serves them.
  const toPortal = (path: string): string | undefined => redirects.find((rule) => rule.source === path)?.destination;
  assert.equal(toPortal('/login'), `${URLS.play}/login`);
  assert.equal(toPortal('/parent-login'), `${URLS.parents}/parent-login`);
  assert.equal(toPortal('/admin/:path*'), `${URLS.parents}/admin/:path*`);
});
