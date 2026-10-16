import assert from 'node:assert/strict';
import { test } from 'node:test';
import { markStress, missingStress, stressBook, STRESS, unmarked } from '../src/core/language/stress.ts';
import { uk } from '../src/core/language/uk/index.ts';
import FILE from '../src/core/language/uk/stress.json' with { type: 'json' };

const book = stressBook({
  words: ['колесо́', 'ма́ма', 'п’ять', 'до́ма', 'за́мок', 'замо́к', 'будь-яки́й', 'котя́ча'],
  phrases: ['на за́мку'],
});
const ALPHABET = { letters: /^[а-щьюяєіїґ’'-]+$/, vowels: /[аеєиіїоуюя]/g };

test('a known word gets its stress; its capital letter stays', () => {
  assert.equal(markStress('Колесо котиться до мами.', book), `Колесо${STRESS} котиться до мами.`);
  assert.equal(markStress('Мама вдома.', book), `Ма${STRESS}ма вдома.`);
});

test('a word stressed two ways is left to the voice — unless a phrase settles it', () => {
  assert.equal(markStress('Великий замок.', book), 'Великий замок.');
  assert.equal(markStress('Прапор на замку.', book), `Прапор на за${STRESS}мку.`);
});

test('a word the author marked is left as it is; quotes and apostrophes are not letters of a word', () => {
  assert.equal(markStress(`ма${STRESS}ма`, book), `ма${STRESS}ма`);
  assert.equal(markStress('«мама»', book), `«ма${STRESS}ма»`);
  assert.equal(markStress("'мама'", book), `'ма${STRESS}ма'`);
});

test('a hyphenated word is looked up whole, then by its halves', () => {
  assert.equal(markStress('будь-який', book), `будь-яки${STRESS}й`);
  assert.equal(markStress('мама-котяча', book), `ма${STRESS}ма-котя${STRESS}ча`);
});

test('what the dictionary lacks: words of the language with two vowels or more', () => {
  assert.deepEqual(missingStress('Мама має кота і dog, кіт, Колесо, замок.', book, ALPHABET, new Set(['замок'])).sort(), ['кота', 'має']);
});

test('unmarked removes the marks', () => {
  assert.equal(unmarked(markStress('Колесо мами', book)), 'Колесо мами');
});

test('the Ukrainian dictionary: one stress mark a word, after a vowel, and no word written twice the same way', () => {
  const seen = new Set<string>();
  for (const word of FILE.words) {
    assert.equal(word, word.trim().toLocaleLowerCase(), `«${word}»: lower case, no spaces`);
    assert.ok(!seen.has(word), `«${word}» is written twice`);
    seen.add(word);
    const marks = word.split(STRESS).length - 1;
    // A compound may carry a second stress («сорокап’я́тий» has one; «південно-за́хідний» two halves).
    assert.ok(marks >= 1 && marks <= (word.includes('-') ? 2 : 1), `«${word}»: ${marks} stress marks`);
    assert.ok(new RegExp(`^(?:[^${STRESS}]*[аеєиіїоуюя]${STRESS})+[^${STRESS}]*$`).test(word), `«${word}»: a mark must follow a vowel`);
  }
});

test('the Ukrainian voice marks what it knows and leaves the rest', async () => {
  const known = FILE.words[0];
  if (!known) return;
  const plain = unmarked(known);
  assert.equal(await uk.stress.stressed(plain), known);
});
