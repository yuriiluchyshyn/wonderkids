import { say } from '@/core/lang/marks';
import type { RiddleWords, Rule } from './types';

/**
 * «Логічні задачі» in Polish. Every list keeps the order of the skins in
 * `content/riddles.ts`. A number is written as a digit where the Polish voice
 * reads it right by itself, and with `say` where the word depends on who is
 * counted («2 braci» — «dwóch braci»).
 */

const cap = (text: string) => text.charAt(0).toLocaleUpperCase('pl') + text.slice(1);

/** A name and its genitive: «wyższy od Tomka», «u Tomka». */
const BOYS: [string, string][] = [['Tomek', 'Tomka'], ['Marek', 'Marka'], ['Oskar', 'Oskara'], ['Norbert', 'Norberta'], ['Daniel', 'Daniela'], ['Maks', 'Maksa'], ['Andrzej', 'Andrzeja'], ['Wojtek', 'Wojtka']];
const GIRLS: [string, string][] = [['Ola', 'Oli'], ['Zosia', 'Zosi'], ['Zuzia', 'Zuzi'], ['Lena', 'Leny'], ['Marysia', 'Marysi'], ['Sara', 'Sary'], ['Hania', 'Hani'], ['Daria', 'Darii']];

const ORDINAL_M = ['', 'pierwszy', 'drugi', 'trzeci', 'czwarty', 'piąty', 'szósty', 'siódmy', 'ósmy', 'dziewiąty', 'dziesiąty', 'jedenasty', 'dwunasty', 'trzynasty', 'czternasty', 'piętnasty'];
const ORDINAL_F = ORDINAL_M.map((word) => word.replace(/[yi]$/, 'a'));
const ordinal = (n: number, feminine = false) => say(`${n}.`, (feminine ? ORDINAL_F : ORDINAL_M)[n]);
/** «2 braci» is said «dwóch braci»: men are counted in their own way. */
const MEN = ['', 'jeden', 'dwóch', 'trzech', 'czterech', 'pięciu', 'sześciu'];
const WOMEN = ['', 'jedna', 'dwie', 'trzy', 'cztery', 'pięć', 'sześć'];
const BOTH = ['', 'jedno', 'dwoje', 'troje', 'czworo', 'pięcioro', 'sześcioro'];
/** «5 lat», «3 lata», «22 lata», «12 lat» */
const years = (n: number) => (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? 'lata' : n === 1 ? 'rok' : 'lat');

const ONE_OF: [string, string, string[]][] = [
  ['W pudełku leży', 'Co leży w pudełku?', ['piłka', 'lalka', 'klocek', 'autko']],
  ['W koszyku leży', 'Co leży w koszyku?', ['jabłko', 'gruszka', 'banan', 'cytryna']],
  ['W budzie schował się', 'Kto schował się w budzie?', ['kot', 'pies', 'jeż', 'królik']],
  ['Na talerzu leży', 'Co leży na talerzu?', ['rogalik', 'pierożek', 'naleśnik', 'obwarzanek']],
  ['W piórniku leży', 'Co leży w piórniku?', ['ołówek', 'długopis', 'pędzelek', 'linijka']],
  ['Za drzwiami stoi', 'Kto stoi za drzwiami?', ['tata', 'mama', 'dziadek', 'babcia']],
  ['W szafie wisi', 'Co wisi w szafie?', ['kurtka', 'sukienka', 'koszula', 'szalik']],
  ['W garażu stoi', 'Co stoi w garażu?', ['rower', 'hulajnoga', 'motocykl', 'traktor']],
  ['Na gałęzi siedzi', 'Kto siedzi na gałęzi?', ['sowa', 'papuga', 'wiewiórka', 'wrona']],
  ['W prezencie jest', 'Co jest w prezencie?', ['książka', 'robot', 'układanka', 'miś']],
];

/** Three in a row: each with its genitive («na lewo od psa»). */
const ROWS_OF_THREE: [verb: string, what: string, three: [string, string][]][] = [
  ['siedzi', 'Kto', [['kot', 'kota'], ['pies', 'psa'], ['mysz', 'myszy']]],
  ['stoi', 'Kto', [['słoń', 'słonia'], ['żyrafa', 'żyrafy'], ['zebra', 'zebry']]],
  ['siedzi', 'Kto', [['sowa', 'sowy'], ['papuga', 'papugi'], ['gołąb', 'gołębia']]],
  ['płynie', 'Kto', [['kaczka', 'kaczki'], ['łabędź', 'łabędzia'], ['żaba', 'żaby']]],
  ['leży', 'Kto', [['lew', 'lwa'], ['tygrys', 'tygrysa'], ['niedźwiedź', 'niedźwiedzia']]],
  ['stoi', 'Kto', [['krowa', 'krowy'], ['koń', 'konia'], ['owca', 'owcy']]],
  ['siedzi', 'Kto', [['jeż', 'jeża'], ['wiewiórka', 'wiewiórki'], ['zając', 'zająca']]],
  ['stoi', 'Co', [['robot', 'robota'], ['lalka', 'lalki'], ['miś', 'misia']]],
  ['rośnie', 'Co', [['dąb', 'dębu'], ['choinka', 'choinki'], ['palma', 'palmy']]],
  ['stoi', 'Co', [['autobus', 'autobusu'], ['tramwaj', 'tramwaju'], ['ciężarówka', 'ciężarówki']]],
];

/** «wyższy», «wyższa», «najwyższy», «najwyższa», «najniższy», «najniższa» */
const COMPARE: [string, string, string, string, string, string][] = [
  ['wyższy', 'wyższa', 'najwyższy', 'najwyższa', 'najniższy', 'najniższa'],
  ['starszy', 'starsza', 'najstarszy', 'najstarsza', 'najmłodszy', 'najmłodsza'],
  ['silniejszy', 'silniejsza', 'najsilniejszy', 'najsilniejsza', 'najsłabszy', 'najsłabsza'],
  ['szybszy', 'szybsza', 'najszybszy', 'najszybsza', 'najwolniejszy', 'najwolniejsza'],
  ['cięższy', 'cięższa', 'najcięższy', 'najcięższa', 'najlżejszy', 'najlżejsza'],
  ['weselszy', 'weselsza', 'najweselszy', 'najweselsza', 'najsmutniejszy', 'najsmutniejsza'],
  ['zwinniejszy', 'zwinniejsza', 'najzwinniejszy', 'najzwinniejsza', 'najmniej zwinny', 'najmniej zwinna'],
  ['odważniejszy', 'odważniejsza', 'najodważniejszy', 'najodważniejsza', 'najmniej odważny', 'najmniej odważna'],
  ['cierpliwszy', 'cierpliwsza', 'najcierpliwszy', 'najcierpliwsza', 'najmniej cierpliwy', 'najmniej cierpliwa'],
  ['uważniejszy', 'uważniejsza', 'najuważniejszy', 'najuważniejsza', 'najmniej uważny', 'najmniej uważna'],
];

const rule = (r: Rule): string => {
  switch (r.kind) {
    case 'add':
      return `za każdym razem dodaje się ${r.by}`;
    case 'sub':
      return `za każdym razem odejmuje się ${r.by}`;
    case 'alt':
      return `dodaje się na zmianę: raz ${r.by}, raz ${r.then}`;
    case 'double':
      return 'każda liczba jest dwa razy większa od poprzedniej';
    case 'triple':
      return 'każda liczba jest trzy razy większa od poprzedniej';
    case 'half':
      return 'każda liczba jest dwa razy mniejsza od poprzedniej';
    case 'grow':
      return 'najpierw dodaje się 1, potem 2, potem 3, a dalej — 4';
    case 'shrink':
      return 'najpierw odejmuje się 1, potem 2, potem 3, a dalej — 4';
    case 'two':
      return 'tu splotły się dwa rzędy — patrz na co drugą liczbę';
  }
};

/** Someone with `a` in front and `b` behind (five or more, so the noun never changes); from the sixth on the place is told from both ends. */
const QUEUES: ((a: number, b: number) => string)[] = [
  (a, b) => `Marek stoi w kolejce po lody. Przed nim jest ${a} osób, a za nim — ${b}. Ile osób stoi w kolejce?`,
  (a, b) => `Ola stoi w szeregu na lekcji wuefu. Przed nią jest ${a} dzieci, a za nią — ${b}. Ile dzieci stoi w szeregu?`,
  (a, b) => `Czerwony wagon jedzie w pociągu. Przed nim jest ${a} wagonów, a za nim — ${b}. Ile wagonów ma cały pociąg?`,
  (a, b) => `Niebieski samochód stoi w korku. Przed nim jest ${a} samochodów, a za nim — ${b}. Ile samochodów stoi w korku?`,
  (a, b) => `Lena stoi w kolejce do kasy. Przed nią jest ${a} osób, a za nią — ${b}. Ile osób stoi w kolejce?`,
  (a, b) => `W kolejce po bilety Tomek jest ${ordinal(a + 1)} od przodu i ${ordinal(b + 1)} od końca. Ile osób stoi w kolejce?`,
  (a, b) => `W szeregu Norbert jest ${ordinal(a + 1)} od przodu i ${ordinal(b + 1)} od końca. Ile dzieci stoi w szeregu?`,
  (a, b) => `W rzędzie książek na półce słownik jest ${ordinal(a + 1)} od przodu i ${ordinal(b + 1)} od końca. Ile książek stoi w rzędzie?`,
  (a, b) => `W pociągu wagon restauracyjny jest ${ordinal(a + 1)} od przodu i ${ordinal(b + 1)} od końca. Ile wagonów ma cały pociąg?`,
  (a, b) => `W kolumnie mrówek największa mrówka jest ${ordinal(a + 1, true)} od przodu i ${ordinal(b + 1, true)} od końca. Ile mrówek idzie w kolumnie?`,
];

/** Five or more of each, so the nouns stand in one form: «5 kur i 6 psów». */
const LEGS: [text: (a: number, b: number) => string, first: string, legs: number, second: string, legsToo: number][] = [
  [(a, b) => `Po podwórku chodzi ${a} kur i ${b} psów. Ile mają razem nóg?`, 'Kury', 2, 'Psy', 4],
  [(a, b) => `Na łące pasie się ${a} gęsi i ${b} krów. Ile mają razem nóg?`, 'Gęsi', 2, 'Krowy', 4],
  [(a, b) => `Na podwórzu stoi ${a} kogutów i ${b} koni. Ile mają razem nóg?`, 'Koguty', 2, 'Konie', 4],
  [(a, b) => `Przed domem siedzi ${a} gołębi i ${b} kotów. Ile mają razem nóg i łap?`, 'Gołębie', 2, 'Koty', 4],
  [(a, b) => `Na polanie spotkało się ${a} kaczek i ${b} owiec. Ile mają razem nóg?`, 'Kaczki', 2, 'Owce', 4],
  [(a, b) => `Na parkingu stoi ${a} rowerów i ${b} samochodów. Ile mają razem kół?`, 'Rowery', 2, 'Samochody', 4],
  [(a, b) => `Na podwórku stoi ${a} hulajnóg i ${b} rowerków trójkołowych. Ile mają razem kół?`, 'Hulajnogi', 2, 'Rowerki trójkołowe', 3],
  [(a, b) => `W pokoju stoi ${a} stołków na trzech nogach i ${b} krzeseł na czterech. Ile mają razem nóg?`, 'Stołki', 3, 'Krzesła', 4],
  [(a, b) => `Na kwiatku siedzi ${a} żuków i ${b} ptaszków. Ile mają razem nóżek?`, 'Żuki', 6, 'Ptaszki', 2],
  [(a, b) => `W kącie zebrało się ${a} pająków i ${b} much. Ile mają razem nóżek?`, 'Pająki', 8, 'Muchy', 6],
];

const DAYS = ['poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota', 'niedziela'];
const was = (day: string) => (day.endsWith('a') ? 'była' : 'był');
const DAY_ASKS: [tells: (day: string) => string, question: string, note: string][] = [
  [(d) => `Dzisiaj jest ${d}.`, 'Jaki dzień tygodnia będzie jutro?', 'dzisiaj'],
  [(d) => `Dzisiaj jest ${d}.`, 'Jaki dzień tygodnia był wczoraj?', 'dzisiaj'],
  [(d) => `Dzisiaj jest ${d}.`, 'Jaki dzień tygodnia będzie pojutrze?', 'dzisiaj'],
  [(d) => `Dzisiaj jest ${d}.`, 'Jaki dzień tygodnia był przedwczoraj?', 'dzisiaj'],
  [(d) => `Dzisiaj jest ${d}.`, 'Jaki dzień tygodnia będzie za trzy dni?', 'dzisiaj'],
  [(d) => `Dzisiaj jest ${d}.`, 'Jaki dzień tygodnia będzie za pięć dni?', 'dzisiaj'],
  [(d) => `Jutro będzie ${d}.`, 'Jaki dzień tygodnia był wczoraj?', 'jutro'],
  [(d) => `Wczoraj ${was(d)} ${d}.`, 'Jaki dzień tygodnia będzie jutro?', 'wczoraj'],
  [(d) => `Przedwczoraj ${was(d)} ${d}.`, 'Jaki dzień tygodnia jest dzisiaj?', 'przedwczoraj'],
  [(d) => `Pojutrze będzie ${d}.`, 'Jaki dzień tygodnia jest dzisiaj?', 'pojutrze'],
];

const CUTS: [text: (n: number) => string, find: 'cuts' | 'pieces'][] = [
  [(n) => `Kłodę przepiłowano na ${n} części. Ile zrobiono cięć?`, 'cuts'],
  [(n) => `Sznurek pocięto na ${n} kawałków. Ile zrobiono cięć?`, 'cuts'],
  [(n) => `Bagietkę pokrojono na ${n} kawałków. Ile zrobiono cięć?`, 'cuts'],
  [(n) => `Wstążkę pocięto na ${n} części. Ile zrobiono cięć?`, 'cuts'],
  [(n) => `Wzdłuż ścieżki posadzono w jednym rzędzie ${n} drzew. Ile jest odstępów między nimi?`, 'cuts'],
  [(n) => `Deskę przepiłowano w ${n} miejscach. Na ile części rozpadła się deska?`, 'pieces'],
  [(n) => `Kiełbasę przecięto w ${n} miejscach. Ile wyszło kawałków?`, 'pieces'],
  [(n) => `Drut przecięto w ${n} miejscach. Ile wyszło kawałków drutu?`, 'pieces'],
  [(n) => `Batonik czekoladowy przełamano w ${n} miejscach. Ile wyszło kawałków?`, 'pieces'],
  [(n) => `Między słupkami płotu jest ${n} odstępów. Ile słupków ma płot?`, 'pieces'],
];

/** The colours already answer to the thing: «czerwony koralik», «zielona chorągiewka». */
const REPEATS: [string, string, 'm' | 'f', string[]][] = [
  ['Koraliki na nitce idą tak', 'koralik', 'm', ['czerwony', 'niebieski', 'żółty']],
  ['Chorągiewki na girlandzie wiszą tak', 'chorągiewka', 'f', ['zielona', 'żółta', 'niebieska']],
  ['Baloniki na przyjęciu wiszą tak', 'balonik', 'm', ['czerwony', 'biały', 'niebieski']],
  ['Płytki na podłodze leżą tak', 'płytka', 'f', ['czarna', 'biała', 'szara']],
  ['Klocki w wieży stoją tak', 'klocek', 'm', ['żółty', 'czerwony', 'zielony']],
  ['Lampki na choince świecą tak', 'lampka', 'f', ['niebieska', 'żółta', 'czerwona']],
  ['Kwiaty na rabacie rosną tak', 'kwiat', 'm', ['biały', 'żółty', 'fioletowy']],
  ['Wagoniki w pociągu jadą tak', 'wagonik', 'm', ['zielony', 'niebieski', 'pomarańczowy']],
  ['Paski na szaliku idą tak', 'pasek', 'm', ['czerwony', 'żółty', 'zielony']],
  ['Guziki na wstążce są przyszyte tak', 'guzik', 'm', ['czarny', 'czerwony', 'biały']],
];

const RACES = ['dobiegł do mety', 'obudził się', 'przyszedł do szkoły', 'skończył rysunek', 'zjadł śniadanie', 'ułożył puzzle', 'dopłynął do brzegu', 'wszedł na górkę', 'rozwiązał zadanie', 'poszedł spać'];

/** Five or more, so always «jabłek». */
const HAVE = ['jabłek', 'naklejek', 'orzechów', 'baloników', 'ołówków', 'cukierków', 'muszelek', 'znaczków', 'klocków', 'monet'];

const OWNERS: [string, string[]][] = [
  ['mają zwierzaki', ['kot', 'pies', 'papuga']],
  ['jedzą owoce', ['jabłko', 'gruszka', 'banan']],
  ['uprawiają sport', ['piłka nożna', 'pływanie', 'tenis']],
  ['grają na instrumentach', ['skrzypce', 'bęben', 'gitara']],
  ['dostali prezenty', ['książka', 'robot', 'układanka']],
  ['przyjechali do szkoły', ['rower', 'hulajnoga', 'autobus']],
  ['założyli czapki', ['czerwona', 'niebieska', 'zielona']],
  ['rysują', ['dom', 'drzewo', 'statek']],
  ['zamówili napoje', ['sok', 'herbata', 'mleko']],
  ['wybrali lody', ['czekoladowe', 'truskawkowe', 'waniliowe']],
];

/** Who met, for three, four, five and six of them — the verb answers to the number. */
const MEETINGS: [who: [string, string, string, string], did: string, ask: string, both: boolean][] = [
  [['Trzech przyjaciół spotkało się', 'Czterech przyjaciół spotkało się', 'Pięciu przyjaciół spotkało się', 'Sześciu przyjaciół spotkało się'], 'i każdy uścisnął rękę każdemu', 'Ile było uścisków dłoni?', false],
  [['Trzy drużyny zagrały', 'Cztery drużyny zagrały', 'Pięć drużyn zagrało', 'Sześć drużyn zagrało'], 'ze sobą: każda z każdą po jednym razie', 'Ile było meczów?', false],
  [['Trzy miasta połączono', 'Cztery miasta połączono', 'Pięć miast połączono', 'Sześć miast połączono'], 'drogami: między każdymi dwoma miastami biegnie osobna droga', 'Ile dróg zbudowano?', false],
  [['Trzy przyjaciółki podarowały', 'Cztery przyjaciółki podarowały', 'Pięć przyjaciółek podarowało', 'Sześć przyjaciółek podarowało'], 'sobie nawzajem kartki: każda — każdej', 'Ile kartek podarowano?', true],
  [['Trzech szachistów zagrało', 'Czterech szachistów zagrało', 'Pięciu szachistów zagrało', 'Sześciu szachistów zagrało'], 'ze sobą: każdy z każdym po jednej partii', 'Ile było partii?', false],
];

export const pl: RiddleWords = {
  cap,
  boys: BOYS.map((b) => b[0]),
  girls: GIRLS.map((g) => g[0]),
  note: { mark: 'Marek', sister: 'siostra', brother: 'brat', olia: 'Ola', now: 'teraz', later: 'potem', then: 'wtedy', son: 'Syn', mum: 'Mama', olderSister: 'Siostra', thought: 'liczba', tens: 'dziesiątki', ones: 'jedności' },

  oneOf: (skin) => {
    const [lead, ask, things] = ONE_OF[skin];
    const name = (i: number) => things[i];
    return {
      things,
      tell: (set, out) => ({
        text: `${lead} ${set.slice(0, -1).map(name).join(', ')} albo ${name(set[set.length - 1])}. To ${out.slice(0, -1).map((i) => `nie ${name(i)}`).join(', ')}${out.length > 1 ? ' i ' : ''}nie ${name(out[out.length - 1])}. ${ask}`,
        how: `Skreśl to, czego tam nie ma: ${out.map(name).join(', ')}. Zostaje jedno.`,
      }),
    };
  },

  row: (skin) => {
    const [verb, what, three] = ROWS_OF_THREE[skin];
    return {
      names: three.map((t) => t[0]),
      ends: ['po lewej', 'po prawej'],
      tell: (l, m, r, asked, leftFirst) => {
        const [left, middle, right] = [three[l], three[m], three[r]];
        const told = leftFirst
          ? `${cap(left[0])} ${verb} na lewo od ${middle[1]}, a ${right[0]} — na prawo od ${middle[1]}.`
          : `${cap(right[0])} ${verb} na prawo od ${middle[1]}, a ${left[0]} — na lewo od ${middle[1]}.`;
        return {
          text: `${told} ${what} ${verb} ${['pośrodku', 'na lewym końcu', 'na prawym końcu'][asked]}?`,
          how: `Ustaw je w myślach w rzędzie: po lewej — ${left[0]}, dalej — ${middle[0]}, po prawej — ${right[0]}.`,
        };
      },
    };
  },

  chain: (skin, girls) => {
    const [m, f, topM, topF, lowM, lowF] = COMPARE[skin];
    const names = girls ? GIRLS : BOYS;
    const more = girls ? f : m;
    const [top, bottom] = girls ? [topF, lowF] : [topM, lowM];
    return {
      tell: (row, order, low) => {
        const links = row.slice(0, -1).map((who, i) => `${names[who][0]} jest ${more} od ${names[row[i + 1]][1]}`);
        const told = order.map((i) => links[i]);
        return {
          // «Kto» is always a he in Polish, so the question names whom it asks about.
          text: `${told.slice(0, -1).join(', ')}, a ${told[told.length - 1]}. ${girls ? 'Która z dziewczynek' : 'Który z chłopców'} jest ${low ? bottom : top}?`,
          how: `Ustaw ich w rzędzie: ${row.map((w) => names[w][0]).join(', ')}. Pierwsze imię — ${top}, ostatnie — ${bottom}.`,
        };
      },
    };
  },

  next: (row, r) => ({ text: `Jaka liczba będzie następna? ${row.join(', ')}, …`, how: `Odgadnij regułę: ${rule(r)}.` }),

  queue: (skin) => ({
    ends: ['z przodu', 'z tyłu'],
    tell: (a, b) => ({
      text: QUEUES[skin](a, b),
      how:
        skin >= 5
          ? `Z przodu jest ${a}, z tyłu — ${b}. Dodaj je i nie zapomnij o tym, kto stoi między nimi: policz go raz, a nie dwa razy.`
          : `Dodaj tych, którzy są z przodu, i tych, którzy są z tyłu: ${a} i ${b}. I nie zapomnij doliczyć jeszcze jednego — tego, o kim mowa.`,
    }),
  }),

  legs: (skin) => {
    const [text, first, legs, second, legsToo] = LEGS[skin];
    return { labels: [first, second], tell: (a, b) => ({ text: text(a, b), how: `Policz osobno: ${a} razy po ${legs} i ${b} razy po ${legsToo}. Potem dodaj.` }) };
  },

  days: {
    names: DAYS,
    short: ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'],
    tell: (ask, given) => ({
      text: `${DAY_ASKS[ask][0](DAYS[given])} ${DAY_ASKS[ask][1]}`,
      how: `Wymień dni po kolei: ${DAYS.join(', ')}. Najpierw znajdź, jaki dzień jest dzisiaj, a potem odlicz potrzebny.`,
    }),
    note: (ask) => DAY_ASKS[ask][2],
  },

  cuts: (skin) => ({
    tell: (n) => ({
      text: CUTS[skin][0](n),
      how: `Spróbuj na małym: żeby wyszły dwa kawałki, potrzeba jednego cięcia, a żeby trzy — dwóch cięć. Tak samo jest z drzewami i odstępami między nimi. ${CUTS[skin][1] === 'cuts' ? 'Tu odpowiedź jest o jeden mniejsza.' : 'Tu odpowiedź jest o jeden większa.'}`,
    }),
  }),

  repeats: (skin) => {
    const [lead, thing, gender, colours] = REPEATS[skin];
    return {
      colours,
      tell: (unit, place) => ({
        text: `${lead}: ${[...unit, ...unit].map((c) => colours[c]).join(', ')} — i tak dalej. Jakiego koloru będzie ${ordinal(place, gender === 'f')} ${thing}?`,
        how: `Kolory powtarzają się co ${unit.length}. Licz w kółko: ${unit.map((c) => colours[c]).join(', ')} — i znowu od początku, aż do potrzebnego miejsca.`,
      }),
    };
  },

  race: (skin) => {
    const did = RACES[skin];
    return {
      ends: ['wcześniej', 'później'],
      tell: (f, s, t, last, told) => {
        const [first, second, third] = [BOYS[f][0], BOYS[s][0], BOYS[t][0]];
        const tells = [
          `${second} ${did} wcześniej niż ${third}, ale później niż ${first}`,
          `${second} ${did} później niż ${first}, ale wcześniej niż ${third}`,
          `${first} ${did} wcześniej niż ${second}, a ${third} — później niż ${second}`,
        ][told];
        return { text: `${tells}. Kto ${did} ${last ? 'ostatni' : 'pierwszy'}?`, how: `Ustaw ich według czasu: najpierw ${first}, potem ${second}, na końcu ${third}.` };
      },
    };
  },

  more: (skin) => {
    const many = HAVE[skin];
    return {
      names: ['Lena', 'Tomek', 'Ola'],
      tell: (c, b, a, fewer) => ({
        text: fewer
          ? `Lena ma ${c + a + b} ${many}. Tomek ma o ${b} mniej niż Lena, a Ola ma o ${a} mniej niż Tomek. Ile ${many} ma Ola?`
          : `Lena ma ${c} ${many}. Tomek ma o ${b} więcej niż Lena, a Ola ma o ${a} więcej niż Tomek. Ile ${many} ma Ola?`,
        how: 'Idź po kolei: najpierw dowiedz się, ile ma Tomek, a potem — ile ma Ola.',
      }),
    };
  },

  family: (at, [a, b]) =>
    [
      () => ({
        text: `Marek ma ${say(a, ['', 'jedną', 'dwie', 'trzy', 'cztery'][a])} ${a === 1 ? 'siostrę' : 'siostry'} i ${say(b, ['', 'jednego', 'dwóch', 'trzech', 'czterech'][b])} ${b === 1 ? 'brata' : 'braci'}. Ile dzieci jest w tej rodzinie?`,
        how: 'Policz siostry, braci — i nie zapomnij o samym Marku.',
      }),
      () => ({ text: `W rodzinie jest ${say(a, MEN[a])} braci. Każdy z nich ma jedną siostrę. Ile dzieci jest w rodzinie?`, how: 'Wszyscy bracia mają jedną i tę samą siostrę. Policz braci i dodaj ją jedną.' }),
      () => ({ text: `W rodzinie ${a < 5 ? 'są' : 'jest'} ${say(a, WOMEN[a])} ${a < 5 ? 'siostry' : 'sióstr'}. Każda z nich ma jednego brata. Ile dzieci jest w rodzinie?`, how: 'Wszystkie siostry mają jednego i tego samego brata. Policz siostry i dodaj jego jednego.' }),
      () => ({ text: `Ola ma tyle samo braci co sióstr: jednych i drugich po ${say(a, BOTH[a])}. Ile dzieci jest w tej rodzinie?`, how: 'Policz braci, tyle samo sióstr — i nie zapomnij o samej Oli.' }),
      () => ({ text: `Babcia ma ${say(a, WOMEN[a])} ${a < 5 ? 'córki' : 'córek'}. Każda córka ma dwoje dzieci. Ile wnuków ma babcia?`, how: 'Każda córka ma dwoje dzieci. Licz po dwoje tyle razy, ile jest córek.' }),
    ][at](),

  ages: (at, [a, d, e]) =>
    [
      () => ({ text: `Ola ma ${a} ${years(a)}. Jej brat jest o ${d} ${years(d)} starszy. Ile lat ma brat?`, how: '„Starszy” znaczy, że ma więcej lat. Dodaj.' }),
      () => ({ text: `Za ${d} ${years(d)} Marek będzie miał ${a + d} ${years(a + d)}. Ile lat ma Marek teraz?`, how: 'Teraz ma mniej lat, niż będzie miał potem. Odejmij lata, które jeszcze nie minęły.' }),
      () => ({ text: `Siostra jest dwa razy starsza od Oli. Ola ma ${a} ${years(a)}. Ile lat ma siostra?`, how: '„Dwa razy starsza” znaczy dwa razy po tyle.' }),
      () => ({ text: `${d === 2 ? 'Dwa' : 'Trzy'} lata temu Daniel miał ${a - d} ${years(a - d)}. Ile lat będzie miał za ${e} ${years(e)}?`, how: 'Najpierw dowiedz się, ile ma lat teraz, a potem dodaj lata, które jeszcze miną.' }),
      () => ({ text: `Mama ma ${d} ${years(d)}, a syn — ${a}. Ile lat miała mama, kiedy urodził się syn?`, how: 'Kiedy syn się urodził, mama była młodsza dokładnie o tyle lat, ile syn ma teraz. Odejmij.' }),
    ][at](),

  hidden: (at, [a, b]) =>
    [
      () => ({ text: `Myślę o pewnej liczbie. Jest większa od ${a}, ale mniejsza od ${b}, i jest parzysta — dzieli się przez dwa. Jaka to liczba?`, how: `Wymień wszystkie liczby między ${a} a ${b}. Parzysta wśród nich to ta, która dzieli się przez dwa.` }),
      () => ({ text: `Myślę o pewnej liczbie. Jest większa od ${a}, ale mniejsza od ${b}, i jest nieparzysta. Jaka to liczba?`, how: `Wymień wszystkie liczby między ${a} a ${b}. Nieparzysta to ta, której nie da się podzielić przez dwa po równo.` }),
      () => ({ text: `Myślę o pewnej liczbie. Jest większa od ${a}, ale mniejsza od ${b}, i można ją podzielić przez pięć. Jaka to liczba?`, how: 'Liczby, które dzielą się przez pięć, kończą się na zero albo na pięć.' }),
      () => ({ text: `W liczbie dwucyfrowej cyfra dziesiątek to ${a}, a cyfra jedności jest o ${b} większa. Jaka to liczba?`, how: `Najpierw znajdź cyfrę jedności: do ${a} dodaj ${b}. Potem zapisz dziesiątki i jedności obok siebie.` }),
      () => ({ text: `Pomyślałem liczbę, dodałem do niej ${b} i wyszło tyle, ile to jest ${a} i jeszcze ${a}. Jaką liczbę pomyślałem?`, how: `Najpierw policz, ile wyszło: ${a} i jeszcze ${a}. Potem odejmij ${b}.` }),
    ][at](),

  owners: (skin) => {
    const [does, things] = OWNERS[skin];
    return {
      things,
      tell: (who, has, hard) => {
        const kids = who.map((k) => BOYS[k]);
        const not = (kid: [string, string], out: number[]) => `U ${kid[1]} to ${out.map((t) => `nie ${things[t]}`).join(' i ')}.`;
        return {
          text: `${kids[0][0]}, ${kids[1][0]} i ${kids[2][0]} ${does}. Każdy ma coś innego: ${things.join(', ')}. ${not(kids[0], [has[1], has[2]])}${hard ? ` ${not(kids[2], [has[1]])}` : ''} Co jest u ${kids[hard ? 1 : 0][1]}?`,
          how: hard
            ? `Najpierw znajdź, co jest u ${kids[0][1]}: zostaje jedno. Potem zobacz, czego nie ma u ${kids[2][1]} — i dowiesz się, co zostało dla ${kids[1][1]}.`
            : 'Skreśl to, czego tam na pewno nie ma. Zostaje jedno.',
        };
      },
    };
  },

  meetings: (skin) => {
    const [who, did, ask, both] = MEETINGS[skin];
    return {
      tell: (n) => ({
        text: `${who[n - 3]} ${did}. ${ask}`,
        how: both
          ? 'Każda daje kartkę wszystkim oprócz siebie. Policz, ile daje jedna, i pomnóż przez liczbę przyjaciółek.'
          : `Pierwszy spotyka się ze wszystkimi pozostałymi, drugi — ze wszystkimi oprócz pierwszego, i tak dalej. Dodaj: ${Array.from({ length: n - 1 }, (_, i) => n - 1 - i).join(' + ')}.`,
      }),
    };
  },
};
