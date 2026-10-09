import assert from 'node:assert/strict';
import { test } from 'node:test';
import { adj, agree, clause, conjugate, counted, inflect, list, noun, phrase, verb } from '../src/core/language/uk/index.ts';

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
  const { accusative, from } = await import('../src/core/language/uk/index.ts');
  assert.equal(accusative('зубна щітка'), 'зубну щітку');
  assert.equal(accusative('кришечка від пляшки'), 'кришечку від пляшки');
  assert.equal(accusative('Бранденбурзькі ворота'), 'Бранденбурзькі ворота');
  assert.equal(accusative('Статуя Русалоньки'), 'Статую Русалоньки');
  assert.equal(accusative('пластикове відерце'), 'пластикове відерце');
  assert.equal(from('січня'), 'із січня');
  assert.equal(from('грудня'), 'з грудня');
});

test('numbers are said as words in the gender and case the sentence asks for', async () => {
  const { numberWords, num, say, written, spoken, hourAt, letterName } = await import('../src/core/language/uk/index.ts');
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
  const { voiced, ordinalWords, num } = await import('../src/core/language/uk/index.ts');
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

// ---- English -------------------------------------------------------------------

test('English numbers, ordinals and years in words', async () => {
  const { numberWords, ordinalWords, yearWords, num, ord, year } = await import('../src/core/language/en/index.ts');
  const { written, spoken } = await import('../src/core/language/marks.ts');
  assert.equal(numberWords(0), 'zero');
  assert.equal(numberWords(21), 'twenty-one');
  assert.equal(numberWords(105), 'one hundred five');
  assert.equal(numberWords(1204), 'one thousand two hundred four');
  assert.equal(numberWords(1_000_000), 'one million');
  assert.equal(ordinalWords(1), 'first');
  assert.equal(ordinalWords(12), 'twelfth');
  assert.equal(ordinalWords(20), 'twentieth');
  assert.equal(ordinalWords(22), 'twenty-second');
  assert.equal(ordinalWords(100), 'one hundredth');
  assert.equal(yearWords(1846), 'eighteen forty-six');
  assert.equal(yearWords(1900), 'nineteen hundred');
  assert.equal(yearWords(1905), 'nineteen oh five');
  assert.equal(yearWords(2000), 'two thousand');
  assert.equal(yearWords(2005), 'two thousand five');
  assert.equal(yearWords(2026), 'twenty twenty-six');
  assert.equal(yearWords(988), 'nine eighty-eight');
  const text = `The ${ord(3)} planet has ${num(1)} moon since ${year(1846)}.`;
  assert.equal(written(text), 'The 3rd planet has 1 moon since 1846.');
  assert.equal(spoken(text), 'The third planet has one moon since eighteen forty-six.');
});

test('an English text is read aloud as a person would read it', async () => {
  const { voiced } = await import('../src/core/language/index.ts');
  const en = (text: string) => voiced(text, 'en');
  assert.equal(en('I have 2 cats and 1 dog.'), 'I have two cats and one dog.');
  assert.equal(en('Wake up at 7:00.'), 'Wake up at seven o’clock.');
  assert.equal(en('Bed is at 9:05 p.m.'), 'Bed is at nine oh five p.m.');
  assert.equal(en('Tea is at 15:30.'), 'Tea is at three thirty p.m.');
  assert.equal(en('Neptune was found in 1846.'), 'Neptune was found in eighteen forty-six.');
  assert.equal(en('From 1914 to 1918.'), 'From nineteen fourteen to nineteen eighteen.');
  assert.equal(en('It takes about 1,500 steps, in 2000 years.'), 'It takes about one thousand five hundred steps, in two thousand years.');
  assert.equal(en('Rome: 753 BC.'), 'Rome: seven fifty-three BC.');
  assert.equal(en('The 1990s.'), 'The nineteen nineties.');
  assert.equal(en('On 24 August 1991.'), 'On the twenty-fourth of August nineteen ninety-one.');
  assert.equal(en('August 24, 1991'), 'August twenty-fourth, nineteen ninety-one');
  assert.equal(en('The 3rd planet.'), 'The third planet.');
  assert.equal(en('Henry VIII and Elizabeth I.'), 'Henry the Eighth and Elizabeth the First.');
  assert.equal(en('Then I ran. World War II.'), 'Then I ran. World War Two.');
  assert.equal(en('It costs $5.'), 'It costs five dollars.');
  assert.equal(en('That is 50% and 3.14.'), 'That is fifty percent and three point one four.');
  assert.equal(en('The letter A. From A to Z.'), 'The letter ay. From ay to zee.');
  assert.equal(en('It starts with B.'), 'It starts with bee.');
  // The article and the pronoun are not letters being named.
  assert.equal(en('I am a cat. A dog is here.'), 'I am a cat. A dog is here.');
  assert.equal(en('It starts with a bang.'), 'It starts with a bang.');
});

// ---- Polish --------------------------------------------------------------------

test('Polish numbers answer to gender, case and the kind of noun', async () => {
  const { numberWords, collectiveWords, ordinalWords, num, year } = await import('../src/core/language/pl/index.ts');
  const { written, spoken } = await import('../src/core/language/marks.ts');
  assert.equal(numberWords(1, 'f'), 'jedna');
  assert.equal(numberWords(1, 'n'), 'jedno');
  assert.equal(numberWords(2, 'f'), 'dwie');
  assert.equal(numberWords(2, 'mp'), 'dwaj');
  assert.equal(numberWords(5, 'mp'), 'pięciu');
  assert.equal(numberWords(22, 'f'), 'dwadzieścia dwie');
  assert.equal(numberWords(22, 'mp'), 'dwudziestu dwóch');
  assert.equal(numberWords(21, 'f'), 'dwadzieścia jeden');
  assert.equal(numberWords(2, 'm', 'gen'), 'dwóch');
  assert.equal(numberWords(2, 'f', 'ins'), 'dwiema');
  assert.equal(numberWords(5, 'm', 'ins'), 'pięcioma');
  assert.equal(numberWords(20, 'f', 'gen'), 'dwudziestu');
  assert.equal(numberWords(500, 'm', 'gen'), 'pięciuset');
  assert.equal(numberWords(1000), 'tysiąc');
  assert.equal(numberWords(2000), 'dwa tysiące');
  assert.equal(numberWords(5000), 'pięć tysięcy');
  assert.equal(numberWords(21_000), 'dwadzieścia jeden tysięcy');
  assert.equal(numberWords(1_000_000), 'milion');
  assert.equal(collectiveWords(2), 'dwoje');
  assert.equal(collectiveWords(5), 'pięcioro');
  assert.equal(collectiveWords(3, 'gen'), 'trojga');
  assert.equal(collectiveWords(22), 'dwadzieścia dwoje');
  assert.equal(ordinalWords(3, 'f'), 'trzecia');
  assert.equal(ordinalWords(2, 'f-acc'), 'drugą');
  assert.equal(ordinalWords(24, 'gen'), 'dwudziestego czwartego');
  assert.equal(ordinalWords(1991, 'loc'), 'tysiąc dziewięćset dziewięćdziesiątym pierwszym');
  assert.equal(ordinalWords(2000), 'dwutysięczny');
  const text = `Od ${year(1846)} roku znamy ${num(8, 'f')} planet.`;
  assert.equal(written(text), 'Od 1846 roku znamy 8 planet.');
  assert.equal(spoken(text), 'Od tysiąc osiemset czterdziestego szóstego roku znamy osiem planet.');
});

test('a Polish text is read aloud as a person would read it', async () => {
  const { voiced } = await import('../src/core/language/index.ts');
  const pl = (text: string) => voiced(text, 'pl');
  assert.equal(pl('Mam 2 gwiazdy, 1 jabłko, 2 koty i 1 książkę.'), 'Mam dwie gwiazdy, jedno jabłko, dwa koty i jedną książkę.');
  assert.equal(pl('Grają 2 chłopcy, a 5 chłopców śpi.'), 'Grają dwaj chłopcy, a pięciu chłopców śpi.');
  assert.equal(pl('Jest tu 5 dzieci, do 3 dzieci.'), 'Jest tu pięcioro dzieci, do trojga dzieci.');
  assert.equal(pl('Wstaję o 7:00.'), 'Wstaję o siódmej.');
  assert.equal(pl('Lekcje od 8:30 do 15:05.'), 'Lekcje od ósmej trzydzieści do piętnastej zero pięć.');
  assert.equal(pl('Jest 12:00, budzik na 6:45.'), 'Jest dwunasta, budzik na szóstą czterdzieści pięć.');
  assert.equal(pl('Neptuna odkryto w 1846 roku.'), 'Neptuna odkryto w tysiąc osiemset czterdziestym szóstym roku.');
  assert.equal(pl('Stało się to 24 sierpnia 1991 roku.'), 'Stało się to dwudziestego czwartego sierpnia tysiąc dziewięćset dziewięćdziesiątego pierwszego roku.');
  assert.equal(pl('Rok 2000 i rok 1410.'), 'Rok dwutysięczny i rok tysiąc czterysta dziesiąty.');
  assert.equal(pl('Od 1914 do 1918.'), 'Od tysiąc dziewięćset czternastego do tysiąc dziewięćset osiemnastego.');
  assert.equal(pl('W XX wieku rządził Jan III Sobieski.'), 'W dwudziestym wieku rządził Jan Trzeci Sobieski.');
  assert.equal(pl('Do 20 godzin, 3 z 4.'), 'Do dwudziestu godzin, trzy z czterech.');
  assert.equal(pl('Między 5 a 10, z 2 kotami.'), 'Między pięcioma a dziesięcioma, z dwoma kotami.');
  assert.equal(pl('W 5 miastach, w 5 minut.'), 'W pięciu miastach, w pięć minut.');
  assert.equal(pl('To 3,5 kg i 50%.'), 'To trzy przecinek pięć kg i pięćdziesiąt procent.');
  assert.equal(pl('Na literę „W”. Od A do Z.'), 'Na literę „wu”. Od a do zet.');
  // A preposition that opens a sentence is not a letter being named.
  assert.equal(pl('W lesie rośnie 1 drzewo i w nim mieszka sowa.'), 'W lesie rośnie jedno drzewo i w nim mieszka sowa.');
});

test('every language makes a text ready for its own voice', async () => {
  const { LANGUAGES, langOfCountry, isLang } = await import('../src/core/language/index.ts');
  assert.equal(LANGUAGES.uk.voiced('2 машинки'), 'дві машинки');
  assert.equal(LANGUAGES.en.voiced('2 cars'), 'two cars');
  assert.equal(LANGUAGES.pl.voiced('2 gwiazdy'), 'dwie gwiazdy');
  assert.deepEqual([LANGUAGES.uk.letterName('ж'), LANGUAGES.en.letterName('w'), LANGUAGES.pl.letterName('ż')], ['же', 'double-you', 'żet']);
  assert.deepEqual([langOfCountry('UA'), langOfCountry('pl'), langOfCountry('DE'), langOfCountry(null)], ['uk', 'pl', 'en', 'en']);
  assert.equal(isLang('pl') && !isLang('de'), true);
});
