import { dictionaryProblems, type Dict } from '@pulsar/i18n';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { DEFAULT_LANG, LANG_CODES, offeredLang, type LangCode } from '../src/core/language/index.ts';

const dictionaries = Object.fromEntries(
  LANG_CODES.map((lang) => [lang, JSON.parse(readFileSync(new URL(`../src/locales/app/${lang}/common.json`, import.meta.url), 'utf8'))]),
) as Record<LangCode, Dict>;

test('the game’s dictionary says the same things in every language', () => {
  assert.ok(JSON.stringify(dictionaries[DEFAULT_LANG]).length > 10_000, 'the dictionary is loaded');
  // Every key in every language, with the same {placeholders} and every plural form the language asks for.
  assert.deepEqual(dictionaryProblems(dictionaries, DEFAULT_LANG), []);
});

test('the language offered to a visitor: the region first, then the browser, then English', () => {
  assert.equal(offeredLang('UA', ['en-US']), 'uk');
  assert.equal(offeredLang('PL', ['uk-UA']), 'pl');
  assert.equal(offeredLang('DE', ['de-DE', 'uk-UA', 'en']), 'uk');
  assert.equal(offeredLang('DE', ['de-DE']), 'en');
  assert.equal(offeredLang(null, ['pl']), 'pl');
  assert.equal(offeredLang(undefined, []), 'en');
});
