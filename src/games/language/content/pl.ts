import { ASSOC_PL } from './assoc';
import type { LangPack, Sentence, Word } from '../tasks';

/**
 * The Polish pack: the same five games as the Ukrainian one, on Polish
 * letters and words. Like Ukrainian, Polish is read the way it is written, so
 * the first words are put together from syllables and the hardest are spelled
 * by ear.
 */

/** Words by syllables, shortest first: `sy-la-by|emoji`. */
const SYLLABLES = `
ma-ma|👩 ta-ta|👨 ko-za|🐐 ry-ba|🐟 so-wa|🦉 lo-dy|🍦 wo-da|💧 no-ga|🦵 rę-ka|✋ o-ko|👁️
u-cho|👂 zu-pa|🥣 mle-ko|🥛 ma-sło|🧈 buł-ka|🥯 jaj-ko|🥚 ba-nan|🍌 jabł-ko|🍎 grusz-ka|🍐 wi-śnia|🍒
ro-wer|🚲 po-ciąg|🚆 łód-ka|⛵ do-mek|🏠 ok-no|🪟 krze-sło|🪑 łóż-ko|🛏️ lam-pa|💡 ze-gar|⏰ książ-ka|📖
pił-ka|⚽ lal-ka|🪆 ba-lon|🎈 pre-zent|🎁 bu-ty|👟 czap-ka|🧢 sza-lik|🧣 kwia-tek|🌸 drze-wo|🌳 tra-wa|🌿
słoń-ce|☀️ księ-życ|🌙 gwiaz-da|⭐ chmu-ra|☁️ tę-cza|🌈 mo-rze|🌊 gó-ra|⛰️ rze-ka|🏞️ wy-spa|🏝️ kro-wa|🐄
świn-ka|🐷 ku-ra|🐔 kacz-ka|🦆 ko-gut|🐓 ow-ca|🐑 pie-sek|🐶 ko-tek|🐱 mysz-ka|🐭 żab-ka|🐸 je-leń|🦌
li-sek|🦊 za-jąc|🐇 mo-tyl|🦋 pszczo-ła|🐝 mrów-ka|🐜 pa-jąk|🕷️ śli-mak|🐌 mał-pa|🐒 ty-grys|🐯 ze-bra|🦓
pan-da|🐼 pin-gwin|🐧 del-fin|🐬 re-kin|🦈 ro-bot|🤖 piz-za|🍕 cias-tko|🍪 gło-wa|🙂 ser-ce|❤️ klu-cze|🔑
mi-ska|🥣 ku-bek|☕ łyż-ka|🥄 ta-lerz|🍽️ my-dło|🧼 za-mek|🏰 wie-ża|🗼 na-miot|⛺ ma-pa|🗺️ fla-ga|🚩
ko-ro-na|👑 pa-ra-sol|☂️ cy-try-na|🍋 po-mi-dor|🍅 o-gó-rek|🥒 ce-bu-la|🧅 ka-pu-sta|🥬 ma-li-na|🍓 ja-go-da|🫐 mar-chew-ka|🥕
sa-mo-chód|🚗 sa-mo-lot|✈️ ra-kie-ta|🚀 au-to-bus|🚌 su-kien-ka|👗 ko-szu-la|👕 ży-ra-fa|🦒 pa-pu-ga|🦜 kro-ko-dyl|🐊 wie-wiór-ka|🐿️
bie-dron-ka|🐞 cze-ko-la-da|🍫 cu-kie-rek|🍬 her-ba-ta|🍵 gi-ta-ra|🎸 te-le-fon|📱 kom-pu-ter|💻 ka-pe-lusz|🎩 mo-ne-ta|🪙 la-tar-ka|🔦
`;

/** Words to spell letter by letter, shortest first: `word|emoji`, then words without a picture. */
const SPELL = `
kot|🐱 dom|🏠 las|🌲 nos|👃 ser|🧀 sok|🧃 lew|🦁 lis|🦊 miś|🧸 rak|🦞
mak|🌺 but|👟 nóż|🔪 ząb|🦷 sól|🧂 ryż|🍚 koń|🐴 pies|🐶 mysz|🐭 słoń|🐘
wilk|🐺 ptak|🐦 krab|🦀 róża|🌹 liść|🍃 miód|🍯 tort|🎂 auto|🚗 król|🤴 most|🌉
żaba|🐸 kura|🐔 sowa|🦉 ryba|🐟 koza|🐐 mapa|🗺️ noga|🦵 ręka|✋ ucho|👂 okno|🪟
kwiat|🌸 grzyb|🍄 chleb|🍞 mleko|🥛 jajko|🥚 woda|💧 lampa|💡 klucz|🔑 zegar|⏰ piłka|⚽
lalka|🪆 balon|🎈 rower|🚲 łódka|⛵ śnieg|❄️ wiatr|🌬️ ogień|🔥 morze|🌊 rzeka|🏞️ serce|❤️
robot|🤖 dzwon|🔔 bęben|🥁 flaga|🚩 kubek|☕ łyżka|🥄 mydło|🧼 drzwi|🚪 zamek|🏰 wieża|🗼
banan|🍌 arbuz|🍉 dynia|🎃 pizza|🍕 lody|🍦 zupa|🥣 mama|👩 tata|👨 góra|⛰️ buty|👟
drzewo|🌳 słońce|☀️ chmura|☁️ deszcz|🌧️ statek|🚢 pociąg|🚆 czapka|🧢 jabłko|🍎 wiśnia|🍒 orzech|🌰
gitara|🎸 korona|👑 moneta|🪙 namiot|⛺ talerz|🍽️ ołówek|✏️ ogórek|🥒 cebula|🧅 ciasto|🍰 łóżko|🛏️
gwiazda|⭐ rakieta|🚀 książka|📖 prezent|🎁 gruszka|🍐 cytryna|🍋 marchew|🥕 pomidor|🍅 widelec|🍴 cukierek|🍬
bok cel cud dym gol hak kij koc kos lot los mur noc pas pan raj rok sen sad tor
wóz żal bal bas bat byk gaj gra łan łza nić ryś żuk pół wół dół ból mól lód puch
cień czas dach dzień głos groch kasa kino klej koło kosz kran kret krok kula kurz lato lina list ława
mgła mina młot mowa nuta olej owoc pani park piec pień plac pole próg rada rama rosa rura sala siła
skok smak smok staw szal targ tłum waga włos zima złoto obraz pióro plama praca sanki siano skała słowo sosna
stopa stróż szafa sznur szyba taca tunel ulica wanna wazon worek wyspa zboże gniazdo miska płaszcz szkoła trawa traktor wioska
wiosna żagiel jesień ogród poranek wieczór niedziela piątek sobota zeszyt plecak tablica kreda ławka lekcja przerwa boisko zabawa kolega rodzina
`;

/** Rhyming families — every family ends in its own way, so a pair can be found by ear alone. */
const RHYMES = `
kot|🐱 płot lot młot
dom|🏠 tom grom złom
las|🌲 pas czas bas
nos|👃 los kos głos
mak|🌺 rak|🦞 ptak|🐦 znak
kura|🐔 góra|⛰️ chmura|☁️ dziura
mama|👩 rama brama dama
rosa|💧 kosa osa
fala|🌊 sala lala|🪆 gala
noc|🌃 koc moc
sen|😴 len tlen ten
woda|💧 moda jagoda|🫐 zgoda
lody|🍦 schody brody wody
żaba|🐸 baba|👵
sowa|🦉 krowa|🐄 głowa mowa
rzeka|🏞️ apteka biblioteka opieka
noga|🦵 droga|🛣️ stonoga podłoga
oko|👁️ wysoko głęboko szeroko
ucho|👂 sucho głucho
kwiatek|🌸 płatek dodatek
kotek|🐱 młotek|🔨 płotek
wół|🐂 stół dół pół
dzień|☀️ cień pień leń
szal|🧣 bal żal
król|🤴 sól|🧂 ból mól
lato|🏖️ tato
burza|🌩️ róża|🌹 kałuża duża
bułka|🥯 półka jaskółka spółka
kaczka|🦆 paczka|📦 taczka
myszka|🐭 szyszka
świnka|🐷 dziewczynka|👧 choinka|🎄 malinka
kubek|☕ dzióbek czubek
lew|🦁 krzew śpiew gniew
gruszka|🍐 muszka poduszka pietruszka
smok|🐉 sok|🧃 krok skok
żuk|🪲 łuk|🏹 stuk kruk
śnieg|❄️ brzeg bieg
morze|🌊 zboże
tort|🎂 port sport kort
dach|🏠 strach piach zamach
piłka|⚽ pomyłka
palec|👆 walec
`;

const cells = (raw: string) => raw.trim().split(/\s+/);
const lines = (raw: string) => raw.trim().split('\n');

const words = (raw: string): Word[] => {
  const seen = new Set<string>();
  return cells(raw)
    .map((cell): Word => [cell.split('|')[0], cell.split('|')[1] ?? ''])
    .filter((w) => !seen.has(w[0]) && seen.add(w[0]));
};

const PART_WORDS = words(SYLLABLES).map(([word, emoji]) => ({ parts: word.split('-'), emoji }));
/** The words to spell must not repeat the ones put together from syllables. */
/** A board holds six bubbles, so a word to spell has six letters at most. */
const SPELL_WORDS = words(SPELL).filter(([word]) => word.length <= 6 && !PART_WORDS.some(({ parts }) => parts.join('') === word));

// ---- Sentences: built from parts so every combination is a correct one. ----

/** «Psy szczekają.» — a plural doer and what it does; any verb fits its own doer only. */
const DOERS: [who: string, emoji: string, does: string[]][] = [
  ['Psy', '🐶', ['szczekają', 'biegają', 'śpią', 'jedzą', 'skaczą']],
  ['Koty', '🐱', ['śpią', 'mruczą', 'skaczą', 'jedzą', 'biegają']],
  ['Ptaki', '🐦', ['latają', 'śpiewają', 'jedzą', 'śpią', 'skaczą']],
  ['Ryby', '🐟', ['pływają', 'jedzą', 'śpią', 'skaczą', 'czekają']],
  ['Żaby', '🐸', ['skaczą', 'pływają', 'kumkają', 'jedzą', 'śpią']],
  ['Niedźwiedzie', '🐻', ['śpią', 'jedzą', 'chodzą', 'ryczą', 'biegają']],
  ['Pszczoły', '🐝', ['latają', 'bzyczą', 'pracują', 'tańczą', 'śpią']],
  ['Dzieci', '🧒', ['biegają', 'skaczą', 'śpiewają', 'rysują', 'czytają']],
  ['Konie', '🐴', ['biegają', 'skaczą', 'jedzą', 'śpią', 'rżą']],
  ['Kaczki', '🦆', ['pływają', 'kwaczą', 'latają', 'jedzą', 'chodzą']],
  ['Lwy', '🦁', ['ryczą', 'biegają', 'śpią', 'jedzą', 'polują']],
  ['Małpy', '🐒', ['skaczą', 'jedzą', 'biegają', 'krzyczą', 'śpią']],
  ['Zające', '🐰', ['skaczą', 'biegają', 'jedzą', 'śpią', 'uciekają']],
  ['Krowy', '🐄', ['muczą', 'jedzą', 'chodzą', 'śpią', 'stoją']],
  ['Sowy', '🦉', ['latają', 'hukają', 'polują', 'patrzą', 'śpią']],
  ['Wilki', '🐺', ['wyją', 'biegają', 'polują', 'śpią', 'jedzą']],
  ['Myszy', '🐭', ['piszczą', 'biegają', 'jedzą', 'śpią', 'uciekają']],
  ['Kury', '🐔', ['gdaczą', 'dziobią', 'chodzą', 'jedzą', 'śpią']],
  ['Mrówki', '🐜', ['pracują', 'chodzą', 'kopią', 'noszą', 'biegają']],
  ['Samoloty', '✈️', ['latają', 'lądują', 'startują', 'czekają', 'stoją']],
];

/** «Mama czyta książkę.» — the present tense does not care who is a he and who is a she. */
const PEOPLE = ['Mama', 'Tata', 'Babcia', 'Dziadek', 'Ola', 'Jan', 'Kasia', 'Tomek', 'Zosia', 'Adam', 'Ania', 'Piotr', 'Ewa', 'Kuba', 'Maja'];
const ACTIONS: [phrase: string, emoji: string][] = [
  ['czyta książkę', '📖'],
  ['je jabłko', '🍎'],
  ['pije sok', '🧃'],
  ['rysuje kwiaty', '🌸'],
  ['piecze ciasto', '🎂'],
  ['lubi pizzę', '🍕'],
  ['kupuje chleb', '🍞'],
  ['myje naczynia', '🍽️'],
  ['gotuje zupę', '🍲'],
  ['karmi kota', '🐱'],
  ['naprawia rower', '🚲'],
  ['nosi kapelusz', '🎩'],
  ['kocha muzykę', '🎵'],
  ['maluje obraz', '🖼️'],
  ['podlewa kwiaty', '🌷'],
  ['prowadzi auto', '🚗'],
  ['buduje dom', '🏠'],
  ['łowi ryby', '🐟'],
  ['otwiera drzwi', '🚪'],
  ['śpiewa piosenkę', '🎶'],
  ['ma psa', '🐶'],
  ['widzi gwiazdy', '⭐'],
  ['pije mleko', '🥛'],
  ['szuka kluczy', '🔑'],
  ['je ciasto', '🍰'],
  ['pije herbatę', '🍵'],
  ['czyta mapę', '🗺️'],
  ['lubi lody', '🍦'],
  ['kopie piłkę', '⚽'],
  ['sadzi drzewo', '🌳'],
];

/** «Mały piesek biegnie przez łąkę.» — the adjective already answers to its noun. */
const HEROES: [who: string, emoji: string][] = [
  ['Mały piesek', '🐶'],
  ['Wielki niedźwiedź', '🐻'],
  ['Wesoła małpka', '🐒'],
  ['Mała myszka', '🐭'],
  ['Wesoła dziewczynka', '👧'],
  ['Dobry chłopiec', '👦'],
  ['Biały kotek', '🐱'],
  ['Zielona żabka', '🐸'],
  ['Stary koń', '🐴'],
  ['Żółty ptaszek', '🐤'],
  ['Rudy lis', '🦊'],
  ['Szary wilk', '🐺'],
  ['Różowa świnka', '🐷'],
  ['Wysoka żyrafa', '🦒'],
  ['Szybki zając', '🐰'],
  ['Czarna owca', '🐑'],
  ['Młody lew', '🦁'],
  ['Mała kaczka', '🦆'],
  ['Śpiący koala', '🐨'],
  ['Mądra sowa', '🦉'],
];
const ENDINGS = [
  'biegnie szybko', 'śpi smacznie', 'je powoli', 'skacze wysoko', 'idzie do domu', 'wraca do domu', 'stoi spokojnie', 'czeka na mamę', 'patrzy w niebo',
  'śpi pod drzewem', 'biegnie przez łąkę', 'szuka jedzenia', 'pije zimną wodę', 'lubi ciepłe słońce', 'idzie na spacer', 'siedzi bardzo cicho', 'budzi się rano',
  'je smaczny obiad', 'pływa w rzece', 'chowa się w trawie', 'idzie do lasu', 'czeka na deszcz', 'patrzy na gwiazdy', 'bawi się piłką', 'odpoczywa w cieniu',
];

const TWO: Sentence[] = DOERS[0][2].flatMap((_, i) => DOERS.map(([who, emoji, does]): Sentence => [`${who} ${does[i]}.`, emoji]));
const THREE: Sentence[] = ACTIONS.flatMap(([phrase, emoji], i) => PEOPLE.map((_, j): Sentence => [`${PEOPLE[(i + j) % PEOPLE.length]} ${phrase}.`, emoji]));
const LONG: Sentence[] = ENDINGS.flatMap((ending, i) => HEROES.map((_, j): Sentence => {
  const [who, emoji] = HEROES[(i + j) % HEROES.length];
  return [`${who} ${ending}.`, emoji];
}));

export const PL: LangPack = {
  lang: 'pl',
  name: 'Польська мова',
  flag: '🇵🇱',
  prefix: 'pl_',
  syllables: true,
  byEar: true,
  alphabet: [...'aąbcćdeęfghijklłmnńoóprsśtuwyzźż'],
  partWords: PART_WORDS,
  spellWords: SPELL_WORDS,
  halves: PART_WORDS.map(({ parts, emoji }) => [parts[0], parts.slice(1).join(''), emoji]),
  assoc: ASSOC_PL,
  rhymes: lines(RHYMES).map(cells),
  sentences: { two: TWO, three: THREE, long: LONG },
  // The cards as a Ukrainian-speaking child sees them; English and Polish are in `lang/`.
  cards: {
    alphabet: {
      label: 'Alfabet',
      icon: '🔠',
      blurb: 'Польська: постав літери на свої місця в абетці',
      intro: 'Вчимо польську абетку! Літери в ній стоять одна за одною, завжди в тому самому порядку. Кілька літер загубилося — перетягни кожну на її місце.',
      difficulty: [1, 2],
    },
    bubbles: {
      label: 'Bańki mydlane',
      icon: '🫧',
      blurb: 'Польська: лопай бульбашки — абетка, склади і слова',
      intro: 'Вчимо польську! У бульбашках — польські літери. Лопай їх по порядку, як у польській абетці. Натисни на динамік, щоб почути літеру.',
      difficulty: [1, 2],
    },
    chain: {
      label: 'Łańcuszek słów',
      icon: '🔗',
      blurb: 'Польська: з’єднуй слова з літерами та між собою',
      intro: 'Вчимо польські слова! З’єднай кожне слово з літерою, на яку воно починається. Натисни на динамік, щоб почути слово.',
      difficulty: [1, 3],
    },
    rhymes: {
      label: 'Szukamy rymów',
      icon: '🎶',
      blurb: 'Польська: знаходь слова, що римуються',
      intro: 'У польській мові теж є рими — слова, які звучать схоже наприкінці. Натискай на динаміки, слухай слова і з’єднуй ті, що римуються.',
      difficulty: [2, 3],
    },
    sentences: {
      label: 'Budujemy zdania',
      icon: '🧱',
      blurb: 'Польська: склади речення зі слів',
      intro: 'Складаємо речення польською! Постав слова по порядку. Перше слово пишеться з великої літери, а в кінці стоїть крапка.',
      difficulty: [2, 3],
    },
  },
};
