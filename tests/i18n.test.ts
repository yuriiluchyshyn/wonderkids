import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { createTranslator, type Dict } from '../src/core/i18n/engine.ts';
import { loadSiteDictionaries, renderLanding, sitePath } from '../landing-i18n.ts';
import { LANG_CODES, offeredLang, type LangCode } from '../src/core/lang/index.ts';

const load = (scope: string): Record<LangCode, Dict> =>
  Object.fromEntries(LANG_CODES.map((lang) => [lang, JSON.parse(readFileSync(new URL(`../src/locales/${scope}/${lang}.json`, import.meta.url), 'utf8'))])) as Record<LangCode, Dict>;

test('the engine fills, pluralises by each language’s own rule, and falls back', () => {
  const t = createTranslator<string>(
    {
      uk: { hello: 'Привіт, {name}!', tasks: { one: '{count} завдання', few: '{count} завдання', many: '{count} завдань', other: '{count} завдання' }, onlyUk: 'лише тут' },
      en: { hello: 'Hi, {name}!', tasks: { one: '{count} task', other: '{count} tasks' } },
      pl: { hello: 'Cześć, {name}!', tasks: { one: '{count} zadanie', few: '{count} zadania', many: '{count} zadań', other: '{count} zadania' } },
    },
    'uk',
  );
  assert.equal(t('pl', 'hello', { name: 'Ola' }), 'Cześć, Ola!');
  assert.deepEqual([1, 2, 5, 12, 21, 22].map((count) => t('uk', 'tasks', { count })), ['1 завдання', '2 завдання', '5 завдань', '12 завдань', '21 завдання', '22 завдання']);
  assert.deepEqual([1, 2, 5, 12, 21, 22].map((count) => t('pl', 'tasks', { count })), ['1 zadanie', '2 zadania', '5 zadań', '12 zadań', '21 zadań', '22 zadania']);
  assert.deepEqual([1, 2].map((count) => t('en', 'tasks', { count })), ['1 task', '2 tasks']);
  // A text not translated yet is shown in Ukrainian — never as its key.
  assert.equal(t('en', 'onlyUk'), 'лише тут');
  assert.equal(t('en', 'no.such.key'), 'no.such.key');
});

for (const scope of ['app', 'site']) {
  test(`the «${scope}» dictionary says the same things in every language`, () => {
    const dictionaries = load(scope);
    const t = createTranslator<string>(dictionaries, 'uk');
    const keys = t.keys();
    assert.ok(keys.size > 100, 'the dictionary is loaded');

    const missing = [...keys].filter(([, langs]) => langs.length > 0).map(([key, langs]) => `${key} — not in ${langs.join(', ')}`);
    assert.deepEqual(missing, [], 'every key exists in every language');

    // The same {placeholders} everywhere: a translation that drops one loses a name or a number.
    const holes = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');
    const flat = (dict: Dict, prefix = '', out = new Map<string, string>()): Map<string, string> => {
      for (const [key, node] of Object.entries(dict)) {
        if (typeof node === 'string') out.set(`${prefix}${key}`, node);
        else flat(node, `${prefix}${key}.`, out);
      }
      return out;
    };
    const uk = flat(dictionaries.uk);
    const broken: string[] = [];
    for (const lang of LANG_CODES) {
      const texts = flat(dictionaries[lang]);
      for (const [key, text] of texts) {
        if (!text.trim()) broken.push(`${lang}: ${key} is empty`);
        // Plural leaves differ between languages (en has no «few»): compare against the same key's «other».
        const twin = uk.get(key) ?? uk.get(key.replace(/\.(one|few|many)$/, '.other'));
        if (twin !== undefined && holes(twin) !== holes(text) && !/\.(one)$/.test(key)) broken.push(`${lang}: ${key} has {${holes(text)}}, Ukrainian has {${holes(twin)}}`);
      }
    }
    assert.deepEqual(broken, []);

    // Every plural has the forms its language asks for.
    const forms: Record<LangCode, string[]> = { uk: ['one', 'few', 'many', 'other'], en: ['one', 'other'], pl: ['one', 'few', 'many', 'other'] };
    const plurals = [...uk.keys()].filter((key) => key.endsWith('.other')).map((key) => key.slice(0, -'.other'.length)).filter((key) => uk.has(`${key}.one`));
    for (const lang of LANG_CODES) {
      const texts = flat(dictionaries[lang]);
      for (const key of plurals) for (const form of forms[lang]) assert.ok(texts.has(`${key}.${form}`), `${lang}: ${key} lacks «${form}»`);
    }
  });
}

test('the language offered to a visitor: the region first, then the browser, then English', () => {
  assert.equal(offeredLang('UA', ['en-US']), 'uk');
  assert.equal(offeredLang('PL', ['uk-UA']), 'pl');
  assert.equal(offeredLang('DE', ['de-DE', 'uk-UA', 'en']), 'uk');
  assert.equal(offeredLang('DE', ['de-DE']), 'en');
  assert.equal(offeredLang(null, ['pl']), 'pl');
  assert.equal(offeredLang(undefined, []), 'en');
});

test('the landing page is made from one template for every language', () => {
  const template = readFileSync(new URL('../landing.html', import.meta.url), 'utf8');
  // The template holds no text of its own — only keys (a comment or a brand name aside).
  const own = template.split('\n').filter((line) => /[А-Яа-яІіЇїЄєҐґ]/.test(line) && !/^\s*\/\/|alternateName/.test(line));
  assert.deepEqual(own, []);

  const dictionaries = loadSiteDictionaries();
  for (const lang of LANG_CODES) {
    const page = renderLanding(template, lang, dictionaries);
    assert.ok(!page.includes('{{'), `${lang}: every key is filled`);
    assert.ok(page.includes(`<html lang="${lang}">`));
    assert.ok(page.includes(`rel="canonical" href="__SITE_URL__/${sitePath(lang)}"`));
    for (const other of LANG_CODES) assert.ok(page.includes(`hreflang="${other}" href="https://pulsarkids.com/${sitePath(other)}"`), `${lang}: names its ${other} page`);
    // Structured data stays valid JSON whatever the texts hold.
    const ld = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(page)?.[1] ?? '';
    assert.equal(JSON.parse(ld)['@graph'][0].inLanguage, lang);
    // The form's words reach its script whole.
    const words = JSON.parse(/var T = (\{.*\});/.exec(page)?.[1] ?? '{}');
    assert.ok(words.send && words.tooBig.includes('{name}'));
  }
  assert.throws(() => renderLanding('{{no.such.key}}', 'en', dictionaries), /no\.such\.key/);

  // Every text of the dictionary is used by the page.
  const used = new Set([...template.matchAll(/\{\{\{?([\w.]+)\}\}\}?/g)].map((m) => m[1]));
  const unused: string[] = [];
  const walk = (dict: Dict, prefix = ''): void => {
    for (const [key, node] of Object.entries(dict)) {
      if (typeof node !== 'string') walk(node, `${prefix}${key}.`);
      else if (!used.has(`${prefix}${key}`) && !prefix.startsWith('js.')) unused.push(`${prefix}${key}`);
    }
  };
  walk(dictionaries.uk);
  assert.deepEqual(unused, []);
});
