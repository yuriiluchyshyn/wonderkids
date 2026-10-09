import type { LangCode } from '@/core/lang';
import type { GameKind } from '../tasks';
import type { LanguageTexts, PackView } from './types';

/** The Language galaxy in Polish. */

/** «angielskie litery», «angielską literę», «angielskiego słowa», «angielskich słów», «angielski alfabet», «w angielskim alfabecie», «po angielsku» */
type Forms = { name: string; some: string; one: string; ofOne: string; ofMany: string; abc: string; inAbc: string; way: string };
const FORMS: Record<LangCode, Forms> = {
  uk: { name: 'Ukraiński', some: 'ukraińskie', one: 'ukraińską', ofOne: 'ukraińskiego', ofMany: 'ukraińskich', abc: 'ukraiński', inAbc: 'ukraińskim', way: 'po ukraińsku' },
  en: { name: 'Angielski', some: 'angielskie', one: 'angielską', ofOne: 'angielskiego', ofMany: 'angielskich', abc: 'angielski', inAbc: 'angielskim', way: 'po angielsku' },
  pl: { name: 'Polski', some: 'polskie', one: 'polską', ofOne: 'polskiego', ofMany: 'polskich', abc: 'polski', inAbc: 'polskim', way: 'po polsku' },
};
/** The adjective with a space after it for a foreign pack, nothing for the child's own language. */
const of = (p: PackView, form: keyof Forms) => (p.native ? '' : `${FORMS[p.lang][form]} `);
const f = (p: PackView) => FORMS[p.lang];

const OWN: Record<GameKind, { blurb: string; intro: string }> = {
  alphabet: {
    blurb: 'Postaw litery na swoich miejscach w alfabecie — aż do wszystkich trzydziestu dwóch',
    intro: 'Litery w alfabecie stoją jedna za drugą, zawsze w tej samej kolejności. Kilka liter się zgubiło! Przeciągnij każdą na jej miejsce.',
  },
  bubbles: {
    blurb: 'Przebijaj bańki po kolei: alfabet, sylaby i słowa',
    intro: 'W bańkach mydlanych schowały się litery! Przebijaj je po kolei — tak, jak stoją w alfabecie.',
  },
  chain: {
    blurb: 'Łącz słowa: pierwsza litera, połówki słowa, znaczenie',
    intro: 'Każde słowo zaczyna się na jakąś literę. Połącz słowo z jego pierwszą literą!',
  },
  rhymes: {
    blurb: 'Znajduj słowa, które brzmią podobnie: kot — płot',
    intro: 'Niektóre słowa kończą się tak samo, jakby śpiewały razem: kot — płot. To rym! Znajdź rym dla każdego słowa.',
  },
  sentences: {
    blurb: 'Ułóż zdanie ze słów — od dwóch do pięciu',
    intro: 'Słowa się rozsypały! Ustaw je po kolei, żeby powstało zdanie. Pierwsze słowo pisze się wielką literą, a na końcu stoi kropka.',
  },
};

const other = (w: Forms): Record<GameKind, { blurb: string; intro: string }> => ({
  alphabet: {
    blurb: `${w.name}: postaw litery na swoich miejscach w alfabecie`,
    intro: `Uczymy się ${w.ofOne} alfabetu! Litery stoją w nim jedna za drugą, zawsze w tej samej kolejności. Kilka liter się zgubiło — przeciągnij każdą na jej miejsce.`,
  },
  bubbles: {
    blurb: `${w.name}: przebijaj bańki — alfabet i słowa`,
    intro: `Uczymy się ${w.ofOne}! W bańkach są ${w.some} litery. Przebijaj je po kolei, jak w ${w.inAbc} alfabecie. Naciśnij głośnik, żeby usłyszeć literę.`,
  },
  chain: {
    blurb: `${w.name}: łącz słowa z literami i ze sobą`,
    intro: `Uczymy się ${w.ofMany} słów! Połącz każde słowo z literą, na którą się zaczyna. Naciśnij głośnik, żeby usłyszeć słowo.`,
  },
  rhymes: {
    blurb: `${w.name}: znajduj słowa, które się rymują`,
    intro: `W języku ${w.inAbc} też są rymy — słowa, które brzmią podobnie na końcu. Naciskaj głośniki, słuchaj słów i łącz te, które się rymują.`,
  },
  sentences: {
    blurb: `${w.name}: ułóż zdanie ze słów`,
    intro: `Układamy zdania ${w.way}! Ustaw słowa po kolei. Pierwsze słowo pisze się wielką literą, a na końcu stoi kropka.`,
  },
});

export const pl: LanguageTexts = {
  title: 'Język',
  packName: (lang) => ({ uk: 'Język ukraiński', en: 'Język angielski', pl: 'Język polski' })[lang],
  card: (p, kind) => (p.native ? OWN[kind] : other(f(p))[kind]),
  stage: (at, p) => {
    switch (at) {
      case 'abcPlain':
        return 'Teraz w pustych kratkach nie ma podpowiedzi. Przypomnij sobie, która litera stoi po której!';
      case 'abcLong':
        return 'Tabela urosła: teraz ma trzy rzędy liter.';
      case 'abcSpot':
        return 'Teraz wszystkie litery są na miejscu — ale dwie z nich zamieniły się miejscami. Znajdź jedną z nich i jej dotknij!';
      case 'abcWhole':
        return `Przed tobą cały ${of(p, 'abc')}alfabet! Postaw na miejscach wszystkie litery, których brakuje.`;
      case 'parts':
        return p.syllables
          ? p.native
            ? 'Teraz w bańkach są sylaby. Przebijaj je po kolei, żeby wyszło słowo!'
            : `Teraz składamy ${f(p).some} słowa z sylab. Przebijaj sylaby tak, jak stoją w słowie!`
          : `Teraz składamy krótkie ${of(p, 'some')}słowa. Przebijaj litery tak, jak stoją w słowie!`;
      case 'spell':
        return p.native && p.syllables ? 'A teraz składamy słowa z pojedynczych liter. Przebijaj literę po literze!' : 'Słowa robią się dłuższe. Przebijaj literę po literze — od lewej do prawej!';
      case 'strays':
        return p.byEar
          ? 'Teraz słowo nie jest napisane — posłuchaj go i ułóż je samodzielnie. Uwaga: wśród baniek są niepotrzebne litery!'
          : 'Uwaga: wśród baniek są teraz niepotrzebne litery. One nie pękają!';
      case 'sameLetter':
        return 'Teraz łączymy dwa słowa, które zaczynają się na tę samą literę.';
      case 'halves':
        return 'Słowo rozpadło się na dwie połówki! Znajdź dla każdego początku jego zakończenie.';
      case 'assoc':
        return 'Teraz szukamy słów, które łączy znaczenie: co do czego pasuje?';
      case 'three':
        return 'Zdania robią się dłuższe: teraz mają po trzy słowa.';
      case 'long':
        return 'A teraz — prawdziwe duże zdania z czterech i pięciu słów!';
    }
  },

  order: (a, b) => `W alfabecie litera „${a}” stoi wcześniej niż litera „${b}”.`,
  swapAsk: (p) => `Dwie ${of(p, 'some')}litery zamieniły się miejscami. Dotknij litery, która stoi nie na swoim miejscu.`,
  swapHint: (p, order) => (p.native ? `${order} Te dwie litery mrugają.` : `Zaśpiewaj ${f(p).abc} alfabet po kolei. Dwie litery, które zamieniły się miejscami, mrugają.`),
  after: (prev, letter) => `Po literze „${prev}” w alfabecie stoi litera „${letter}”.`,
  before: (next, letter) => `Przed literą „${next}” w alfabecie stoi litera „${letter}”.`,
  fillAsk: (p, how) =>
    how === 'all'
      ? `Ułóż cały ${of(p, 'abc')}alfabet: postaw każdą literę na jej miejscu.`
      : how === 'one'
        ? `Postaw ${of(p, 'one')}literę na jej miejscu w alfabecie.`
        : `Postaw ${of(p, 'some')}litery na swoich miejscach w alfabecie.`,
  fillHint: (p, neighbour) =>
    p.native ? `${neighbour} Jej miejsce mruga.` : `Przypomnij sobie ${f(p).abc} alfabet. Miejsce na następną literę mruga, a w pustych kratkach widać podpowiedzi.`,

  runAsk: (p, from, to) => (p.native ? `Przebijaj litery według alfabetu: od ${from} do ${to}.` : `Przebijaj ${f(p).some} litery według alfabetu — od pierwszej do ostatniej.`),
  runHint: (p, letters) => (p.native ? `Przypomnij sobie alfabet: ${letters.join(', ')}.` : `Przypomnij sobie ${f(p).abc} alfabet. Potrzebna bańka mruga.`),
  partsAsk: (p, word) =>
    p.native ? `Złóż słowo z ${p.syllables ? 'sylab' : 'liter'}: ${word}.` : `Złóż ${f(p).some} słowo z ${p.syllables ? 'sylab' : 'liter'}. Jest napisane pod obrazkiem.`,
  partsHint: (p, word, parts) =>
    p.native ? `Słowo „${word}” składa się tak: ${parts.join(' — ')}.` : `Popatrz na słowo pod obrazkiem i przebijaj ${p.syllables ? 'sylaby' : 'litery'} od lewej do prawej.`,
  spellAsk: (p, word, byEar) => {
    if (p.native) return byEar ? 'Posłuchaj słowa i ułóż je z liter.' : `Ułóż słowo z liter: ${word}.`;
    return byEar ? `Posłuchaj ${f(p).ofOne} słowa i ułóż je z liter.` : `Ułóż ${f(p).some} słowo z liter. Jest napisane pod obrazkiem.`;
  },
  spellHint: (p, word, letters, byEar) => {
    if (p.native) return `Wymów słowo powoli: ${word}. Jego litery: ${letters.join(', ')}.`;
    return byEar
      ? 'Naciśnij głośnik przy obrazku, posłuchaj słowa jeszcze raz i przebijaj litery od lewej do prawej. Niepotrzebne litery nie pękają.'
      : 'Popatrz na słowo pod obrazkiem i przebijaj litery od lewej do prawej. Niepotrzebne litery nie pękają.';
  },

  firstAsk: (p) => (p.native ? 'Połącz każde słowo z literą, na którą się zaczyna.' : `Połącz każde ${f(p).some} słowo z jego pierwszą literą.`),
  firstHint: (p, word, letter) =>
    p.native ? `Wymów słowo na głos i posłuchaj pierwszej głoski. „${word}” zaczyna się na literę „${letter}”.` : 'Popatrz, na jaką literę zaczyna się każde słowo.',
  sameAsk: (p) => `Połącz ${of(p, 'some')}słowa, które zaczynają się na tę samą literę.`,
  sameHint: (p, a, b, letter) => (p.native ? `„${a}” i „${b}” zaczynają się na tę samą literę — „${letter}”.` : 'Porównaj pierwsze litery słów: w parze są takie same.'),
  halfAsk: (p) => `Połącz początek ${of(p, 'ofOne')}słowa z jego zakończeniem.`,
  halfHint: (p, head, tail) =>
    p.native ? `Popatrz na obrazek: to „${head}${tail}”. Słowo zaczyna się od sylaby „${head}”.` : 'Naciśnij głośnik przy obrazku, posłuchaj słowa i znajdź jego początek.',
  assocAsk: (p) => `Połącz ${of(p, 'some')}słowa, które łączy znaczenie.`,
  assocHint: (p, a, b) => (p.native ? `Pomyśl, co do siebie pasuje. „${a}” — „${b}”.` : 'Naciśnij głośnik, żeby usłyszeć słowo. Szukaj tego, co do niego pasuje.'),

  rhymeAsk: (p) => `Znajdź pary ${of(p, 'ofMany')}słów, które się rymują.`,
  rhymeHint: (p, a, b) =>
    p.native ? `Słowa się rymują, kiedy kończą się tak samo: „${a}” — „${b}”.` : 'Naciskaj głośniki i słuchaj: słowa, które się rymują, brzmią na końcu tak samo.',
  rhymeYes: (a, b) => `„${a}” — „${b}”. To rym!`,

  sentenceAsk: (p) => `Ustaw ${of(p, 'some')}słowa po kolei, żeby powstało zdanie.`,
  sentenceHint: (p, first) =>
    p.native ? `Zdanie zaczyna się od słowa z wielkiej litery: „${first}”. Ostatnie słowo ma kropkę.` : 'Zdanie zaczyna się od słowa z wielkiej litery, a kończy słowem z kropką.',
  ends: ['początek', 'koniec'],
};
