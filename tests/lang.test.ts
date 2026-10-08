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

test('numbers are said as words in the gender and case the sentence asks for', async () => {
  const { numberWords, num, say, written, spoken, hourAt, letterName } = await import('../src/core/lang/numbers.ts');
  assert.equal(numberWords(2, 'f'), 'дві');
  assert.equal(numberWords(2, 'm'), 'два');
  assert.equal(numberWords(1, 'n'), 'одне');
  assert.equal(numberWords(22, 'f'), 'двадцять дві');
  assert.equal(numberWords(12, 'f'), 'дванадцять');
  assert.equal(numberWords(41), 'сорок один');
  assert.equal(numberWords(100), 'сто');
  assert.equal(numberWords(365), 'триста шістдесят п’ять');
  // «у трьох коробках», «між п’ятьма друзями».
  assert.equal(numberWords(3, 'f', 'gen'), 'трьох');
  assert.equal(numberWords(5, 'm', 'ins'), 'п’ятьма');
  assert.equal(numberWords(24, 'm', 'gen'), 'двадцяти чотирьох');
  // One string, two readings.
  const text = `На столі ${num(2, 'f')} машинки, а в кошику — ще ${num(4, 'f')}. О ${say(7, hourAt(7))} годині.`;
  assert.equal(written(text), 'На столі 2 машинки, а в кошику — ще 4. О 7 годині.');
  assert.equal(spoken(text), 'На столі дві машинки, а в кошику — ще чотири. О сьомій годині.');
  assert.equal(written('без чисел'), 'без чисел');
  assert.equal(letterName('Ж'), 'же');
  assert.equal(letterName('ь'), 'м’який знак');
});

test('a plain text with digits is read out in words, by the words around each number', async () => {
  const { voiced, ordinalWords, num } = await import('../src/core/lang/numbers.ts');
  assert.equal(ordinalWords(1863, 'gen'), 'тисяча вісімсот шістдесят третього');
  assert.equal(ordinalWords(2000, 'gen'), 'двохтисячного');
  assert.equal(ordinalWords(2011, 'gen'), 'дві тисячі одинадцятого');
  assert.equal(ordinalWords(1991, 'loc'), 'тисяча дев’ятсот дев’яносто першому');
  assert.equal(ordinalWords(3, 'f'), 'третя');
  const says = (text: string, heard: string) => assert.equal(voiced(text), heard);
  says('Скільки буде 2 плюс 4?', 'Скільки буде два плюс чотири?');
  says('На столі лежать 2 машинки, а в кошику — ще 4.', 'На столі лежать дві машинки, а в кошику — ще чотири.');
  says('У кошику 1 яблуко і 2 груші.', 'У кошику одне яблуко і дві груші.');
  says('Це 2 однакові купки, у кожній по 5.', 'Це дві однакові купки, у кожній по п’ять.');
  says('Обчисли: 3 з 4 плюс 1 з 4', 'Обчисли: три з чотирьох плюс один з чотирьох');
  says('Леви відпочивають до 20 годин на добу.', 'Леви відпочивають до двадцяти годин на добу.');
  says('З’єднай зорі по порядку: від 1 до 4.', 'З’єднай зорі по порядку: від одного до чотирьох.');
  says('Нептун відкрили 1846 року, а оберт завершив аж 2011-го.', 'Нептун відкрили тисяча вісімсот сорок шостого року, а оберт завершив аж дві тисячі одинадцятого.');
  says('День Незалежності святкують 24 серпня.', 'День Незалежності святкують двадцять четвертого серпня.');
  says('У Києві 12:00.', 'У Києві дванадцята година.');
  says('Потяг виїхав о 7:00.', 'Потяг виїхав о сьомій.');
  says('перша година 40 хвилин', 'перша година сорок хвилин');
  says('11 година', 'одинадцята година');
  says('Рік триває 365 днів.', 'Рік триває триста шістдесят п’ять днів.');
  says('Мороз мінус 224 градуси.', 'Мороз мінус двісті двадцять чотири градуси.');
  // Letters: named in a sentence — by their names; a sentence that begins with «У», «З», «А» is left alone.
  says('Назва починається на літеру «Л».', 'Назва починається на літеру «ел».');
  says('З’єднай зорі за абеткою: від И до П.', 'З’єднай зорі за абеткою: від и до пе.');
  says('У лісі живе білка. А в горах — орел. З неба падає дощ.', 'У лісі живе білка. А в горах — орел. З неба падає дощ.');
  // What the author marked is said as marked.
  says(`Скільки ${num(2, 'n')} та ${num(2, 'f')}?`, 'Скільки два та дві?');
  says('без чисел', 'без чисел');
});
