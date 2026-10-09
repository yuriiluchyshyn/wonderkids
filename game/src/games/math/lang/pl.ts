import { LANGUAGES } from '@/core/lang';
import { num, numberWords, ordinalWords, type Gender } from '@/core/lang/pl';
import type { CurrencyId } from '@/core/game/content/currency';
import { MATH_SUB } from '../ids';
import type { MathTexts, MeasureWords, Shape } from './types';

/** The Math galaxy in Polish. */

/** «1 kratka», «3 kratki», «5 kratek» — the form a count asks for. */
const form = (n: number, forms: readonly [one: string, few: string, many: string]): string =>
  n === 1 ? forms[0] : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? forms[1] : forms[2];
/** A count with its thing: shown «2 kratki», said «dwie kratki». */
const counted = (n: number, forms: readonly [string, string, string], gender: Gender): string => `${num(n, gender)} ${form(n, forms)}`;

const measure = (big: string, bigForms: readonly [string, string, string], small: string, smallMany: string, rule: string): MeasureWords => ({
  big,
  // Plain digits: this stands inside a prompt that is shown as it is said, and the voice knows «dwie godziny» (`core/lang/pl/voice.ts`).
  bigSaid: (n) => `${n} ${form(n, bigForms)}`,
  small,
  smallSaid: (n) => `${n} ${smallMany}`,
  rule,
});

const { fraction, sign } = LANGUAGES.pl;
const SQUARES = ['kratka', 'kratki', 'kratek'] as const;
const SHAPES: Record<Shape, string> = { triangle: 'trójkątów', square: 'kwadratów', circle: 'kół', rect: 'prostokątów' };
const OPS = { '+': 'plus', '-': 'minus', '×': 'razy', '÷': 'podzielić przez' } as const;

const heaps = (n: number): string => `${num(n, 'f')} ${form(n, ['kupka', 'jednakowe kupki', 'jednakowych kupek'])}`;

export const MONEY: Record<CurrencyId, { short: string; forms: readonly [string, string, string]; gender: Gender; small: string; smallMany: string; rule: string }> = {
  UAH: { short: 'hrn', forms: ['hrywna', 'hrywny', 'hrywien'], gender: 'f', small: 'kop.', smallMany: 'kopiejek', rule: 'Jedna hrywna to sto kopiejek.' },
  EUR: { short: '€', forms: ['euro', 'euro', 'euro'], gender: 'n', small: 'ct', smallMany: 'centów', rule: 'Jedno euro to sto centów.' },
  USD: { short: '$', forms: ['dolar', 'dolary', 'dolarów'], gender: 'm', small: '¢', smallMany: 'centów', rule: 'Jeden dolar to sto centów.' },
  GBP: { short: '£', forms: ['funt', 'funty', 'funtów'], gender: 'm', small: 'p', smallMany: 'pensów', rule: 'Jeden funt to sto pensów.' },
  PLN: { short: 'zł', forms: ['złoty', 'złote', 'złotych'], gender: 'm', small: 'gr', smallMany: 'groszy', rule: 'Jeden złoty to sto groszy.' },
};

export const pl: MathTexts = {
  cards: {
    title: 'Matematyka',
    games: {
      [MATH_SUB.add]: { label: 'Dodawanie', blurb: 'Zbieramy wszystko razem' },
      [MATH_SUB.sub]: { label: 'Odejmowanie', blurb: 'Zabieramy po trochu' },
      [MATH_SUB.mul]: { label: 'Mnożenie', blurb: 'Jednakowe kupki razem', demoCaption: '2 razy po 2' },
      [MATH_SUB.div]: { label: 'Dzielenie', blurb: 'Dzielimy po równo', demoCaption: '4 po równo na 2' },
      [MATH_SUB.mixed]: { label: 'Rachunek pamięciowy', blurb: 'Wszystko razem: +, −, ×, ÷' },
      [MATH_SUB.fractions]: { label: 'Smaczne ułamki', blurb: 'Szukamy kawałka smakołyku' },
      [MATH_SUB.fractionOps]: { label: 'Ułamki: działania', blurb: 'Dodajemy, odejmujemy, mnożymy i dzielimy ułamki' },
      [MATH_SUB.balance]: {
        label: 'Matematyczna waga',
        blurb: 'Znajdź odważnik, który zrównoważy',
        intro: 'Waga lubi równowagę! Po lewej leży działanie. Przeciągnij na prawą szalkę odważnik, który waży tyle samo.',
      },
      [MATH_SUB.geometry]: { label: 'Geometryczny konstruktor', blurb: 'Układamy figury, liczymy pole i obwód' },
      [MATH_SUB.maze]: {
        label: 'Liczbowy labirynt',
        blurb: 'Biegnij tylko po właściwych liczbach',
        intro: 'Pomóż przyjacielowi przebiec przez labirynt! Stawać można tylko na liczbach, które pasują do zasady. Zrób krok na sąsiednią kratkę.',
      },
      [MATH_SUB.shop]: {
        label: 'Sklep',
        blurb: 'Liczymy kieszonkowe',
        intro: 'Witaj w sklepie! Spójrz na cenę i połóż na kasie tyle pieniędzy, ile kosztuje zabawka.',
      },
      [MATH_SUB.wordProblems]: {
        label: 'Zadania z treścią',
        blurb: 'Historyjki z życia: sklep, przyjaciele, droga',
        intro: 'Posłuchaj krótkiej historyjki i odpowiedz na pytanie. Obrazki podpowiedzą, co wiemy i o co pytają. Jeśli chcesz — naciśnij głośnik, a przeczytam zadanie jeszcze raz.',
      },
      [MATH_SUB.compare]: {
        label: 'Większe, mniejsze, równe',
        blurb: 'Porównujemy liczby, działania i wielkości',
        intro:
          'Porównujmy! Znak „większe” i „mniejsze” wygląda jak dziobek ptaszka: zawsze jest otwarty w stronę większej liczby. A jeśli po obu stronach jest tyle samo, stawiamy „równa się”.',
      },
      [MATH_SUB.clock]: { label: 'Która godzina?', blurb: 'Uczymy się odczytywać zegar ze wskazówkami' },
    },
  },

  intro: {
    add: (it) => `Dodawać to zbierać razem! Połóż ${it}${it} i jeszcze ${it}. Policz: jeden, dwa, trzy. Razem trzy ${it}!`,
    sub: (it) => `Odejmować to zabierać. Było ${it}${it}${it}, jedno ${it} zabrano — zostały dwa. Policz, ile zostanie!`,
    mul: (it) => `Mnożyć to brać jednakowe kupki. Bierzemy ${it}${it} dwa razy: ${it}${it} i jeszcze ${it}${it} — razem cztery ${it}!`,
    div: (it) => `Dzielić to rozdawać po równo. Mamy ${it}${it}${it}${it}, wkładamy po równo do dwóch koszyków — w każdym po dwa. Ile jest w jednym?`,
    mixed: 'Tutaj są różne działania. Patrz na znak: „plus” — zbieramy razem, „minus” — zabieramy. Licz uważnie!',
    fractions: 'Ułamki to równe kawałki. Wyobraź sobie pizzę 🍕: pokrojono ją na cztery kawałki i wzięto jeden — to jedna czwarta. Znajdź zamalowany kawałek!',
    other: 'Przygoda czeka! Liczymy razem!',
  },

  heaps,

  mental: {
    prompt: (a, b, op) => `Ile to jest ${a} ${OPS[op]} ${b}?`,
    hint: (a, b, op) => {
      if (op === '×') return `To ${heaps(a)}, w każdej po ${b}. Dotykaj kółeczek po jednym i licz wszystkie razem.`;
      if (op === '÷') return `Masz ${a} — rozłóż kółeczka po równo w ${b} rzędach. Policz, ile znajdzie się w jednym rzędzie.`;
      if (op === '-') return `Było ${a}. Zabierz ${b} — odkładaj po jednym kółeczku. Ile zostało?`;
      return `Licz kółeczka po jednym: najpierw ${a}, a potem dodaj jeszcze ${b}. Ile jest razem?`;
    },
  },

  balance: {
    prompt: 'Zrównoważ wagę! Który odważnik waży tyle samo?',
    reduce: (n, d, simpleN, simpleD) => `Skróć ułamek: podziel górę i dół przez tę samą liczbę. ${n} z ${d} to tyle samo, co ${simpleN} z ${simpleD}.`,
    add: (a, b) => `Policz wszystkie kropki razem: ${a} i jeszcze ${b}.`,
    sub: (a, b) => `Było ${a}, zabrano ${b}. Policz, ile kropek zostało.`,
    mul: (a, b) => `To ${heaps(a)} po ${b}. Policz wszystkie kropki.`,
  },

  fractions: {
    foods: ['pizzy', 'tortu', 'jabłka', 'arbuza', 'pomarańczy', 'ciasta', 'czekolady'],
    prompt: (food) => `Jaka część ${food} jest zamalowana?`,
    hint: (filled, denom) =>
      `Policzmy zamalowane kawałki: ${Array.from({ length: filled }, (_, i) => numberWords(i + 1)).join(', ')}. Wszystkich kawałków jest ${denom}. A więc to ${filled} z ${denom}!`,
  },

  fractionOps: {
    intro: {
      addSame:
        'Kiedy mianowniki są takie same, kawałki mają ten sam rozmiar. Wystarczy dodać górne liczby, a dolną zostawić bez zmian: jedna czwarta plus dwie czwarte to trzy czwarte.',
      subSame:
        'Odejmujemy tak samo: kawałki są jednakowe, więc od górnej liczby odejmujemy górną, a dolnej nie zmieniamy. Trzy czwarte minus jedna czwarta to dwie czwarte.',
      unlike:
        'Teraz mianowniki są różne — kawałki mają różne rozmiary. Najpierw je wyrównaj: znajdź wspólny mianownik, a potem dodawaj lub odejmuj górne liczby. Jedna druga to to samo, co dwie czwarte!',
      mul: 'Żeby pomnożyć ułamki, mnożymy górę przez górę i dół przez dół. Jedna druga z jednej trzeciej to jedna szósta.',
      div: 'Żeby podzielić przez ułamek, odwracamy drugi ułamek i mnożymy. Podzielić przez jedną drugą to to samo, co pomnożyć przez dwa.',
      mixed: 'Tutaj są wszystkie działania naraz. Patrz uważnie na znak i przypomnij sobie zasadę dla każdego działania!',
    },
    // «podzielić przez jedną drugą» — after «przez» a single part stands in the accusative.
    prompt: (a, op, b) => `Oblicz: ${fraction(a.n, a.d)} ${sign(op)} ${op === '÷' && b.n === 1 ? `jedną ${ordinalWords(b.d, 'f-acc')}` : fraction(b.n, b.d)}`,
  },

  compare: {
    plus: (a, b) => `${a} plus ${b}`,
    minus: (a, b) => `${a} minus ${b}`,
    times: (a, b) => `${a} razy ${b}`,
    units: [
      measure('m', ['metr', 'metry', 'metrów'], 'cm', 'centymetrów', 'Jeden metr to sto centymetrów.'),
      measure('kg', ['kilogram', 'kilogramy', 'kilogramów'], 'g', 'gramów', 'Jeden kilogram to tysiąc gramów.'),
      measure('godz.', ['godzina', 'godziny', 'godzin'], 'min', 'minut', 'Jedna godzina to sześćdziesiąt minut.'),
      measure('cm', ['centymetr', 'centymetry', 'centymetrów'], 'mm', 'milimetrów', 'Jeden centymetr to dziesięć milimetrów.'),
      measure('l', ['litr', 'litry', 'litrów'], 'ml', 'mililitrów', 'Jeden litr to tysiąc mililitrów.'),
    ],
    signs: { lt: 'mniejsze', eq: 'równe', gt: 'większe' },
    rule: 'Znak wygląda jak dziobek ptaszka: zawsze jest otwarty w stronę większej liczby.',
    verdict: (left, right, sign) => (sign === 'eq' ? `${left} równa się ${right}` : `${left} to ${sign === 'lt' ? 'mniej' : 'więcej'} niż ${right}`),
    prompt: (left, right) => `Porównaj: ${left} i ${right}. Jaki znak postawić między nimi?`,
    yes: (verdict) => `Tak! ${verdict[0].toLocaleUpperCase('pl')}${verdict.slice(1)}.`,
    hint: (rule, left, right) => `${rule} Policz, ile jest po lewej, a ile po prawej: po lewej ${left}, po prawej ${right}.`,
  },

  clock: {
    // The hour is an ordinal, feminine like «godzina»: «trzecia», «wpół do czwartej».
    say: ({ h, m }) => {
      const next = (h % 12) + 1;
      if (m === 0) return `godzina ${ordinalWords(h, 'f')}`;
      if (m === 30) return `wpół do ${ordinalWords(next, 'f-obl')}`;
      if (m === 15) return `kwadrans po ${ordinalWords(h, 'f-obl')}`;
      if (m === 45) return `za kwadrans ${ordinalWords(next, 'f')}`;
      return `${ordinalWords(h, 'f')} ${m < 10 ? 'zero ' : ''}${numberWords(m, 'f')}`;
    },
    intro: {
      hours: 'Zegar ma dwie wskazówki. Krótka pokazuje godziny. Kiedy długa wskazówka patrzy prosto w górę, na dwunastkę, jest równa godzina. Zobacz, na co pokazuje krótka!',
      half: 'Kiedy długa wskazówka patrzy w dół, na szóstkę, minęło pół godziny. Krótka wskazówka stoi wtedy między dwiema liczbami.',
      quarter: 'Długa wskazówka na trójce — minął kwadrans. A jeśli jest na dziewiątce, do nowej godziny został kwadrans.',
      minutes: 'Długa wskazówka pokazuje minuty. Każda liczba na zegarze to kolejne pięć minut: jeden — pięć, dwa — dziesięć, trzy — piętnaście.',
    },
    hint: ({ h, m }) => {
      const long = m === 0 ? 'patrzy w górę, na dwunastkę' : `pokazuje na ${m / 5}`;
      const short = m === 0 ? `pokazuje na ${h}` : `minęła już ${h}`;
      return `Krótka wskazówka ${short}, a długa ${long}. Krótka to godziny, długa — minuty.`;
    },
    yes: (time) => `Tak, to ${time}!`,
    find: (time) => `Znajdź zegar, który pokazuje: ${time}.`,
    read: 'Która godzina jest na zegarze?',
  },

  maze: {
    negatives: ' Teraz są tu też liczby ujemne — ze znakiem minus. Dzielą się tak samo: minus dwanaście dzieli się przez trzy, bo dwanaście dzieli się przez trzy.',
    deadEnds: ' Labirynt urósł i ma ślepe zaułki: jeśli dalej nie ma drogi, wróć i spróbuj inaczej.',
    table: (k) => `Biegnij po tabliczce mnożenia przez ${k}: ${k}, ${k * 2}, ${k * 3} i dalej`,
    divisible: (k) => `Biegnij tylko po liczbach, które dzielą się przez ${k}`,
    hint: (k, deadEnds, negative) =>
      `Szukaj sąsiedniej kratki z liczbą, która dzieli się przez ${k} bez reszty. Podświetlę następny krok.` +
      (deadEnds ? ' Jeśli trafisz w ślepy zaułek, wróć.' : '') +
      (negative ? ' Znak minus nie przeszkadza: patrz na samą liczbę.' : ''),
  },

  shop: {
    toys: ['miś', 'samochodzik', 'jojo', 'piłka', 'latawiec', 'zestaw farb', 'układanka', 'dinozaur', 'pociąg', 'piniata'],
    change: (toy, price, paid) => `${toy[0].toLocaleUpperCase('pl')}${toy.slice(1)} kosztuje ${price}. Dajesz ${paid}. Ile dostaniesz reszty?`,
    buy: (toy, price) => `Kup zabawkę: ${toy}. Cena to ${price}. Połóż pieniądze na kasie.`,
    changeHint: (paid, price) => `Od ${paid} odejmij ${price}. Możesz doliczać od ${price} do ${paid}.`,
    payHint: (price) => `Zacznij od największych pieniędzy, które nie przekraczają ${price}, a potem dokładaj mniejsze.`,
  },

  geometry: {
    figures: [
      ['lody', 'To lody: okrągła gałka i trójkątny rożek.'],
      ['grzyb', 'To grzyb: trójkątny kapelusz i kwadratowa nóżka.'],
      ['lizak', 'To lizak: okrągły smakołyk na patyku.'],
      ['domek', 'To domek: kwadratowe ściany i trójkątny dach.'],
      ['bałwan', 'To bałwan: trzy koła — małe, średnie i duże.'],
      ['cukierek', 'To cukierek: okrągły środek i dwa trójkątne ogonki.'],
      ['choinka', 'To choinka: dwa trójkąty i mały pień.'],
      ['rybka', 'To rybka: okrągłe ciało i trójkątny ogonek.'],
      ['stateczek', 'To stateczek: prostokątny kadłub i trójkątny żagiel.'],
      ['kotek', 'To kotek: okrągła głowa, trójkątne uszka i kwadratowe ciało.'],
      ['ciężarówka', 'To ciężarówka: długa naczepa, kwadratowa kabina i dwa koła.'],
      ['kwiatek', 'To kwiatek: trzy okrągłe płatki na łodydze.'],
      ['rakieta', 'To rakieta: ostry nos, dwa kwadraty i trójkątne skrzydła.'],
      ['pociąg', 'To pociąg: długi wagon, kabina i trzy koła.'],
      ['motyl', 'To motyl: okrągły tułów, główka i dwa trójkątne skrzydła.'],
      ['robot', 'To robot: kwadratowa głowa, tułów, dwie ręce i dwie nogi.'],
      ['zamek', 'To zamek: długi mur, trzy wieże i dwa spiczaste dachy.'],
      ['miś', 'To miś — cały jest z kół: głowa, uszka, tułów i łapki.'],
      ['kaczątko', 'To kaczątko: okrągłe ciało i głowa, dziobek, ogonek i łapki.'],
      ['autobus', 'To autobus: długie nadwozie, trzy koła i dwie walizki na dachu.'],
      ['ludzik', 'To ludzik: okrągła głowa, kwadratowy tułów, ręce i nogi.'],
      ['pałac', 'To pałac: mur, trzy wieże, dwa dachy i chorągiewka na górze.'],
      ['parowóz', 'To parowóz: wagon, kabina, trzy koła, komin i obłoczek dymu.'],
      ['dinozaur', 'To dinozaur: długie ciało, szyja, głowa, ogon, nogi i kolce na grzbiecie.'],
    ],
    build: (name) => `Ułóż z figur: ${name}`,
    buildHint: 'Znajdź kontur o takim samym kształcie i takiej samej wielkości.',
    count: (name, shape) => `Spójrz na obrazek: ${name}. Ile jest tu ${SHAPES[shape]}?`,
    countHint: (shape) => `Szukaj tylko ${SHAPES[shape]}. Dotykaj każdego palcem i licz na głos.`,
    areaRead: 'Jakie pole ma ta figura? Policz zamalowane kratki.',
    areaIs: (area) => `Tak! Pole figury to ${area}: właśnie tyle ma kratek.`,
    areaHint: 'Pole to liczba kratek, które zajmuje figura. Dotykaj każdej zamalowanej kratki i licz.',
    pens: ['owieczki', 'królika', 'kurczaków', 'prosiaczka', 'koźlątka', 'źrebaka'],
    // «o polu dwóch kratek» — the count stands in the genitive.
    pen: (animal, area) => `Zbuduj zagrodę dla ${animal} o polu ${area === 1 ? `${num(1, 'f', 'gen')} kratki` : `${num(area, 'f', 'gen')} kratek`}.`,
    penDone: (area) => `Świetna zagroda! Jej pole to ${counted(area, SQUARES, 'f')}.`,
    penHint: (area) => `Pole to liczba kratek. Zamaluj dokładnie ${counted(area, SQUARES, 'f')} obok siebie.`,
    perimeterRead: 'Jaki obwód ma ta figura? Obejdź ją po brzegu i policz boki kratek.',
    perimeterIs: (length) => `Tak! Obwód to ${length}: właśnie tyle boków kratek jest na brzegu figury.`,
    perimeterHint: 'Obwód to długość płotu wokół figury. Prowadź palcem po brzegu i licz każdy bok kratki.',
    longest: 'Znajdź figurę o największym obwodzie',
    longestIs: (length) => `Tak! Jej obwód to ${length}: właśnie tyle boków kratek trzeba obejść.`,
    longestHint: 'Obwód to długość płotu wokół figury. Obejdź palcem każdą figurę i policz boki kratek na brzegu.',
    intro: {
      figures: 'Ułóż obrazek z figur! Przeciągnij każdą figurę na kontur o takim samym kształcie. Policzymy też, z jakich figur składa się obrazek.',
      area: 'Pole to liczba kratek, które zajmuje figura. Policz zamalowane kratki albo zamaluj tyle, o ile prosimy.',
      perimeter: 'Obwód to długość płotu wokół figury. Obejdź figurę po brzegu i policz boki kratek.',
    },
  },

  money: (id) => {
    const m = MONEY[id];
    return { short: m.short, sum: (n) => counted(n, m.forms, m.gender), measure: measure(m.short, m.forms, m.small, m.smallMany, m.rule) };
  },
};
