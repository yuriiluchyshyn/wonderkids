/**
 * Any Polish text, made ready for the voice — the Polish counterpart of
 * `uk/voice.ts`. A speech engine handed a digit guesses its gender and case,
 * and says «dwa gwiazdy», «pięć dzieci», «w tysiąc dziewięćset dziewięćdziesiąt
 * jeden roku». `voiced` is the last stop before the speech engine: it reads
 * what the author marked (`num` / `ord` / `year` / `say`) as marked, and works
 * the rest out from the words around it.
 *
 * Deliberately free of React and of `@/` imports so it runs under `node --test`.
 */
import { spoken } from '../marks.ts';
import { roman } from '../roman.ts';
import { letterName } from './letters.ts';
import { collectiveWords, numberWords, ordinalWords, type Gender, type NumCase, type OrdinalForm } from './numbers.ts';

const UPPER = 'A-ZĄĆĘŁŃÓŚŹŻ';
const WORD = `A-Za-zĄąĆćĘęŁłŃńÓóŚśŹźŻż`;
const MONTHS_GEN = 'stycznia|lutego|marca|kwietnia|maja|czerwca|lipca|sierpnia|września|października|listopada|grudnia';

/** Feminine words a number is often said with: singular, plural. Everything not listed below is taken for masculine — the usual case. */
const FEMININE: [string, string][] = [
  ['godzina', 'godziny'], ['minuta', 'minuty'], ['sekunda', 'sekundy'], ['doba', 'doby'], ['złotówka', 'złotówki'], ['planeta', 'planety'], ['gwiazda', 'gwiazdy'],
  ['gwiazdka', 'gwiazdki'], ['kratka', 'kratki'], ['strona', 'strony'], ['część', 'części'], ['połowa', 'połowy'], ['noga', 'nogi'], ['ręka', 'ręce'], ['łapa', 'łapy'],
  ['książka', 'książki'], ['litera', 'litery'], ['cyfra', 'cyfry'], ['liczba', 'liczby'], ['kropka', 'kropki'], ['grupa', 'grupy'], ['para', 'pary'], ['noc', 'noce'],
  ['rzeka', 'rzeki'], ['góra', 'góry'], ['wyspa', 'wyspy'], ['flaga', 'flagi'], ['stolica', 'stolice'], ['piłka', 'piłki'], ['kulka', 'kulki'], ['lalka', 'lalki'],
  ['zabawka', 'zabawki'], ['moneta', 'monety'], ['gruszka', 'gruszki'], ['śliwka', 'śliwki'], ['truskawka', 'truskawki'], ['kaczka', 'kaczki'], ['krowa', 'krowy'],
  ['owca', 'owce'], ['koza', 'kozy'], ['kura', 'kury'], ['żaba', 'żaby'], ['mysz', 'myszy'], ['ryba', 'ryby'], ['rybka', 'rybki'], ['pszczoła', 'pszczoły'],
  ['kropla', 'krople'], ['próba', 'próby'], ['linia', 'linie'], ['figura', 'figury'], ['farba', 'farby'], ['kredka', 'kredki'], ['kość', 'kości'], ['fala', 'fale'],
  ['tona', 'tony'], ['łyżka', 'łyżki'], ['szklanka', 'szklanki'], ['butelka', 'butelki'], ['filiżanka', 'filiżanki'], ['miska', 'miski'], ['półka', 'półki'],
  ['bułka', 'bułki'], ['czekolada', 'czekolady'], ['budowla', 'budowle'], ['wieża', 'wieże'], ['ozdoba', 'ozdoby'], ['stacja', 'stacje'], ['rakieta', 'rakiety'],
  ['cegiełka', 'cegiełki'], ['śnieżynka', 'śnieżynki'], ['perła', 'perły'], ['muszla', 'muszle'], ['odpowiedź', 'odpowiedzi'], ['gra', 'gry'], ['zagadka', 'zagadki'],
  ['siostra', 'siostry'], ['córka', 'córki'], ['koleżanka', 'koleżanki'], ['dziewczynka', 'dziewczynki'], ['kobieta', 'kobiety'], ['drużyna', 'drużyny'],
  ['naklejka', 'naklejki'], ['kartka', 'kartki'], ['karta', 'karty'], ['kostka', 'kostki'], ['sylaba', 'sylaby'], ['samogłoska', 'samogłoski'], ['spółgłoska', 'spółgłoski'],
  ['bajka', 'bajki'], ['piosenka', 'piosenki'], ['gałąź', 'gałęzie'], ['ściana', 'ściany'], ['tabliczka', 'tabliczki'],
];
const NEUTER = ['jabłko', 'okno', 'słońce', 'drzewo', 'serce', 'jajko', 'jajo', 'koło', 'kółko', 'morze', 'jezioro', 'słowo', 'zdanie', 'zadanie', 'pytanie', 'miejsce', 'oko', 'ucho', 'dziecko', 'zwierzę', 'pole', 'miasto', 'państwo', 'ciastko', 'ciasteczko', 'euro', 'piętro', 'pudełko', 'zdjęcie', 'imię', 'ziarenko', 'auto', 'pióro', 'krzesło', 'łóżko', 'lustro', 'gniazdo'];
/** Men as the subject («dwaj chłopcy») and as the counted («dwóch chłopców», «pięciu chłopców»). */
const MEN: [subject: string, counted: string][] = [
  ['chłopcy', 'chłopców'], ['bracia', 'braci'], ['uczniowie', 'uczniów'], ['koledzy', 'kolegów'], ['przyjaciele', 'przyjaciół'], ['panowie', 'panów'], ['synowie', 'synów'],
  ['rycerze', 'rycerzy'], ['królowie', 'królów'], ['książęta', 'książąt'], ['piraci', 'piratów'], ['astronauci', 'astronautów'], ['kosmonauci', 'kosmonautów'],
  ['żołnierze', 'żołnierzy'], ['lekarze', 'lekarzy'], ['nauczyciele', 'nauczycieli'], ['sąsiedzi', 'sąsiadów'], ['ludzie', 'ludzi'], ['mężczyźni', 'mężczyzn'],
  ['strażacy', 'strażaków'], ['piłkarze', 'piłkarzy'], ['rybacy', 'rybaków'], ['kucharze', 'kucharzy'], ['pasażerowie', 'pasażerów'], ['podróżnicy', 'podróżników'],
  ['naukowcy', 'naukowców'], ['malarze', 'malarzy'], ['pisarze', 'pisarzy'], ['zawodnicy', 'zawodników'], ['gracze', 'graczy'], ['goście', 'gości'],
];
/** Counted with «dwoje», «pięcioro»: children, the young of animals, things that have no singular. */
const COLLECTIVE = new Set(['dzieci', 'drzwi', 'sań', 'skrzypiec', 'oczu', 'uszu', 'kurcząt', 'kociąt', 'szczeniąt', 'piskląt', 'źrebiąt', 'cieląt', 'prosiąt', 'jagniąt', 'kaczątek', 'kacząt', 'niemowląt', 'dziewcząt', 'zwierząt', 'rodzeństwa']);

const WORD_GENDER = new Map<string, Gender>([...FEMININE.flatMap(([one, few]): [string, Gender][] => [[one, 'f'], [few, 'f']]), ...NEUTER.map((w): [string, Gender] => [w, 'n']), ...MEN.map(([subject]): [string, Gender] => [subject, 'mp'])]);
const MEN_COUNTED = new Set(MEN.map(([, counted]) => counted));

/** Words after which a number stands in the genitive («do pięciu», «z czterech»)… */
const GENITIVE_AFTER = new Set(['do', 'od', 'bez', 'dla', 'u', 'około', 'koło', 'obok', 'wśród', 'oprócz', 'zamiast', 'spośród', 'spod', 'sprzed', 'znad', 'podczas', 'wokół', 'według', 'poniżej', 'powyżej']);
/** …the dative («dzięki dwóm»)… */
const DATIVE_AFTER = new Set(['dzięki', 'ku', 'przeciw', 'przeciwko']);
/** …the instrumental — always («między dwoma»), or only when the noun shows it («przed pięcioma dniami», but «za pięć minut»)… */
const INSTRUMENTAL_AFTER = new Set(['między', 'pomiędzy']);
const INSTRUMENTAL_IF_NOUN = new Set(['z', 'ze', 'przed', 'nad', 'pod', 'za', 'poza']);
/** …and the locative, when the noun shows it («w pięciu miastach», but «w pięć minut»). */
const LOCATIVE_IF_NOUN = new Set(['w', 'we', 'o', 'po', 'na', 'przy']);
/** A plural noun in the instrumental («kotami», «dziećmi») or the locative («miastach») gives its case away by its ending. */
const INSTRUMENTAL_NOUN = /(ami|[ćźńłd]mi|dzmi)$/;
const LOCATIVE_NOUN = /ach$/;

/** What a four-digit number after «w» counts, when it is not a year («w 1500 krokach», «do 2000 metrów»). */
const COUNTED = new Set(['lat', 'lata', 'dni', 'godzin', 'minut', 'sekund', 'km', 'm', 'kg', 'razy', 'punktów', 'kroków', 'osób', 'ludzi', 'gwiazd', 'monet', 'stron', 'słów']);
const isYear = (digits: string): boolean => Number(digits) >= 1000 && Number(digits) <= 2099;
const counts = (next: string): boolean => COUNTED.has(next) || /(ów|ach|ami)$/.test(next);

/** The form of the hour after a preposition: «o siódmej», «do siódmej», «na siódmą», «przed siódmą». */
const HOUR_AFTER: Record<string, OrdinalForm> = { o: 'f-obl', po: 'f-obl', do: 'f-obl', od: 'f-obl', koło: 'f-obl', około: 'f-obl', na: 'f-acc', za: 'f-acc', przed: 'f-acc' };
const HOUR_WORD: Record<string, OrdinalForm> = { godzina: 'f', godziny: 'f-obl', godzinie: 'f-obl', godzinę: 'f-acc', godziną: 'f-acc' };
const MIDNIGHT: Record<OrdinalForm, string> = { m: 'północ', f: 'północ', n: 'północ', gen: 'północy', loc: 'północy', 'f-obl': 'północy', 'f-acc': 'północ' };

const lower = (word: string): string => word.toLocaleLowerCase('pl');
const capital = (word: string): string => word.charAt(0).toLocaleUpperCase('pl') + word.slice(1);

/**
 * A plain Polish text as the voice should read it:
 *   «o 7:00» → «o siódmej», «12:00» → «dwunasta», «na 8:30» → «na ósmą trzydzieści», «15:05» → «piętnasta zero pięć»
 *   «w 1991 roku» → «w tysiąc dziewięćset dziewięćdziesiątym pierwszym roku», «1846 roku» → «… czterdziestego szóstego roku», «rok 2000» → «rok dwutysięczny»
 *   «24 sierpnia» → «dwudziestego czwartego sierpnia», «w XX wieku» → «w dwudziestym wieku», «Jan III Sobieski» → «Jan Trzeci Sobieski»
 *   «2 gwiazdy» → «dwie gwiazdy», «1 jabłko» → «jedno jabłko», «2 chłopcy» → «dwaj chłopcy», «5 chłopców» → «pięciu chłopców», «5 dzieci» → «pięcioro dzieci»
 *   «do 20 godzin» → «do dwudziestu godzin», «3 z 4» → «trzy z czterech», «między 5 a 10» → «między pięcioma a dziesięcioma», «z 2 kotami» → «z dwoma kotami»
 *   «3,5» → «trzy przecinek pięć», «50%» → «pięćdziesiąt procent»
 * A lone capital letter named in a sentence («na literę „W”», «od A do Z») is
 * said by its name. An author who knows better marks the number with `num` /
 * `ord` / `year` / `say` — a marked one is never touched.
 */
export function voiceNumbers(text: string): string {
  if (!new RegExp(`\\d|[${UPPER}]`).test(text)) return text;
  let out = text;

  // Clock times: the hour is an ordinal, feminine like «godzina».
  out = out.replace(new RegExp(`(?<![${WORD}\\d:])(?:(o|po|do|od|koło|około|na|za|przed)\\s)?(?:(godzina|godziny|godzinie|godzinę|godziną)\\s)?(\\d{1,2}):(\\d{2})(?![\\d:])`, 'gi'), (_, at = '', word = '', h: string, m: string) => {
    const form = HOUR_WORD[lower(word)] ?? HOUR_AFTER[lower(at)] ?? 'f';
    const lead = `${at ? `${at} ` : ''}${word ? `${word} ` : ''}`;
    if (Number(h) % 24 === 0 && Number(m) === 0 && !word) return lead + (lower(at) === 'przed' ? 'północą' : MIDNIGHT[form]);
    const minutes = Number(m) === 0 ? '' : ` ${Number(m) < 10 ? 'zero ' : ''}${numberWords(Number(m), 'f')}`;
    return `${lead}${ordinalWords(Number(h), form)}${minutes}`;
  });
  out = out.replace(new RegExp(`(?<![${WORD}])(godzina|godziny|godzinie|godzinę|godziną)\\s(\\d{1,2})(?!\\d|[:,.]\\d)`, 'gi'), (_, word: string, h: string) => `${word} ${ordinalWords(Number(h), HOUR_WORD[lower(word)])}`);
  out = out.replace(new RegExp(`(?<![${WORD}])(o|po|do|od|koło|około|na|przed)\\s(\\d{1,2})(?=\\s(?:rano|wieczorem|wieczór|po południu|w nocy|nad ranem|w południe))`, 'gi'), (_, at: string, h: string) => `${at} ${ordinalWords(Number(h), HOUR_AFTER[lower(at)])}`);

  // Years: «roku» is both the genitive and the locative — the word before tells which.
  out = out.replace(/(\d{3,4})\sr\.(\s*$)?/g, (_, y: string, end?: string) => `${y} roku${end === undefined ? '' : '.'}`);
  out = out.replace(new RegExp(`(?<![${WORD}])(?:(w|we|o|po)\\s)?(?<![\\d,.])(\\d{3,4})\\s(roku)(?![${WORD}])`, 'gi'), (_, at = '', y: string, word: string) => `${at ? `${at} ` : ''}${ordinalWords(Number(y), at ? 'loc' : 'gen')} ${word}`);
  out = out.replace(new RegExp(`(?<![${WORD}])(?:(w|we|o|po)\\s)?(roku|rok)\\s(\\d{3,4})(?!\\d|[,.]\\d)`, 'gi'), (_, at = '', word: string, y: string) => `${at ? `${at} ` : ''}${word} ${ordinalWords(Number(y), lower(word) === 'rok' ? 'm' : at ? 'loc' : 'gen')}`);
  out = out.replace(new RegExp(`(?<![${WORD}])(${MONTHS_GEN})\\s(\\d{4})(?!\\d|[,.]\\d)`, 'gi'), (all: string, month: string, y: string) => (isYear(y) ? `${month} ${ordinalWords(Number(y), 'gen')}` : all));
  out = out.replace(/(?<![\d,.])(\d{4})[–—-](\d{4})(?!\d)/g, (all: string, a: string, b: string) => (isYear(a) && isYear(b) ? `${numberWords(Number(a))} do ${numberWords(Number(b))}` : all));
  out = out.replace(new RegExp(`(?<![${WORD}])(w|we|od|do|sprzed)\\s(\\d{4})(?!\\d|[,.]\\d)(?=(?:\\s([${WORD}]+))?)`, 'gi'), (all: string, at: string, y: string, next = '') => {
    if (!isYear(y) || counts(lower(next))) return all;
    return `${at} ${ordinalWords(Number(y), /^we?$/i.test(at) ? 'loc' : 'gen')}`;
  });

  // Centuries and the numbers of kings: Roman numerals are ordinals.
  out = out.replace(new RegExp(`(?<![${WORD}])(?:([Ww]e?|[Oo]|[Pp]o)\\s)?([IVX]+)\\s(wieku|wiek)(?![${WORD}])`, 'g'), (all: string, at = '', numeral: string, word: string) => {
    const n = roman(numeral);
    return n ? `${at ? `${at} ` : ''}${ordinalWords(n, word === 'wiek' ? 'm' : at ? 'loc' : 'gen')} ${word}` : all;
  });
  out = out.replace(new RegExp(`(?<![${WORD}])(?:([Ww]e?|[Oo]|[Pp]o)\\s)?(wieku|wiek)\\s([IVX]+)(?![${WORD}])`, 'g'), (all: string, at = '', word: string, numeral: string) => {
    const n = roman(numeral);
    return n ? `${at ? `${at} ` : ''}${word} ${ordinalWords(n, word === 'wiek' ? 'm' : at ? 'loc' : 'gen')}` : all;
  });
  out = out.replace(new RegExp(`(?<![${WORD}])([${UPPER}][a-ząćęłńóśźż]+)\\s([IVX]+)(?![${WORD}])`, 'g'), (all: string, name: string, numeral: string) => {
    const n = roman(numeral);
    return n && numeral !== 'X' ? `${name} ${capital(ordinalWords(n))}` : all;
  });

  // Dates, and ordinals written with an ending: «3-ci», «1-szy», «5-tej».
  out = out.replace(new RegExp(`(?<![\\d,.])(\\d{1,2})\\s(${MONTHS_GEN})(?![${WORD}])`, 'gi'), (_, d: string, month: string) => `${ordinalWords(Number(d), 'gen')} ${month}`);
  out = out.replace(new RegExp(`(?<![\\d,.])(\\d+)-(szy|gi|ci|ty|my|ny|ego|iego|go|ej|iej|ym|im|ą|a|e)(?![${WORD}])`, 'g'), (_, n: string, end: string) =>
    ordinalWords(Number(n), /go$/.test(end) ? 'gen' : /ej$/.test(end) ? 'f-obl' : /[yi]m$/.test(end) ? 'loc' : end === 'ą' ? 'f-acc' : end === 'a' ? 'f' : end === 'e' ? 'n' : 'm'),
  );

  // Percentages and decimals.
  out = out.replace(/(?<![\d,.])(\d+),(\d+)(?!\d|[,.]\d)/g, (_, whole: string, part: string) => {
    const tail = part.length > 2 || part.startsWith('0') ? part.split('').map((d) => numberWords(Number(d))).join(' ') : numberWords(Number(part));
    return `${numberWords(Number(whole))} przecinek ${tail}`;
  });
  out = out.replace(new RegExp(`(?<=[${WORD}])\\s?%`, 'g'), ' procent');

  // «między 5 a 10» — both ends stand in the instrumental.
  out = out.replace(new RegExp(`(?<![${WORD}])(między|pomiędzy)\\s(\\d+)\\sa\\s(\\d+)(?!\\d|[,.]\\d)`, 'gi'), (_, at: string, a: string, b: string) => `${at} ${numberWords(Number(a), 'm', 'ins')} a ${numberWords(Number(b), 'm', 'ins')}`);

  // Every other whole number: its case from the word before (and the ending of the noun), its gender from the noun after.
  const wordBefore = new RegExp(`([${WORD}]+)\\s$`);
  // The counted word, or the one after an adjective: «2 jasne gwiazdy».
  const wordAfter = new RegExp(`^\\s([${WORD}]+)(?:\\s([${WORD}]+))?`);
  out = out.replace(/(?<![\d,.])(\d{1,3}(?:[  ]\d{3})+|\d+)(?!\d|[,.]\d)(\s?%)?/g, (all: string, digits: string, percent: string | undefined, at: number, whole: string) => {
    const n = Number(digits.replace(/[  ]/g, ''));
    if (!Number.isFinite(n) || n > 999_999_999) return all;
    if (percent) return `${numberWords(n)} procent`;
    const prev = lower(wordBefore.exec(whole.slice(Math.max(0, at - 24), at))?.[1] ?? '');
    const [, first = '', second = ''] = wordAfter.exec(whole.slice(at + digits.length, at + digits.length + 48)) ?? [];
    const next = lower(first);
    const further = lower(second);
    const noun = WORD_GENDER.has(next) || MEN_COUNTED.has(next) || COLLECTIVE.has(next) || !further ? next : WORD_GENDER.has(further) || MEN_COUNTED.has(further) || COLLECTIVE.has(further) ? further : next;

    let c: NumCase = 'nom';
    if (GENITIVE_AFTER.has(prev)) c = 'gen';
    else if (DATIVE_AFTER.has(prev)) c = 'dat';
    else if (INSTRUMENTAL_AFTER.has(prev)) c = 'ins';
    else if (INSTRUMENTAL_IF_NOUN.has(prev) && INSTRUMENTAL_NOUN.test(noun)) c = 'ins';
    else if (LOCATIVE_IF_NOUN.has(prev) && LOCATIVE_NOUN.test(noun)) c = 'loc';
    // «3 z 4», «jeden z 5» — out of so many.
    else if (prev === 'z' || prev === 'ze') c = 'gen';

    if (COLLECTIVE.has(noun)) return collectiveWords(n, c);
    // «5 chłopców» — the men are counted in the genitive, and so is their number.
    if (MEN_COUNTED.has(noun)) return numberWords(n, 'mp', c === 'nom' ? 'gen' : c);
    // «mam 1 książkę» — a feminine noun in the accusative.
    if (n === 1 && c === 'nom' && noun.endsWith('ę') && !WORD_GENDER.has(noun)) return 'jedną';
    return numberWords(n, WORD_GENDER.get(noun) ?? 'm', c);
  });

  // Letters named in a sentence: in quotes always; bare — unless the sentence begins with it («W lesie…», «A teraz…»).
  out = out.replace(new RegExp(`([„«"'‚])([${WORD}])(["”»'’])`, 'g'), (_, open: string, letter: string, close: string) => `${open}${letterName(letter)}${close}`);
  out = out.replace(new RegExp(`(?<=(?<![${WORD}])(?:[Oo]d|[Dd]o|i|lub|albo|czy|oraz|[Ll]iter[ęaąy]|[Ll]iterze|[Gg]łosk[ęaąi])\\s)([${UPPER}])(?![${WORD}])`, 'g'), (_, letter: string) => letterName(letter));
  // (An initial — «J. K. Rowling» — is not a letter being named.)
  out = out.replace(new RegExp(`(?<=[${WORD},:;—–-]\\s)([${UPPER}])(?![${WORD}]|\\.\\s?[${UPPER}])`, 'g'), (_, letter: string) => letterName(letter));
  return out;
}

/** What the speech engine is handed for a Polish text. */
export const voiced = (text: string): string => voiceNumbers(spoken(text));
