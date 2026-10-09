import { ordinalWords } from '@/core/lang/pl';
import type { SeasonId } from '../content/data';
import type { NatureTexts } from './types';

/** The Nature galaxy in Polish. */

/** A season: its name, «od zimy», the months' adjective («zimowe miesiące»), the answer to a wrong bin, ten facts. */
const SEASONS: Record<SeasonId, { name: string; from: string; of: string; no: string; facts: string[] }> = {
  winter: {
    name: 'Zima',
    from: 'zimy',
    of: 'zimowe',
    no: 'Brr, zimą tak się nie zdarza!',
    facts: [
      'Zima to grudzień, styczeń i luty.',
      'Zimą dni są najkrótsze, a noce najdłuższe.',
      'Każdy płatek śniegu ma sześć ramion i nie ma dwóch takich samych.',
      'Śnieg to kołdra dla ziemi: roślinom jest pod nim cieplej.',
      'Zimą drzewa nie są martwe — śpią i czekają na wiosnę.',
      'Jeż, niedźwiedź i borsuk przesypiają zimę, a zając zmienia szare futerko na białe.',
      'Zimą ptakom trudno znaleźć jedzenie, dlatego ludzie robią dla nich karmniki.',
      'Lód jest lżejszy od wody, więc pływa po wierzchu, a ryby zimują pod nim.',
      'Zimą słońce wznosi się nisko nad horyzontem — dlatego słabo grzeje.',
      'Najkrótszy dzień w roku wypada w grudniu. Potem dni powoli się wydłużają.',
    ],
  },
  spring: {
    name: 'Wiosna',
    from: 'wiosny',
    of: 'wiosenne',
    no: 'Nie, wiosną przyroda dopiero się budzi.',
    facts: [
      'Wiosna to marzec, kwiecień i maj.',
      'Wiosną dni stają się dłuższe, a słońce grzeje mocniej.',
      'Pierwsze wiosną zakwitają przebiśniegi — czasem wprost spod śniegu.',
      'Wiosną ptaki wracają z ciepłych krajów i wiją gniazda.',
      'Wiosną budzą się niedźwiedzie, jeże i owady.',
      'W kwietniu i maju kwitną sady: jabłonie, wiśnie i morele.',
      'Wiosną ludzie sieją nasiona w ogrodach i na polach.',
      'Wiosną pszczoły wylatują z uli po pierwszy nektar.',
      'Wiosną topnieje śnieg i rzeki wzbierają.',
      'Pod koniec wiosny zdarza się pierwsza burza z grzmotami i błyskawicami.',
    ],
  },
  summer: {
    name: 'Lato',
    from: 'lata',
    of: 'letnie',
    no: 'Latem jest na to za gorąco!',
    facts: [
      'Lato to czerwiec, lipiec i sierpień.',
      'Latem dni są najdłuższe, a noce najkrótsze.',
      'Latem słońce wznosi się najwyżej — dlatego jest tak ciepło.',
      'Latem dojrzewają owoce: truskawki, maliny i czereśnie.',
      'Latem uczniowie mają najdłuższe wakacje.',
      'Latem na polach dojrzewa pszenica — piecze się z niej chleb.',
      'Latem pisklęta uczą się latać.',
      'Najdłuższy dzień w roku wypada w czerwcu.',
      'W upał trzeba pić dużo wody i nosić czapkę od słońca.',
      'W letnie wieczory można zobaczyć świetliki, a nocą — mnóstwo gwiazd.',
    ],
  },
  autumn: {
    name: 'Jesień',
    from: 'jesieni',
    of: 'jesienne',
    no: 'Jesienią widzimy coś innego.',
    facts: [
      'Jesień to wrzesień, październik i listopad.',
      'Jesienią dni stają się krótsze, a noce dłuższe.',
      'Liście żółkną, bo znika z nich zielony barwnik — chlorofil.',
      'Jesienią bociany, jaskółki i żurawie odlatują do ciepłych krajów.',
      'Jesienią zbiera się plony: jabłka, gruszki, ziemniaki, dynie.',
      'Wiewiórki, chomiki i myszy robią jesienią zapasy na zimę.',
      'Jesienią jeż szuka sterty liści, żeby przespać w niej zimę.',
      'Jesienią zwierzętom rośnie gęstsze futro — szykują się na chłody.',
      'Opadłe liście to nie śmieci: okrywają ziemię i użyźniają glebę.',
      'Pod koniec jesieni rano bywa szron — biały nalot z kryształków lodu.',
    ],
  },
};

/**
 * The months: the name, «od stycznia» (genitive), «po styczniu» (locative),
 * «przed styczniem» (instrumental) — and the story of each one's Polish name.
 */
const MONTHS: [name: string, from: string, after: string, before: string, fact: string][] = [
  ['Styczeń', 'stycznia', 'styczniu', 'styczniem', 'Styczeń to pierwszy miesiąc roku. Jego nazwa pochodzi od słowa „stykać”: stary rok styka się w nim z nowym.'],
  ['Luty', 'lutego', 'lutym', 'lutym', 'Luty wziął nazwę od srogich, czyli „lutych”, mrozów. To najkrótszy miesiąc: ma 28 dni, a raz na cztery lata — 29.'],
  ['Marzec', 'marca', 'marcu', 'marcem', 'Nazwa „marzec” pochodzi od Marsa — rzymskiego boga. W marcu przyroda budzi się po zimie, a pogoda bywa bardzo zmienna.'],
  ['Kwiecień', 'kwietnia', 'kwietniu', 'kwietniem', 'Kwiecień to miesiąc pierwszych kwiatów — stąd jego nazwa. Zakwitają przebiśniegi, żonkile i tulipany.'],
  ['Maj', 'maja', 'maju', 'majem', 'Maj nosi imię Mai, rzymskiej bogini wzrostu. W maju wszystko pokrywa się gęstą, zieloną trawą.'],
  ['Czerwiec', 'czerwca', 'czerwcu', 'czerwcem', 'Nazwa „czerwiec” pochodzi od czerwca — małego owada, z którego dawniej robiono czerwony barwnik. W tym miesiącu wypada najdłuższy dzień w roku.'],
  ['Lipiec', 'lipca', 'lipcu', 'lipcem', 'W lipcu kwitną lipy — stąd nazwa miesiąca — a pszczoły zbierają z nich pachnący miód.'],
  ['Sierpień', 'sierpnia', 'sierpniu', 'sierpniem', 'Sierpień wziął nazwę od sierpa: dawniej żęto nim dojrzałe zboże.'],
  ['Wrzesień', 'września', 'wrześniu', 'wrześniem', 'We wrześniu kwitną wrzosy — niskie krzewinki o różowofioletowych kwiatach. A dzieci idą do szkoły.'],
  ['Październik', 'października', 'październiku', 'październikiem', 'Nazwa „październik” pochodzi od paździerzy — okruchów łodyg lnu, które sypały się, gdy jesienią obrabiano len. W październiku liście robią się żółte i złote.'],
  ['Listopad', 'listopada', 'listopadzie', 'listopadem', 'W listopadzie z drzew opadają ostatnie liście — tak właśnie się nazywa: liście padają.'],
  ['Grudzień', 'grudnia', 'grudniu', 'grudniem', 'W grudniu ziemia zamarza w twarde grudy — stąd nazwa miesiąca. To ostatni miesiąc roku.'],
];

/** The signs of the seasons, in the order of `SIGNS`: the question, the card, the fact. */
const SIGNS: [ask: string, label: string, fact: string][] = [
  ['Kiedy lepimy bałwana?', 'Lepimy bałwana', 'Bałwana lepi się zimą, kiedy śnieg jest lepki. Najlepiej się klei, gdy na dworze jest około zera stopni.'],
  ['Kiedy kąpiemy się w morzu?', 'Kąpiemy się w morzu', 'Latem woda w morzu i rzekach się nagrzewa — to najlepszy czas na kąpiel.'],
  ['Kiedy opadają żółte liście?', 'Opadają żółte liście', 'Jesienią drzewa zrzucają liście, żeby zimą nie tracić wody i nie łamać się pod śniegiem.'],
  ['Kiedy kwitną tulipany?', 'Kwitną tulipany', 'Wiosną słońce grzeje mocniej i z ziemi wychodzą pierwsze kwiaty.'],
  ['Kiedy ubieramy choinkę?', 'Ubieramy choinkę', 'Choinkę ubiera się zimą — na Boże Narodzenie i Nowy Rok.'],
  ['Kiedy dojrzewają arbuzy?', 'Dojrzewają arbuzy', 'Arbuzy potrzebują dużo słońca i ciepła, dlatego dojrzewają pod koniec lata.'],
  ['Kiedy ptaki wracają z ciepłych krajów?', 'Ptaki wracają z ciepłych krajów', 'Wiosną jaskółki, bociany i szpaki wracają do domu z ciepłych krajów.'],
  ['Kiedy zbieramy grzyby?', 'Zbieramy grzyby', 'Jesienią często pada deszcz, a grzyby lubią wilgoć — dlatego jest ich wtedy dużo.'],
  ['Kiedy jeździmy na łyżwach?', 'Jeździmy na łyżwach', 'Zimą woda zamarza i po lodzie można jeździć na łyżwach.'],
  ['Kiedy kwitną słoneczniki?', 'Kwitną słoneczniki', 'Latem pola żółkną od słoneczników. Młode słoneczniki obracają główki za słońcem.'],
  ['Kiedy pojawiają się pierwsze listki?', 'Pojawiają się pierwsze listki', 'Wiosną na drzewach pękają pąki — rozwijają się z nich delikatne listki.'],
  ['Kiedy dzieci idą do szkoły?', 'Dzieci idą do szkoły', 'Rok szkolny zaczyna się na początku września — wtedy, gdy lato ustępuje jesieni.'],
  ['Kiedy niedźwiedź śpi w gawrze?', 'Niedźwiedź śpi w gawrze', 'Zimą niedźwiedziowi trudno znaleźć jedzenie, dlatego śpi w gawrze aż do wiosny.'],
  ['Kiedy latają motyle?', 'Latają motyle', 'Latem jest dużo kwiatów, a motyle piją z nich słodki nektar.'],
  ['Kiedy topnieje śnieg i szemrzą strumyki?', 'Topnieje śnieg i szemrzą strumyki', 'Wiosną słońce roztapia śnieg, a woda z roztopów płynie strumykami do rzek.'],
  ['Kiedy dojrzewają dynie?', 'Dojrzewają dynie', 'Dynie zbiera się jesienią. Mogą leżeć całą zimę i się nie psują.'],
  ['Kiedy zakładamy rękawiczki i czapkę?', 'Zakładamy rękawiczki i czapkę', 'Zimą jest zimno, dlatego zakładamy ciepłe ubrania: zatrzymują ciepło naszego ciała.'],
  ['Kiedy dojrzewają truskawki?', 'Dojrzewają truskawki', 'Truskawki dojrzewają na początku lata — to jedne z pierwszych owoców w roku.'],
  ['Kiedy wykluwają się pisklęta?', 'Wykluwają się pisklęta', 'Wiosną ptaki wiją gniazda i wysiadują jajka — wykluwają się z nich pisklęta.'],
  ['Kiedy często padają zimne deszcze?', 'Często padają zimne deszcze', 'Jesienią słońce grzeje słabiej, niebo zasnuwają chmury i często pada.'],
  ['Kiedy wiewiórka robi zapasy orzechów?', 'Wiewiórka robi zapasy orzechów', 'Jesienią wiewiórka chowa orzechy i grzyby, żeby mieć co jeść zimą.'],
  ['Kiedy bywają burze i tęcze?', 'Burze i tęcze', 'Latem po ciepłej ulewie często widać tęczę: to światło słońca rozszczepia się w kroplach deszczu.'],
];

const low = (at: number) => MONTHS[at][0].toLocaleLowerCase('pl');

export const pl: NatureTexts = {
  cards: {
    title: 'Przyroda',
    games: {
      seasons: {
        label: 'Pory roku i miesiące',
        blurb: 'Co i kiedy dzieje się w przyrodzie oraz dwanaście miesięcy po kolei',
        intro: 'Rok ma cztery pory: zimę, wiosnę, lato i jesień, a w każdej są trzy miesiące. Spójrz na obrazek i pokaż, kiedy to się dzieje!',
      },
    },
  },
  introFor: (step) => {
    if (step === 3) return 'Teraz poznamy miesiące. W roku jest ich dwanaście, a każdy należy do swojej pory roku.';
    if (step === 4 || step === 5) return 'Miesiące zawsze idą jeden po drugim. Przypomnij sobie, który miesiąc jest sąsiedni!';
    if (step === 6 || step === 8) return 'Ustaw karty po kolei. Dotknij dwóch kart, żeby zamienić je miejscami.';
    if (step === 7) return 'Każdy miesiąc ma swój numer: styczeń jest pierwszy, a grudzień — dwunasty.';
    return undefined;
  },
  season: (id) => SEASONS[id],
  month: (at) => ({ name: MONTHS[at][0], fact: MONTHS[at][4] }),
  sign: (at) => ({ ask: SIGNS[at][0], label: SIGNS[at][1], fact: SIGNS[at][2] }),
  monthSeason: {
    ask: (m) => `Do jakiej pory roku należy ${low(m)}?`,
    hint: (m, season) => `${MONTHS[m][0]} to ${SEASONS[season].name.toLocaleLowerCase('pl')}. ${SEASONS[season].facts[0]}`,
  },
  after: {
    ask: (m) => `Jaki miesiąc następuje po ${MONTHS[m][2]}?`,
    hint: (m) => `Przypomnij sobie miesiące po kolei: ${low((m + 11) % 12)}, ${low(m)}, a dalej…`,
    fact: (m) => `Po ${MONTHS[m][2]} następuje ${low((m + 1) % 12)}.`,
  },
  before: {
    ask: (m) => `Jaki miesiąc był przed ${MONTHS[m][3]}?`,
    hint: (m) => `Przypomnij sobie miesiące po kolei. Po jakim miesiącu następuje ${low(m)}?`,
    fact: (m) => `Przed ${MONTHS[m][3]} był ${low((m + 11) % 12)}.`,
  },
  orderMonths: {
    ask: (season) => `Ustaw ${SEASONS[season].of} miesiące po kolei. Pierwszy miesiąc — na miejsce 1.`,
    hint: (season, first) => `${SEASONS[season].name} zaczyna się od ${MONTHS[first][1]}. Dotknij dwóch kart, żeby zamienić je miejscami.`,
    fact: (season, months) => `${SEASONS[season].name} to ${low(months[0])}, ${low(months[1])} i ${low(months[2])}.`,
  },
  ends: ['na początku', 'na końcu'],
  nth: {
    ask: (m) => `Który miesiąc jest ${ordinalWords(m + 1)} w roku?`,
    hint: 'Rok zaczyna się od stycznia. Policz miesiące po kolei: styczeń — pierwszy, luty — drugi, marzec — trzeci…',
    fact: (m) => `${MONTHS[m][0]} to ${ordinalWords(m + 1)} miesiąc roku.`,
  },
  orderSeasons: {
    ask: (first) => `Ustaw pory roku po kolei. Zacznij od ${SEASONS[first].from}.`,
    circle: 'Pory roku idą w kółko: zima, wiosna, lato, jesień — i znowu zima.',
  },
};
