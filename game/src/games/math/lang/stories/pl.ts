import type { CurrencyId } from '@/core/game/content/currency';
import { voiced } from '@/core/lang';
import { say } from '@/core/lang/marks';
import { MONEY } from '../pl';
import { filler, type Grammar, type Holes, type StoryItem } from './fill';
import type { Frame, StoryTold, StoryWords } from './types';

/**
 * «Задачі» in Polish. Every list keeps the order of the skins in
 * `generators/wordProblems.ts`; the holes of a line are explained in `fill.ts`.
 *
 * Polish counts in three ways — «1 jabłko», «3 jabłka», «5 jabłek» — and the
 * verb follows: «leżą 3 jabłka», but «leży 5 jabłek». So a line names both
 * verbs, `{a?leżą|leży}`, and the number picks. Men are counted in their own
 * way («jechało 3 pasażerów», «Ilu pasażerów?»): such a thing is `virile`.
 */

const it = (one: string, few: string, many: string): StoryItem => ({ forms: [one, few, many] });
/** A thing counted the way men are: always «pasażerów», and the verb never plural. */
const men = (one: string, many: string): StoryItem => ({ forms: [one, many, many], virile: true });
const I = {
  apple: it('jabłko', 'jabłka', 'jabłek'), pear: it('gruszka', 'gruszki', 'gruszek'), candy: it('cukierek', 'cukierki', 'cukierków'), pencil: it('ołówek', 'ołówki', 'ołówków'),
  marker: it('flamaster', 'flamastry', 'flamastrów'), book: it('książka', 'książki', 'książek'), ball: it('piłka', 'piłki', 'piłek'), balloon: it('balonik', 'baloniki', 'baloników'),
  sticker: it('naklejka', 'naklejki', 'naklejek'), nut: it('orzech', 'orzechy', 'orzechów'), car: it('autko', 'autka', 'autek'), auto: it('samochód', 'samochody', 'samochodów'),
  cube: it('klocek', 'klocki', 'klocków'), shell: it('muszelka', 'muszelki', 'muszelek'), bird: it('ptak', 'ptaki', 'ptaków'), duck: it('kaczka', 'kaczki', 'kaczek'),
  rabbit: it('królik', 'króliki', 'królików'), butterfly: it('motyl', 'motyle', 'motyli'), kitten: it('kotek', 'kotki', 'kotków'), bee: it('pszczoła', 'pszczoły', 'pszczół'),
  star: it('gwiazda', 'gwiazdy', 'gwiazd'), cake: it('ciastko', 'ciastka', 'ciastek'), page: it('strona', 'strony', 'stron'), fish: it('rybka', 'rybki', 'rybek'),
  bigFish: it('ryba', 'ryby', 'ryb'), flower: it('kwiat', 'kwiaty', 'kwiatów'), coin: it('moneta', 'monety', 'monet'), stamp: it('znaczek', 'znaczki', 'znaczków'),
  tomato: it('pomidor', 'pomidory', 'pomidorów'), cucumber: it('ogórek', 'ogórki', 'ogórków'), carrot: it('marchewka', 'marchewki', 'marchewek'), egg: it('jajko', 'jajka', 'jajek'),
  mushroom: it('grzyb', 'grzyby', 'grzybów'), tree: it('drzewo', 'drzewa', 'drzew'), appleTree: it('jabłoń', 'jabłonie', 'jabłoni'), pearTree: it('grusza', 'grusze', 'grusz'),
  bush: it('krzak', 'krzaki', 'krzaków'), cup: it('filiżanka', 'filiżanki', 'filiżanek'), plate: it('talerz', 'talerze', 'talerzy'), notebook: it('zeszyt', 'zeszyty', 'zeszytów'),
  bun: it('bułka', 'bułki', 'bułek'), pie: it('pierożek', 'pierożki', 'pierożków'), ticket: it('bilet', 'bilety', 'biletów'), postcard: it('pocztówka', 'pocztówki', 'pocztówek'),
  chair: it('krzesło', 'krzesła', 'krzeseł'), desk: it('ławka', 'ławki', 'ławek'), doll: it('lalka', 'lalki', 'lalek'), robot: it('robot', 'roboty', 'robotów'),
  puzzle: it('układanka', 'układanki', 'układanek'), bike: it('rower', 'rowery', 'rowerów'), card: it('karta', 'karty', 'kart'), photo: it('zdjęcie', 'zdjęcia', 'zdjęć'),
  goal: it('gol', 'gole', 'goli'), lap: it('okrążenie', 'okrążenia', 'okrążeń'), passenger: men('pasażer', 'pasażerów'), pupil: men('uczeń', 'uczniów'), visitor: men('gość', 'gości'),
  athlete: men('sportowiec', 'sportowców'), boy: men('chłopiec', 'chłopców'), girl: it('dziewczynka', 'dziewczynki', 'dziewczynek'), cow: it('krowa', 'krowy', 'krów'),
  horse: it('koń', 'konie', 'koni'), monkey: it('małpa', 'małpy', 'małp'), parrot: it('papuga', 'papugi', 'papug'), row: it('rząd', 'rzędy', 'rzędów'), line: it('szereg', 'szeregi', 'szeregów'),
  km: it('kilometr', 'kilometry', 'kilometrów'), hour: it('godzina', 'godziny', 'godzin'),
  // Those something is shared among.
  friend: men('przyjaciel', 'przyjaciół'), child: it('dziecko', 'dzieci', 'dzieci'), squirrel: it('wiewiórka', 'wiewiórki', 'wiewiórek'), sister: it('siostra', 'siostry', 'sióstr'),
  guest: men('gość', 'gości'), little: it('maluch', 'maluchy', 'maluchów'), cat: it('kot', 'koty', 'kotów'), player: men('gracz', 'graczy'),
};

/** 2, 3, 4 (but not 12, 13, 14): «3 jabłka», «23 jabłka». */
const few = (n: number) => n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14);
const count = (n: number, item: StoryItem) => `${n} ${item.forms[n === 1 ? 0 : !item.virile && few(n) ? 1 : 2]}`;
const grammar: Grammar = {
  count,
  plural: (n, item) => !item.virile && few(n),
  many: (item) => item.forms[2],
  howMany: (item) => (item.virile ? 'Ilu' : 'Ile'),
  cap: (text) => text.charAt(0).toLocaleUpperCase('pl') + text.slice(1),
  names: { boys: ['Wojtek', 'Andrzej', 'Tomek', 'Maks', 'Oskar', 'Norbert', 'Daniel', 'Marek'], girls: ['Ola', 'Zosia', 'Marysia', 'Zuzia', 'Sara', 'Daria', 'Hania', 'Lena'] },
  heroWords: { mu: ['mu', 'jej'] },
  // «jeszcze 2» of the stickers is «dwie», of the passengers — «dwóch»: the voice knows how to
  // say a number next to its thing, so it is asked for the pair and the thing is dropped.
  bare: (n, item) => {
    const thing = item.forms[n === 1 ? 0 : !item.virile && few(n) ? 1 : 2];
    const said = voiced(`${n} ${thing}`, 'pl');
    return thing && said.endsWith(` ${thing}`) ? say(n, said.slice(0, -thing.length - 1)) : String(n);
  },
};
const fill = filler(grammar);
const coinOf = (money: CurrencyId): StoryItem => ({ forms: MONEY[money].forms });
const price = (n: number, money: CurrencyId) => `${n} ${MONEY[money].short}`;

/**
 * «między 4 przyjaciół», «między 3 siostry», «między 4 dzieci»: those something is shared among
 * stand in the accusative, and the number is said in the way of its own — «czterech», «trzy», «czworo».
 */
const PLAIN = ['', 'jeden', 'dwa', 'trzy', 'cztery', 'pięć', 'sześć'];
const MEN = ['', 'jednego', 'dwóch', 'trzech', 'czterech', 'pięciu', 'sześciu'];
const TOGETHER = ['', 'jedno', 'dwoje', 'troje', 'czworo', 'pięcioro', 'sześcioro'];
function among(n: number, whom: StoryItem): string {
  const word = whom.virile ? MEN[n] : whom === I.child ? TOGETHER[n] : n === 2 && whom.forms[0].endsWith('a') ? 'dwie' : PLAIN[n];
  return `${word ? say(n, word) : n} ${whom.forms[!whom.virile && few(n) ? 1 : 2]}`;
}

/** A skin: its line (or the words that go into the frame's line), and the things it counts. */
type Skin = [line: string | Record<string, string>, t?: StoryItem, u?: StoryItem];
interface Told {
  /** The frame's own line, when its skins only hand over words. */
  line?: string;
  how: string | ((skin: number) => string);
  skins: Skin[];
}

const JOIN: [here: string, there: string, verbs: string, t: StoryItem][] = [
  ['Na stole', 'w koszyku', 'leżą|leży', I.car], ['Na półce', 'w szufladzie', 'stoją|stoi', I.book], ['W miseczce', 'na talerzu', 'leżą|leży', I.candy], ['Na gałęzi', 'na dachu', 'siedzą|siedzi', I.bird],
  ['W akwarium', 'w słoiku', 'pływają|pływa', I.fish], ['Na rabacie', 'w doniczce', 'rosną|rośnie', I.flower], ['W piórniku', 'na ławce', 'leżą|leży', I.pencil], ['W garażu', 'na podwórku', 'stoją|stoi', I.bike],
];

const THOUGHT: [did: string, undo: string][] = [
  ['{h?dodał|dodała} do niej {b}', 'odejmij {b}'],
  ['{h?odjął|odjęła} od niej {b}', 'dodaj {b}'],
  ['{h?pomnożył|pomnożyła} ją przez {b}', 'podziel przez {b}'],
  ['{h?podzielił|podzieliła} ją przez {b}', 'pomnóż przez {b}'],
  ['{h?dodał|dodała} do niej {b}, a potem jeszcze {c}', 'odejmij {c}, a potem jeszcze {b}'],
  ['{h?pomnożył|pomnożyła} ją przez {b} i {h?dodał|dodała} {c}', 'odejmij {c}, a potem podziel przez {b}'],
  ['{h?odjął|odjęła} od niej {b}, a potem {h?dodał|dodała} {c}', 'odejmij {c}, a potem dodaj {b}'],
  ['{h?podwoił|podwoiła} ją i {h?odjął|odjęła} {b}', 'dodaj {b}, a potem podziel przez dwa'],
];

const FRAMES: Record<Frame, Told> = {
  join: {
    line: '{here} {a?{verbs}} {A}, a {there} — jeszcze {b~}. {Ile} jest razem {many}?',
    how: 'Słowo „razem” podpowiada: trzeba złożyć obie kupki. Dodaj.',
    skins: JOIN.map(([here, there, verbs, t]): Skin => [{ here, there, verbs }, t]),
  },
  gotMore: {
    line: '{N} {h?miał|miała} {A}. {gave} {mu} jeszcze {b~}. {Ile} {many} ma teraz {N}?',
    how: 'Było {a}, a potem przybyło jeszcze {b}. Kiedy przybywa — dodajemy.',
    skins: [[{ gave: 'Mama dała' }, I.sticker], [{ gave: 'Tata kupił' }, I.balloon], [{ gave: 'Babcia podarowała' }, I.cube], [{ gave: 'Dziadek przyniósł' }, I.nut], [{ gave: 'Kolega podarował' }, I.stamp], [{ gave: 'Siostra oddała' }, I.doll], [{ gave: 'Brat przyniósł' }, I.robot], [{ gave: 'Ciocia przysłała' }, I.puzzle]],
  },
  cameIn: {
    line: '{where} {a?{was}} {A}. {b?{came}} jeszcze {b~}. {Ile} {many} jest teraz {now}?',
    how: '{Many} jest teraz więcej. Dodaj te, które były, i te, które przybyły.',
    skins: [
      [{ where: 'Na gałęzi', was: 'siedziały|siedziało', came: 'Przyleciały|Przyleciało', now: 'na gałęzi' }, I.bird],
      [{ where: 'Po stawie', was: 'pływały|pływało', came: 'Przypłynęły|Przypłynęło', now: 'na stawie' }, I.duck],
      [{ where: 'Na polanie', was: 'bawiły się|bawiło się', came: 'Przybiegły|Przybiegło', now: 'na polanie' }, I.rabbit],
      [{ where: 'Na kwiatku', was: 'siedziały|siedziało', came: 'Przyleciały|Przyleciało', now: 'na kwiatku' }, I.butterfly],
      [{ where: 'Na podwórku', was: 'bawiły się|bawiło się', came: 'Przybiegły|Przybiegło', now: 'na podwórku' }, I.kitten],
      [{ where: 'Przy ulu', was: 'latały|latało', came: 'Przyleciały|Przyleciało', now: 'przy ulu' }, I.bee],
      [{ where: 'Na parkingu', was: 'stały|stało', came: 'Przyjechały|Przyjechało', now: 'na parkingu' }, I.auto],
      [{ where: 'Na niebie', was: 'świeciły|świeciło', came: 'Zaświeciły|Zaświeciło', now: 'na niebie' }, I.star],
    ],
  },
  gave: {
    line: '{N} {h?miał|miała} {A}. {b~} z nich {h?{did}}{whom}. {Ile} {many} zostało?',
    how: 'Było {a}, a potem ubyło {b}. Kiedy ubywa — odejmujemy.',
    skins: [
      [{ did: 'oddał|oddała', whom: ' koledze' }, I.candy], [{ did: 'podarował|podarowała', whom: ' siostrze' }, I.sticker], [{ did: 'zjadł|zjadła', whom: '' }, I.apple], [{ did: 'zgubił|zgubiła', whom: '' }, I.cube],
      [{ did: 'rozdał|rozdała', whom: ' kolegom' }, I.balloon], [{ did: 'włożył|włożyła', whom: ' do szuflady' }, I.pencil], [{ did: 'posadził|posadziła', whom: ' na rabacie' }, I.flower], [{ did: 'oddał|oddała', whom: ' bratu' }, I.car],
    ],
  },
  wentAway: {
    line: '{where} {a?{was}} {A}. {b~} z nich {b?{gone}}. {Ile} {many} zostało {now}?',
    how: '{Many} jest teraz mniej. Od wszystkich odejmij te, których już nie ma.',
    skins: [
      [{ where: 'Na gałęzi', was: 'siedziały|siedziało', gone: 'odleciały|odleciało', now: 'na gałęzi' }, I.bird],
      [{ where: 'Na talerzu', was: 'leżały|leżało', gone: 'zjedzono|zjedzono', now: 'na talerzu' }, I.cake],
      [{ where: 'W koszyku', was: 'leżały|leżało', gone: 'zabrano|zabrano', now: 'w koszyku' }, I.mushroom],
      [{ where: 'Po stawie', was: 'pływały|pływało', gone: 'odpłynęły|odpłynęło', now: 'na stawie' }, I.duck],
      [{ where: 'Na parkingu', was: 'stały|stało', gone: 'odjechały|odjechało', now: 'na parkingu' }, I.auto],
      [{ where: 'Na półce', was: 'stały|stało', gone: 'zabrano do czytania|zabrano do czytania', now: 'na półce' }, I.book],
      [{ where: 'Po niebie', was: 'latały|latało', gone: 'pękły|pękło', now: 'na niebie' }, I.balloon],
      [{ where: 'Na stole', was: 'stały|stało', gone: 'zabrano do mycia|zabrano do mycia', now: 'na stole' }, I.cup],
    ],
  },
  // Here there are always five or more of the first kind, so the verb stands in one form.
  twoKinds: {
    how: 'Tu pytają o wszystkich razem. Dodaj obie liczby.',
    skins: [
      ['W klasie jest {A} i {Bu}. Ile dzieci jest w klasie?', I.boy, I.girl],
      ['W sadzie rośnie {A} i {Bu}. Ile drzew rośnie w sadzie?', I.appleTree, I.pearTree],
      ['Na farmie żyje {A} i {Bu}. Ile zwierząt żyje na farmie?', I.cow, I.horse],
      ['W misie leży {A} i {Bu}. Ile owoców leży w misie?', I.apple, I.pear],
      ['Na grządce dojrzało {A} i {Bu}. Ile warzyw dojrzało na grządce?', I.tomato, I.cucumber],
      ['W pudełku leży {A} i {Bu}. Ile zabawek leży w pudełku?', I.cube, I.ball],
      ['W wolierze żyje {A} i {Bu}. Ile zwierząt żyje w wolierze?', I.monkey, I.parrot],
      ['Na stole stoi {A} i {Bu}. Ile naczyń stoi na stole?', I.cup, I.plate],
    ],
  },
  left20: {
    how: 'Od wszystkich odejmij {b} — tyle już ubyło.',
    skins: [
      ['W autobusie jechało {A}. Na przystanku wysiadło {b~}. Ilu pasażerów zostało w autobusie?', I.passenger],
      ['Książka ma {A}. Przeczytano już {b~}. Ile stron zostało jeszcze do przeczytania?', I.page],
      ['W zestawie było {A}. Naklejono już {b~}. Ile naklejek zostało jeszcze w zestawie?', I.sticker],
      ['Na drzewie wisiało {A}. Wiatr strącił {b~}. Ile jabłek zostało na drzewie?', I.apple],
      ['W torebce było {A}. Dzieci zjadły {b~}. Ile cukierków zostało w torebce?', I.candy],
      ['W garażu stało {A}. Rano {b?wyjechały|wyjechało} {b~}. Ile samochodów zostało w garażu?', I.auto],
      ['W koszyku leżało {A}. Na śniadanie wzięto {b~}. Ile jajek zostało w koszyku?', I.egg],
      ['Na łące pasło się {A}. Do obory {b?poszły|poszło} {b~}. Ile krów zostało na łące?', I.cow],
    ],
  },
  // Eight to eighteen of the first: always «naklejek», never «naklejki».
  howManyMore: {
    how: 'Żeby dowiedzieć się, o ile jedna liczba jest większa od drugiej, od większej odejmij mniejszą.',
    skins: [
      ['Ola ma {A}, a Tomek — {b~}. O ile {many} więcej ma Ola?', I.sticker],
      ['Marek ma {A}, a Zosia — {b~}. O ile {many} więcej ma Marek?', I.car],
      ['W pierwszym koszyku jest {A}, a w drugim — {b~}. O ile {many} więcej jest w pierwszym koszyku?', I.mushroom],
      ['Na górnej półce jest {A}, a na dolnej — {b~}. O ile {many} więcej jest na górnej półce?', I.book],
      ['W czerwonym pudełku jest {A}, a w niebieskim — {b~}. O ile {many} więcej jest w czerwonym pudełku?', I.cube],
      ['Babcia ma {A}, a dziadek — {b~}. O ile {many} więcej ma babcia?', I.pie],
      ['W pierwszym akwarium jest {A}, a w drugim — {b~}. O ile {many} więcej jest w pierwszym akwarium?', I.fish],
      ['Na lewej rabacie jest {A}, a na prawej — {b~}. O ile {many} więcej jest na lewej rabacie?', I.flower],
    ],
  },
  howManyFewer: {
    how: 'Żeby dowiedzieć się, o ile jedna liczba jest mniejsza od drugiej, od większej odejmij mniejszą.',
    skins: [
      ['Daniel ma {A}, a Zuzia — {b~}. O ile {many} mniej ma Zuzia?', I.nut],
      ['Lena ma {A}, a Norbert — {b~}. O ile {many} mniej ma Norbert?', I.balloon],
      ['W dużej misce jest {A}, a w małej — {b~}. O ile {many} mniej jest w małej misce?', I.candy],
      ['Na pierwszym drzewie jest {A}, a na drugim — {b~}. O ile {many} mniej jest na drugim drzewie?', I.bird],
      ['W zielonym piórniku jest {A}, a w żółtym — {b~}. O ile {many} mniej jest w żółtym piórniku?', I.pencil],
      ['Mama ma {A}, a tata — {b~}. O ile {many} mniej ma tata?', I.mushroom],
      ['Na pierwszym talerzu jest {A}, a na drugim — {b~}. O ile {many} mniej jest na drugim talerzu?', I.cake],
      ['Starszy brat ma {A}, a młodszy — {b~}. O ile {many} mniej ma młodszy brat?', I.stamp],
    ],
  },
  missing: {
    how: 'Od tego, ile jest teraz, odejmij to, ile było: od {a+b} odejmij {a}.',
    skins: [
      ['W miseczce {a?były|było} {A}. Mama dołożyła jeszcze kilka i zrobiło się {a+b}. Ile {many} dołożyła mama?', I.candy],
      ['Na półce {a?stały|stało} {A}. Tata postawił jeszcze kilka i zrobiło się {a+b}. Ile {many} postawił tata?', I.book],
      ['W koszyku {a?leżały|leżało} {A}. Dziadek znalazł jeszcze kilka i zrobiło się {a+b}. Ile {many} znalazł dziadek?', I.mushroom],
      ['Na gałęzi {a?siedziały|siedziało} {A}. Przyleciało jeszcze kilka i zrobiło się {a+b}. Ile {many} przyleciało?', I.bird],
      ['W piórniku {a?były|było} {A}. Ola włożyła jeszcze kilka i zrobiło się {a+b}. Ile {many} włożyła Ola?', I.pencil],
      ['Na parkingu {a?stały|stało} {A}. Przyjechało jeszcze kilka i zrobiło się {a+b}. Ile {many} przyjechało?', I.auto],
      ['W skarbonce {a?były|było} {A}. Marek wrzucił jeszcze kilka i zrobiło się {a+b}. Ile {many} wrzucił Marek?', I.coin],
      ['W albumie {a?były|było} {A}. Siostra wkleiła jeszcze kilka i zrobiło się {a+b}. Ile {many} wkleiła siostra?', I.stamp],
    ],
  },
  totalPrice: {
    line: '{x} kosztuje {$a}, a {y} — {$b}. Ile {coins} kosztują razem {both}?',
    how: 'Żeby dowiedzieć się, ile kosztuje wszystko razem, dodaj ceny.',
    skins: [
      [{ x: 'Sok', y: 'bułka', both: 'sok i bułka' }], [{ x: 'Zeszyt', y: 'długopis', both: 'zeszyt i długopis' }],
      [{ x: 'Porcja lodów', y: 'woda', both: 'lody i woda' }], [{ x: 'Bilet do kina', y: 'popcorn', both: 'bilet i popcorn' }],
      [{ x: 'Lalka', y: 'piłka', both: 'lalka i piłka' }], [{ x: 'Chleb', y: 'mleko', both: 'chleb i mleko' }],
      [{ x: 'Ołówek', y: 'gumka', both: 'ołówek i gumka' }], [{ x: 'Jabłko', y: 'banan', both: 'jabłko i banan' }],
    ],
  },
  change: {
    line: '{N} kupuje {thing} za {$a} i daje sprzedawczyni {$b}. Ile {coins} reszty dostanie {N}?',
    how: 'Reszta to pieniądze, które zostały. Od {b} odejmij cenę zakupu.',
    skins: ['książkę', 'zabawkę', 'piłkę', 'album', 'lody', 'kwiaty', 'pocztówkę', 'farby'].map((thing): Skin => [{ thing }]),
  },
  notEnough: {
    line: '{N} ma {$a}. {thing} {$b}. Ile {coins} {mu} brakuje?',
    how: 'Od ceny odejmij pieniądze, które już są.',
    skins: ['Lody kosztują', 'Klocki kosztują', 'Książka kosztuje', 'Hulajnoga kosztuje', 'Lalka kosztuje', 'Bilet kosztuje', 'Piłka kosztuje', 'Układanka kosztuje'].map((thing): Skin => [{ thing }]),
  },
  repriced: {
    line: '{thing} {$a}, a potem {way} o {$b}. Ile {coins} kosztuje teraz?',
    how: (skin) => (skin % 2 ? '„Zdrożeć” znaczy, że cena wzrosła. Dodaj.' : '„Stanieć” znaczy, że cena spadła. Odejmij.'),
    skins: [
      [{ thing: 'Zabawka kosztowała', way: 'staniała' }], [{ thing: 'Bilet kosztował', way: 'zdrożał' }], [{ thing: 'Książka kosztowała', way: 'staniała' }], [{ thing: 'Sok kosztował', way: 'zdrożał' }],
      [{ thing: 'Tort kosztował', way: 'staniał' }], [{ thing: 'Lalka kosztowała', way: 'zdrożała' }], [{ thing: 'Piłka kosztowała', way: 'staniała' }], [{ thing: 'Porcja lodów kosztowała', way: 'zdrożała' }],
    ],
  },
  threeAdd: {
    how: 'Dodaj wszystkie trzy liczby po kolei: najpierw {a} i {b}, potem — jeszcze {c}.',
    skins: [
      ['W pierwszym koszyku {a?są|jest} {A}, w drugim — {b~}, a w trzecim — {c~}. Ile {many} jest w trzech koszykach razem?', I.apple],
      ['W poniedziałek Ola przeczytała {A}, we wtorek — {b~}, a w środę — {c~}. Ile {many} przeczytała przez trzy dni?', I.page],
      ['Na pierwszej półce {a?stoją|stoi} {A}, na drugiej — {b~}, a na trzeciej — {c~}. Ile {many} stoi na trzech półkach razem?', I.book],
      ['Rano sprzedano {A}, w południe — {b~}, a wieczorem — {c~}. Ile {many} sprzedano przez cały dzień?', I.bun],
      ['Pierwsza klasa posadziła {A}, druga — {b~}, a trzecia — {c~}. Ile {many} posadziły trzy klasy razem?', I.tree],
      ['W pierwszym wagonie jedzie {A}, w drugim — {b~}, a w trzecim — {c~}. Ilu {many} jedzie w trzech wagonach?', I.passenger],
      ['Marek strzelił {A}, Daniel — {b~}, a Oskar — {c~}. Ile {many} strzelili chłopcy razem?', I.goal],
      ['W czerwonym pudełku {a?są|jest} {A}, w niebieskim — {b~}, a w zielonym — {c~}. Ile {many} jest w trzech pudełkach razem?', I.cube],
    ],
  },
  groups: {
    how: 'To jednakowe kupki — po {a}. Jednakowe kupki mnożymy: {a} pomnóż przez {b}.',
    skins: [
      ['W każdym pudełku jest po {A}. Ile {many} jest w {b} pudełkach?', I.pencil],
      ['W każdym koszyku jest po {A}. Ile {many} jest w {b} koszykach?', I.apple],
      ['Na każdym talerzu jest po {A}. Ile {many} jest na {b} talerzach?', I.cake],
      ['W każdej torebce jest po {A}. Ile {many} jest w {b} torebkach?', I.candy],
      ['W każdym wazonie jest po {A}. Ile {many} jest w {b} wazonach?', I.flower],
      ['Na każdej półce jest po {A}. Ile {many} jest na {b} półkach?', I.book],
      ['W każdym gnieździe jest po {A}. Ile {many} jest w {b} gniazdach?', I.egg],
      ['W każdym wagonie jedzie po {A}. Ilu {many} jedzie w {b} wagonach?', I.passenger],
    ],
  },
  priceTimes: {
    line: '{one} kosztuje {$a}. Ile {coins} {b?kosztują|kosztuje} {B}?',
    how: 'Każda taka rzecz kosztuje tyle samo. Cenę pomnóż przez liczbę rzeczy: {a} pomnóż przez {b}.',
    skins: [
      [{ one: 'Jeden zeszyt' }, I.notebook], [{ one: 'Jedna bułka' }, I.bun], [{ one: 'Jeden bilet' }, I.ticket], [{ one: 'Jedna naklejka' }, I.sticker],
      [{ one: 'Jeden ołówek' }, I.pencil], [{ one: 'Jedno ciastko' }, I.cake], [{ one: 'Jedna pocztówka' }, I.postcard], [{ one: 'Jeden balonik' }, I.balloon],
    ],
  },
  // The rows are the first thing here (they are what «są» or «jest» answers to), what stands in them — the second.
  rows: {
    line: '{where} {a?są|jest} {A}, po {Bu} w każdym. {q} jest razem {umany}?',
    how: 'W każdym rzędzie jest tyle samo — po {b}. Pomnóż przez liczbę rzędów.',
    skins: [
      [{ where: 'W klasie', q: 'Ile' }, I.row, I.desk], [{ where: 'Na grządce', q: 'Ile' }, I.row, I.carrot], [{ where: 'W sali', q: 'Ile' }, I.row, I.chair], [{ where: 'W pudełku', q: 'Ile' }, I.row, I.candy],
      [{ where: 'W pochodzie', q: 'Ilu' }, I.line, I.athlete], [{ where: 'W sadzie', q: 'Ile' }, I.row, I.tree], [{ where: 'Na arkuszu', q: 'Ile' }, I.row, I.sticker], [{ where: 'Na parkingu', q: 'Ile' }, I.row, I.auto],
    ],
  },
  share: {
    line: '{A} podzielono po równo między {among}. {Ile} {many} {got}?',
    how: '„Po równo” znaczy: dzielimy. {a} podziel przez {b}.',
    skins: [
      [{ got: 'dostał każdy przyjaciel' }, I.candy, I.friend], [{ got: 'dostało każde dziecko' }, I.apple, I.child], [{ got: 'dostała każda wiewiórka' }, I.nut, I.squirrel], [{ got: 'dostała każda siostra' }, I.sticker, I.sister],
      [{ got: 'dostał każdy gość' }, I.cake, I.guest], [{ got: 'dostał każdy królik' }, I.carrot, I.rabbit], [{ got: 'dostał każdy maluch' }, I.balloon, I.little], [{ got: 'dostał każdy kot' }, I.fish, I.cat],
    ],
  },
  pack: {
    how: 'Rozłożyć po równo to znaczy podzielić. {a} podziel przez {b}.',
    skins: [
      ['{A} włożono po {b~} do każdego pudełka. Ile pudełek było potrzebnych?', I.pencil],
      ['{A} włożono po {b~} do każdej wytłaczanki. Ile wytłaczanek było potrzebnych?', I.egg],
      ['{A} włożono po {b~} do każdej torebki. Ile torebek było potrzebnych?', I.apple],
      ['{A} ustawiono po {b~} na każdej półce. Ile półek było potrzebnych?', I.book],
      ['{A} włożono po {b~} do każdego bukietu. Ile bukietów wyszło?', I.flower],
      ['{A} włożono po {b~} do każdego prezentu. Ile prezentów wyszło?', I.candy],
      ['{A} wklejono po {b~} na każdej stronie albumu. Ile stron zajęto?', I.photo],
      ['{A} położono po {b~} na każdym talerzu. Ile talerzy było potrzebnych?', I.bun],
    ],
  },
  timesPlus: {
    line: 'W {a} {boxes} jest po {B}, a jeszcze {c~} {loose}. {Ile} jest razem {many}?',
    how: 'Najpierw policz te, które leżą po równo: {b} pomnóż przez {a}. Potem dodaj jeszcze {c}.',
    skins: [
      [{ boxes: 'pudełkach', loose: '{c?leżą|leży} osobno' }, I.pencil], [{ boxes: 'koszykach', loose: '{c?leżą|leży} na stole' }, I.apple], [{ boxes: 'torebkach', loose: '{c?leżą|leży} w miseczce' }, I.candy],
      [{ boxes: 'albumach', loose: 'czeka na wklejenie' }, I.stamp], [{ boxes: 'wazonach', loose: '{c?stoją|stoi} osobno' }, I.flower], [{ boxes: 'skrzynkach', loose: '{c?leżą|leży} obok' }, I.tomato],
      [{ boxes: 'akwariach', loose: '{c?pływają|pływa} w słoiku' }, I.fish], [{ boxes: 'piórnikach', loose: '{c?leżą|leży} na ławce' }, I.marker],
    ],
  },
  timesChange: {
    line: '{N} {h?kupił|kupiła} {A} po {$b} i {h?dał|dała} sprzedawczyni {$c}. Ile {coins} reszty dostanie {N}?',
    how: 'Najpierw dowiedz się, ile kosztują zakupy: {b} pomnóż przez {a}. Potem odejmij to od {c}.',
    skins: [I.bun, I.notebook, I.sticker, I.pencil, I.balloon, I.ticket, I.postcard, I.cake].map((t): Skin => [{}, t]),
  },
  shareMinus: {
    line: '{A} podzielono po równo między {among}. {each} od razu {did} {c~}. {Ile} {many} zostało {whose}?',
    how: 'Najpierw podziel: {a} przez {b}. Potem odejmij {c}.',
    skins: [
      [{ each: 'Każde dziecko', did: 'zjadło', whose: 'każdemu dziecku' }, I.candy, I.child], [{ each: 'Każdy przyjaciel', did: 'zjadł', whose: 'każdemu przyjacielowi' }, I.apple, I.friend],
      [{ each: 'Każda siostra', did: 'nakleiła', whose: 'każdej siostrze' }, I.sticker, I.sister], [{ each: 'Każda wiewiórka', did: 'schowała', whose: 'każdej wiewiórce' }, I.nut, I.squirrel],
      [{ each: 'Każdy maluch', did: 'wypuścił w niebo', whose: 'każdemu maluchowi' }, I.balloon, I.little], [{ each: 'Każdy gość', did: 'zjadł', whose: 'każdemu gościowi' }, I.cake, I.guest],
      [{ each: 'Każdy królik', did: 'zjadł', whose: 'każdemu królikowi' }, I.carrot, I.rabbit], [{ each: 'Każdy gracz', did: 'położył na stole', whose: 'każdemu graczowi' }, I.card, I.player],
    ],
  },
  timesMore: {
    how: '„{b} razy więcej” to mnożenie: {a} pomnóż przez {b}.',
    skins: [
      ['Na pierwszej grządce {a?rosną|rośnie} {A}, a na drugiej — {b~} razy więcej. Ile {many} rośnie na drugiej grządce?', I.bush],
      ['Marek ma {A}, a Ola — {b~} razy więcej. Ile {many} ma Ola?', I.sticker],
      ['W małym akwarium {a?pływają|pływa} {A}, a w dużym — {b~} razy więcej. Ile {many} pływa w dużym akwarium?', I.fish],
      ['W pierwszej klasie jest {A}, a w drugiej — {b~} razy więcej. Ilu {many} jest w drugiej klasie?', I.pupil],
      ['Na dolnej półce {a?stoją|stoi} {A}, a na górnej — {b~} razy więcej. Ile {many} stoi na górnej półce?', I.book],
      ['W sobotę do muzeum przyszło {A}, a w niedzielę — {b~} razy więcej. Ilu {many} przyszło w niedzielę?', I.visitor],
      ['W pierwszym koszyku {a?leżą|leży} {A}, a w drugim — {b~} razy więcej. Ile {many} leży w drugim koszyku?', I.mushroom],
      ['Tata złowił {A}, a dziadek — {b~} razy więcej. Ile {many} złowił dziadek?', I.bigFish],
    ],
  },
  timesFewer: {
    how: '„{b} razy mniej” to dzielenie: {a} podziel przez {b}.',
    skins: [
      ['W dużym pudełku {a?są|jest} {A}, a w małym — {b~} razy mniej. Ile {many} jest w małym pudełku?', I.cube],
      ['Starszy brat ma {A}, a młodszy — {b~} razy mniej. Ile {many} ma młodszy brat?', I.car],
      ['Na pierwszym drzewie {a?wiszą|wisi} {A}, a na drugim — {b~} razy mniej. Ile {many} wisi na drugim drzewie?', I.apple],
      ['Na pierwszej półce {a?stoją|stoi} {A}, a na drugiej — {b~} razy mniej. Ile {many} stoi na drugiej półce?', I.book],
      ['Latem Zosia znalazła {A}, a jesienią — {b~} razy mniej. Ile {many} znalazła jesienią?', I.shell],
      ['W pierwszym bukiecie {a?są|jest} {A}, a w drugim — {b~} razy mniej. Ile {many} jest w drugim bukiecie?', I.flower],
      ['Rano piekarz upiekł {A}, a wieczorem — {b~} razy mniej. Ile {many} upiekł wieczorem?', I.bun],
      ['Po dużym stawie {a?pływają|pływa} {A}, a po małym — {b~} razy mniej. Ile {many} pływa po małym stawie?', I.duck],
    ],
  },
  moreTotal: {
    how: 'Najpierw dowiedz się, ile jest tam, gdzie jest więcej: do {a} dodaj {b}. Potem dodaj do siebie obie liczby.',
    skins: [
      ['Na pierwszej półce {a?stoją|stoi} {A}, a na drugiej — o {b~} więcej. Ile {many} stoi na dwóch półkach razem?', I.book],
      ['W pierwszym koszyku {a?leżą|leży} {A}, a w drugim — o {b~} więcej. Ile {many} leży w dwóch koszykach razem?', I.apple],
      ['Tomek ma {A}, a Lena — o {b~} więcej. Ile {many} mają razem?', I.sticker],
      ['W pierwszym wagonie jedzie {A}, a w drugim — o {b~} więcej. Ilu {many} jedzie w dwóch wagonach razem?', I.passenger],
      ['Rano sprzedano {A}, a wieczorem — o {b~} więcej. Ile {many} sprzedano przez cały dzień?', I.ticket],
      ['W pierwszej klasie jest {A}, a w drugiej — o {b~} więcej. Ilu {many} jest w dwóch klasach razem?', I.pupil],
      ['Na pierwszej rabacie {a?rosną|rośnie} {A}, a na drugiej — o {b~} więcej. Ile {many} rośnie na dwóch rabatach razem?', I.flower],
      ['W sobotę Daniel przebiegł {A}, a w niedzielę — o {b~} więcej. Ile {many} przebiegł przez dwa dni?', I.lap],
    ],
  },
  timed: {
    how: 'Do godziny początku dodaj tyle, ile minęło: {a} i jeszcze {b}.',
    skins: [
      'Pociąg wyjechał o {a}:00 i jechał {B}. O której godzinie przyjechał?',
      'Przedstawienie zaczęło się o {a}:00 i trwało {B}. O której godzinie się skończyło?',
      'Wycieczka zaczęła się o {a}:00 i trwała {B}. O której godzinie się skończyła?',
      'Samolot wystartował o {a}:00 i leciał {B}. O której godzinie wylądował?',
      'Zawody zaczęły się o {a}:00 i trwały {B}. O której godzinie się skończyły?',
      'Tata poszedł do pracy o {a}:00 i pracował {B}. O której godzinie skończył pracę?',
      'Wędrowcy wyruszyli na wyprawę o {a}:00 i szli {B}. O której godzinie doszli do obozu?',
      'Statek wypłynął o {a}:00 i płynął {B}. O której godzinie dopłynął do portu?',
    ].map((line): Skin => [line, I.hour]),
  },
  speed: {
    line: 'W ciągu jednej godziny {mover} {A}. Ile kilometrów {will} przez {Bu}?',
    how: 'W każdej godzinie tyle samo — po {a} km. Pomnóż przez liczbę godzin: przez {b}.',
    skins: [
      ['rowerzysta przejeżdża', 'przejedzie'], ['turysta przechodzi', 'przejdzie'], ['łódka przepływa', 'przepłynie'], ['pociąg przejeżdża', 'przejedzie'],
      ['autobus przejeżdża', 'przejedzie'], ['jeździec przejeżdża', 'przejedzie'], ['narciarz przebiega', 'przebiegnie'], ['statek przepływa', 'przepłynie'],
    ].map(([mover, will]): Skin => [{ mover, will }, I.km, I.hour]),
  },
  thought: {
    line: '{N} {h?pomyślał|pomyślała} liczbę, {did} — i {h?otrzymał|otrzymała} {a}. Jaką liczbę {h?pomyślał|pomyślała} {N}?',
    how: 'Idź od końca do początku: weź {a} i {undo}.',
    skins: THOUGHT.map(([did, undo]): Skin => [{ did, undo }]),
  },
  twoBuys: {
    line: '{N} {h?kupił|kupiła} {A} po {$b} i {other} za {$c}. Ile {coins} {h?zapłacił|zapłaciła} {N}?',
    how: 'Najpierw policz jednakowe zakupy: {b} pomnóż przez {a}. Potem dodaj jeszcze {c}.',
    skins: [
      [{ other: 'zeszyt' }, I.pencil], [{ other: 'sok' }, I.bun], [{ other: 'album' }, I.sticker], [{ other: 'tort' }, I.balloon], [{ other: 'popcorn' }, I.ticket],
      [{ other: 'kopertę' }, I.postcard], [{ other: 'piórnik' }, I.notebook], [{ other: 'herbatę' }, I.cake], [{ other: 'czekoladę' }, I.candy],
    ],
  },
  halves: {
    how: 'Połowa — to podzielić przez dwa: zostało {a}. Potem odejmij jeszcze {b}.',
    skins: [
      ['Ola miała {T}. Połowę podarowała koleżance, a potem jeszcze {b~} oddała bratu. Ile {many} zostało?', I.candy],
      ['Na półce {t?stały|stało} {T}. Połowę zabrano do czytania, a potem jeszcze {b~} oddano do biblioteki. Ile {many} zostało?', I.book],
      ['W koszyku {t?były|było} {T}. Połowę zjedzono na obiad, a potem jeszcze {b~} na kolację. Ile {many} zostało?', I.pie],
      ['W paczce {t?były|było} {T}. Połowę naklejono w albumie, a potem jeszcze {b~} podarowano. Ile {many} zostało?', I.sticker],
      ['Na drzewie {t?wisiały|wisiało} {T}. Połowę zerwano rano, a potem jeszcze {b~} wieczorem. Ile {many} zostało?', I.apple],
      ['W sklepie {t?były|było} {T}. Połowę sprzedano przed południem, a potem jeszcze {b~} po południu. Ile {many} zostało?', I.balloon],
      ['W skarbonce {t?były|było} {T}. Połowę wydano na książkę, a potem jeszcze {b~} na lody. Ile {many} zostało?', I.coin],
      ['Na grządce {t?rosły|rosło} {T}. Połowę zebrano w sobotę, a potem jeszcze {b~} w niedzielę. Ile {many} zostało?', I.tomato],
      ['Na tacy {t?były|było} {T}. Połowę rozdano gościom, a potem jeszcze {b~} zjadły dzieci. Ile {many} zostało?', I.cake],
    ],
  },
};

function tell(frame: Frame, skin: number, n: number[], hero: Holes['hero'], money: CurrencyId): StoryTold {
  const told = FRAMES[frame];
  const [words, t, u] = told.skins[skin];
  const holes: Holes = { n, t, u, hero, coin: coinOf(money), extra: { ...(typeof words === 'string' ? {} : words), umany: u ? grammar.many(u) : '', among: u ? among(n[1], u) : '' } };
  return { text: fill(typeof words === 'string' ? words : told.line ?? '', holes), how: fill(typeof told.how === 'string' ? told.how : told.how(skin), holes) };
}

export const pl: StoryWords = {
  tell,
  chips: {
    join: (skin) => [JOIN[skin][0].toLocaleLowerCase('pl'), JOIN[skin][1]],
    howManyMore: 'o ile więcej',
    howManyFewer: 'o ile mniej',
    change: 'reszta',
    lack: 'brakuje',
    half: 'połowa',
    when: 'o której',
    price,
    eachPrice: (n, money) => `po ${price(n, money)}`,
    by: (n) => `o ${n}`,
    each: (n) => `po ${n}`,
    extra: (n) => `jeszcze ${n}`,
    timesMore: (n) => `${n} razy więcej`,
    timesFewer: (n) => `${n} razy mniej`,
    moreBy: (n) => `o ${n} więcej`,
    at: (hour) => `o ${hour}:00`,
    hours: (n) => count(n, I.hour),
    speed: (km) => `${km} km na godzinę`,
  },
};
