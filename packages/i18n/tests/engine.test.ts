import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createTranslator, dictionaryProblems } from '../src/index.ts';

const DICTIONARIES = {
  uk: { hello: 'Привіт, {name}!', tasks: { one: '{count} завдання', few: '{count} завдання', many: '{count} завдань', other: '{count} завдання' }, onlyUk: 'лише тут' },
  en: { hello: 'Hi, {name}!', tasks: { one: '{count} task', other: '{count} tasks' } },
  pl: { hello: 'Cześć, {name}!', tasks: { one: '{count} zadanie', few: '{count} zadania', many: '{count} zadań', other: '{count} zadania' } },
};

test('the engine fills, pluralises by each language’s own rule, and falls back', () => {
  const t = createTranslator<string>(DICTIONARIES, 'uk');
  assert.equal(t('pl', 'hello', { name: 'Ola' }), 'Cześć, Ola!');
  assert.deepEqual([1, 2, 5, 12, 21, 22].map((count) => t('uk', 'tasks', { count })), ['1 завдання', '2 завдання', '5 завдань', '12 завдань', '21 завдання', '22 завдання']);
  assert.deepEqual([1, 2, 5, 12, 21, 22].map((count) => t('pl', 'tasks', { count })), ['1 zadanie', '2 zadania', '5 zadań', '12 zadań', '21 zadań', '22 zadania']);
  assert.deepEqual([1, 2].map((count) => t('en', 'tasks', { count })), ['1 task', '2 tasks']);
  // A text not translated yet is shown in the fallback language — never as its key.
  assert.equal(t('en', 'onlyUk'), 'лише тут');
  assert.equal(t('en', 'no.such.key'), 'no.such.key');
});

test('the languages are whatever the dictionaries are — the engine has no list of its own', () => {
  const t = createTranslator<'bye', 'de' | 'fr'>({ de: { bye: 'Tschüss' }, fr: {} }, 'de');
  assert.equal(t('fr', 'bye'), 'Tschüss');
  assert.deepEqual(t.keys().get('bye'), ['fr']);
});

test('dictionaries are checked for missing keys, lost placeholders and plural forms', () => {
  assert.deepEqual(dictionaryProblems(DICTIONARIES, 'uk'), ['onlyUk — not in en, pl']);
  assert.deepEqual(dictionaryProblems({ uk: { hi: 'Привіт, {name}!', n: { one: '{count}', few: '{count}', many: '{count}', other: '{count}' } }, en: { hi: 'Hi!', n: { other: '{count}' } } }, 'uk'), [
    'en: hi has {}, uk has {name}',
    'en: n lacks «one»',
  ]);
  assert.deepEqual(dictionaryProblems({ uk: { a: 'так' }, en: { a: ' ' } }, 'uk'), ['en: a is empty']);
});
