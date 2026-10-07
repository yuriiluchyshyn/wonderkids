import assert from 'node:assert/strict';
import { test } from 'node:test';
import { adj, agree, clause, conjugate, counted, inflect, list, noun, phrase, verb } from '../src/core/lang/uk.ts';

test('nouns decline by rule', () => {
  const brick = noun('цеглинка', 'f');
  assert.equal(inflect(brick, 'gen'), 'цеглинки');
  assert.equal(inflect(brick, 'acc'), 'цеглинку');
  assert.equal(inflect(brick, 'nom', 'pl'), 'цеглинки');
  assert.equal(inflect(brick, 'gen', 'pl'), 'цеглинок');
  assert.equal(inflect(noun('рука', 'f'), 'loc'), 'руці');
  assert.equal(inflect(noun('груша', 'f'), 'gen'), 'груші');
  assert.equal(inflect(noun('кавун', 'm'), 'nom', 'pl'), 'кавуни');
  assert.equal(inflect(noun('кавун', 'm'), 'gen', 'pl'), 'кавунів');
  assert.equal(inflect(noun('кіт', 'm', { animate: true, sg: { gen: 'кота' } }), 'acc'), 'кота');
  assert.equal(inflect(noun('завдання', 'n'), 'gen', 'pl'), 'завдань');
  assert.equal(inflect(noun('яблуко', 'n'), 'gen', 'pl'), 'яблук');
  assert.equal(inflect(noun('море', 'n'), 'ins'), 'морем');
  assert.equal(inflect(noun('малина', 'f'), 'gen'), 'малини');
  assert.equal(inflect(noun('полуниця', 'f'), 'gen'), 'полуниці');
});

test('counts pick the right form', () => {
  const syllable = noun('склад', 'm');
  assert.equal(counted(1, syllable), '1 склад');
  assert.equal(counted(3, syllable), '3 склади');
  assert.equal(counted(5, syllable), '5 складів');
  assert.equal(counted(12, syllable), '12 складів');
  assert.equal(counted(21, syllable), '21 склад');
  assert.equal(counted(6, ['цеглинка', 'цеглинки', 'цеглинок']), '6 цеглинок');
});

test('verbs agree in tense, gender and number', () => {
  const ripen = verb('достигати', ['достигає', 'достигають']);
  const melon = noun('кавун', 'm', { number: 'pl' });
  assert.equal(conjugate(ripen, 'present', melon), 'достигають');
  assert.equal(conjugate(ripen, 'past', melon), 'достигали');
  assert.equal(conjugate(ripen, 'future', melon), 'достигатимуть');
  assert.equal(conjugate(ripen, 'past', noun('диня', 'f')), 'достигала');
  const bathe = verb('купатися', ['купається', 'купаються']);
  assert.equal(conjugate(bathe, 'present', 'we'), 'купаємося');
  assert.equal(conjugate(bathe, 'past', 'we'), 'купалися');
  assert.equal(conjugate(bathe, 'future', noun('дитина', 'f')), 'купатиметься');
  assert.equal(conjugate(verb('ліпити', ['ліпить', 'ліплять']), 'present', 'we'), 'ліпимо');
  assert.equal(conjugate(verb('рости', ['росте', 'ростуть'], { past: ['ріс', 'росла', 'росло', 'росли'] }), 'past', noun('дерево', 'n')), 'росло');
});

test('adjectives follow their noun', () => {
  assert.equal(agree(adj('жовтий'), noun('листя', 'n')), 'жовте');
  assert.equal(agree(adj('синій'), noun('річка', 'f'), 'gen'), 'синьої');
  assert.equal(agree(adj('холодний'), noun('дощ', 'm', { number: 'pl' })), 'холодні');
});

test('phrases and clauses', () => {
  const ripen = verb('достигати', ['достигає', 'достигають']);
  const melon = noun('кавун', 'm', { number: 'pl' });
  assert.equal(phrase('Коли {does@who} {who}?', { does: ripen, who: melon }), 'Коли достигають кавуни?');
  assert.equal(phrase('{who:cap} {does@who:past} улітку.', { does: ripen, who: melon }), 'Кавуни достигали улітку.');
  assert.equal(phrase('У слові {n#part}.', { n: 2, part: noun('склад', 'm') }), 'У слові 2 склади.');
  assert.equal(phrase('Немає {a~x:gen} {x:gen}.', { a: adj('стиглий'), x: noun('диня', 'f') }), 'Немає стиглої дині.');
  assert.equal(clause({ who: melon, does: ripen }), 'достигають кавуни');
  assert.equal(clause({ does: verb('ліпити', ['ліпить', 'ліплять']), tail: 'сніговика' }, 'present', { we: true }), 'ми ліпимо сніговика');
  assert.equal(list(['полуниці', 'малина', 'черешня']), 'полуниці, малина та черешня');
});

test('lifeless things in the accusative', async () => {
  const { accusative, from } = await import('../src/core/lang/uk.ts');
  assert.equal(accusative('зубна щітка'), 'зубну щітку');
  assert.equal(accusative('кришечка від пляшки'), 'кришечку від пляшки');
  assert.equal(accusative('Бранденбурзькі ворота'), 'Бранденбурзькі ворота');
  assert.equal(accusative('Статуя Русалоньки'), 'Статую Русалоньки');
  assert.equal(accusative('пластикове відерце'), 'пластикове відерце');
  assert.equal(from('січня'), 'із січня');
  assert.equal(from('грудня'), 'з грудня');
});
