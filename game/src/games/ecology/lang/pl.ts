import type { Bin, EcologyTexts } from './types';
import { whyOf } from './types';
import { LINES, ROWS } from './why.pl';

/** The Ecology galaxy in Polish. */

const BINS: Record<Bin, { name: string; no: string; clue: string }> = {
  glass: { name: 'Szkło', no: 'Brzdęk! To nie szkło.', clue: 'Jest twarde, przezroczyste i dźwięczy — to szkło.' },
  paper: { name: 'Papier', no: 'Szur! To nie papier.', clue: 'Można to podrzeć i zgnieść — to papier.' },
  plastic: { name: 'Plastik', no: 'Oj! To nie plastik.', clue: 'Jest lekkie, gnie się i nie tłucze — to plastik.' },
  metal: { name: 'Metal', no: 'Dzyń! To nie metal.', clue: 'Jest twarde, błyszczy i brzęczy — to metal.' },
  organic: { name: 'Bio', no: 'Chrup! To nie na kompost.', clue: 'To resztki roślin i jedzenia — zgniją w kompoście.' },
};

/**
 * The first things, each with a clue of its own. A name that ends in «*» is
 * plural: the question then asks «dokąd trafią», not «dokąd trafi».
 */
const RUBBISH: Record<string, [name: string, clue: string]> = {
  bottle: ['szklana butelka', 'Jest przezroczysta, twarda i dźwięczy — to szkło.'],
  newspaper: ['gazeta', 'Można ją podrzeć i zgnieść — to papier.'],
  cup: ['plastikowy kubeczek', 'Jest lekki i się gnie — to plastik.'],
  box: ['kartonowe pudełko', 'Karton to gruby papier.'],
  jar: ['szklany słoik', 'Słoik jest przezroczysty i dość ciężki — to szkło.'],
  shampoo: ['butelka po szamponie', 'Jest miękka i się nie tłucze — to plastik.'],
  envelope: ['koperta', 'Koperta jest zrobiona z papieru.'],
  glass: ['szklanka', 'Szklanka jest twarda i przezroczysta — to szkło.'],
  bag: ['plastikowa torebka', 'Torebka jest cienka i szeleści — to plastik.'],
  notebook: ['stary zeszyt', 'Kartki zeszytu to papier.'],
  toothbrush: ['szczoteczka do zębów', 'Rączka szczoteczki jest zrobiona z plastiku.'],
  perfume: ['flakon po perfumach', 'Flakon jest twardy i przezroczysty — to szkło.'],
  books: ['stare książki*', 'Książki są wydrukowane na papierze.'],
  bucket: ['plastikowe wiaderko', 'Wiaderko jest lekkie i się nie tłucze — to plastik.'],
  honey_jar: ['słoiczek po miodzie', 'Słoiczek jest dość ciężki, twardy i przezroczysty — to szkło.'],
  shoe_box: ['pudełko po butach', 'Pudełko jest z kartonu, a karton to gruby papier.'],
  soap_bottle: ['butelka po mydle w płynie', 'Butelka jest lekka i sprężysta — to plastik.'],
  lemonade: ['szklana butelka po lemoniadzie', 'Dźwięczy, gdy się w nią postuka — to szkło.'],
  towel_roll: ['kartonowa rolka po ręcznikach', 'Kartonowa rolka łatwo się gniecie — to papier.'],
  container: ['plastikowy pojemnik', 'Pojemnik jest lekki i się nie tłucze — to plastik.'],
  pickle_jar: ['słoik po ogórkach', 'Słoik jest przezroczysty i twardy — to szkło.'],
  postcard: ['stara pocztówka', 'Pocztówkę można zgiąć i podrzeć — to papier.'],
  duck: ['plastikowa kaczuszka', 'Kaczuszka jest lekka, pływa i się nie tłucze — to plastik.'],
  jam_jar: ['słoik po konfiturach', 'Słoik jest twardy, przezroczysty i dość ciężki — to szkło.'],
  egg_tray: ['kartonowa wytłaczanka po jajkach', 'Wytłaczanka jest zrobiona z prasowanego papieru.'],
  straw: ['plastikowa słomka', 'Słomka jest lekka i się gnie — to plastik.'],
  oil_bottle: ['szklana butelka po oleju', 'Butelka jest twarda i przezroczysta — to szkło.'],
  calendar: ['stary kalendarz', 'Kartki kalendarza to papier.'],
  cap: ['nakrętka od butelki', 'Nakrętka jest lekka i twarda, ale się nie tłucze — to plastik.'],
};

/** The rest, by bin, in the order of `content/rubbish.ts`. */
const MORE: Record<Bin, string[]> = {
  glass: ['butelka po soku', 'słoik po kompocie', 'butelka po wodzie mineralnej', 'słoik po musztardzie', 'szklany słoik po kawie', 'buteleczka po syropie', 'słoiczek po przecierze dla dzieci', 'butelka po occie', 'słoik po sosie pomidorowym', 'szklana buteleczka po lekach', 'słoik po oliwkach', 'słoik po dżemie'],
  paper: ['czasopismo', 'papierowa torba', 'pudełko po płatkach', 'blok rysunkowy', 'stary list', 'ulotka reklamowa', 'papierowe opakowanie', 'kartonowa teczka', 'pudełko po cukierkach', 'zapisana kartka', 'stary dziennik', 'bilet do kina', 'pudełko po zabawce', 'rolka po papierze toaletowym', 'stary podręcznik', 'papierowa zakładka'],
  plastic: ['butelka po wodzie', 'kubeczek po jogurcie', 'butelka po kefirze', 'butelka po żelu pod prysznic', 'plastikowa łyżeczka', 'pudełko po lodach', 'plastikowa butelka po keczupie', 'kanister po wodzie', 'plastikowy wieszak', 'klocek do zabawy', 'plastikowa miska', 'butelka po płynie do naczyń', 'kubeczek po śmietanie', 'pojemnik po owocach', 'plastikowa pokrywka od wiaderka'],
  metal: ['puszka po lemoniadzie', 'puszka po konserwie', 'zakrętka od słoika', 'folia aluminiowa', 'puszka po groszku', 'metalowy kapsel', 'puszka po kukurydzy', 'stara łyżka', 'zardzewiały gwóźdź', 'puszka po tuńczyku', 'puszka po mleku skondensowanym', 'stary klucz', 'metalowe pudełko po ciastkach', 'puszka po soku', 'kawałek drutu'],
  organic: ['ogryzek jabłka', 'skórka od banana', 'obierki z ziemniaków*', 'zwiędły kwiat', 'skórka od pomarańczy', 'opadłe liście*', 'skorupka jajka', 'głąb kapusty', 'obierki z marchewki*', 'fusy z kawy*', 'fusy z herbaty*', 'skórka od arbuza', 'skoszona trawa', 'czerstwy chleb'],
};

const FACTS: Record<Bin, string[]> = {
  glass: [
    'Ze starego szkła powstaną nowe butelki — i tak można w nieskończoność!',
    'Szkło można przetapiać wciąż od nowa i wcale się przez to nie psuje.',
    'Szkło nie znika w przyrodzie przez tysiące lat — dlatego lepiej je przetworzyć.',
    'W hucie szkło się kruszy, topi w piecu i wydmuchuje z niego nowe słoiki.',
    'Jedna przetworzona butelka oszczędza tyle energii, że żarówka świeciłaby kilka godzin.',
    'Rozbite szkło w lesie może zranić łapki zwierząt. W pojemniku nikomu nie zaszkodzi.',
    'Szkło robi się z piasku. Gdy przetwarzamy stare, nie trzeba wykopywać nowego piasku.',
    'Szkiełko w słońcu może podpalić suchą trawę jak lupa. Dlatego szkła nie zostawia się w lesie.',
    'Z przetworzonego szkła robi się nie tylko butelki, ale też płytki i ocieplenie do domów.',
    'Szkło segreguje się według koloru: bezbarwne, zielone i brązowe — żeby nowe butelki były ładne.',
    'Szklany słoik można nie tylko oddać, ale też wykorzystać drugi raz — na przykład na konfitury.',
    'Do stopienia starego szkła potrzeba mniej ciepła niż do wytopienia nowego z piasku.',
  ],
  paper: [
    'Z papieru powstaną nowe zeszyty, a drzewa będą dalej rosły.',
    'Papier robi się z drewna. Oddajesz makulaturę — ratujesz drzewa przed wycinką.',
    'Stare gazety zamieniają się w wytłaczanki na jajka i papier toaletowy.',
    'Papier można przetwarzać pięć do siedmiu razy, aż włókna staną się za krótkie.',
    'W papierni papier się rozmacza, miesza na papkę i rozwałkowuje na nowe arkusze.',
    'Sto kilogramów makulatury ratuje przed wycięciem jedno dorosłe drzewo.',
    'Z kartonowych pudeł robi się nowe pudła — w takich przychodzą do ciebie paczki.',
    'Do zrobienia papieru z makulatury potrzeba o wiele mniej wody niż z drewna.',
    'Drzewa, które dalej rosną, oczyszczają powietrze i dają dom ptakom i wiewiórkom.',
    'Papier rozkłada się szybko, ale na wysypisku wydziela szkodliwy gaz. Przetworzony jest pożyteczny.',
    'Zanim wyrzucisz papier, sprawdź: może na odwrocie da się jeszcze rysować?',
    'Karton i papier trzeba oddawać suche i czyste — tłustego pudełka po pizzy nie da się przetworzyć.',
  ],
  plastic: [
    'Z plastiku powstaną nowe zabawki, ławki, a nawet ubrania.',
    'Z plastikowych butelek robi się ciepłe polary i wypełnienie do kurtek.',
    'Plastik nie znika w przyrodzie przez setki lat — dlatego nie wolno go wyrzucać byle gdzie.',
    'Plastikowe torebki w morzu wyglądają jak meduzy i żółwie zjadają je przez pomyłkę. W pojemniku torebka nikomu nie zaszkodzi.',
    'W zakładzie plastik się myje, tnie na drobne płatki i topi na nowe rzeczy.',
    'Plastikowe nakrętki zbiera się osobno: powstają z nich ławki, zjeżdżalnie i całe place zabaw.',
    'Plastik robi się z ropy naftowej. Gdy przetwarzamy stary, ropa zostaje w ziemi.',
    'Zanim wyrzucisz butelkę, zgnieć ją: w pojemniku zmieści się wtedy więcej.',
    'Z dwudziestu pięciu butelek może powstać jedna bluza z polaru.',
    'Plastik bywa różny. Trójkąt z cyfrą na spodzie podpowiada, jak go przetworzyć.',
    'Ptaki często mylą kawałki plastiku z jedzeniem. Sprzątając go, ratujesz ptaki.',
    'Najlepszy plastik to taki, którego nie było: zabieraj do sklepu własną torbę.',
  ],
  metal: [
    'Metal można przetapiać nieskończenie wiele razy — wcale się przez to nie psuje.',
    'Z przetopionych puszek robi się nowe puszki, rowery, a nawet samoloty.',
    'Aluminiowa puszka może wrócić na sklepową półkę już po dwóch miesiącach.',
    'Przetopić starą puszkę jest o wiele łatwiej, niż wydobyć metal z rudy.',
    'Metal w przyrodzie rdzewieje i leży dziesiątki, a nawet setki lat.',
    'Puszkę przed oddaniem warto zgnieść — zajmie wtedy mniej miejsca.',
    'Metal wyciąga się ze śmieci wielkim magnesem.',
    'Ze starych puszek po konserwach wytapia się stal na mosty i szyny.',
    'Folię też można przetworzyć, jeśli zgniecie się ją w kulkę.',
    'Sto przetworzonych puszek to rama nowego roweru.',
  ],
  organic: [
    'Resztki roślin gniją i stają się kompostem — nawozem do ogrodu.',
    'Skórki i ogryzki znikają w przyrodzie w kilka tygodni.',
    'W kompostowniku pracują dżdżownice i mikroby.',
    'Kompost sprawia, że ziemia jest pulchna i żyzna.',
    'Opadłe liście to nie śmieci: karmią glebę i ogrzewają jeże.',
    'Skorupki jajek w kompoście dają roślinom wapń.',
    'Fusy z kawy i z herbaty lubią kwiaty doniczkowe.',
    'Na wysypisku odpadki gniją bez powietrza i wydzielają szkodliwy gaz — dlatego lepiej je kompostować.',
    'Z kompostu wyrastają nowe warzywa — tak jedzenie wraca na stół.',
    'Prawie jedna trzecia domowych śmieci to resztki jedzenia, które można kompostować.',
  ],
};

const entry = (id: string): { name: string; clue?: string } => {
  if (RUBBISH[id]) return { name: RUBBISH[id][0], clue: RUBBISH[id][1] };
  const [, bin, at] = /^([a-z]+)_(\d+)$/.exec(id) ?? [];
  return { name: MORE[bin as Bin]?.[Number(at)] ?? id };
};
const rubbish = (id: string) => ({ ...entry(id), name: entry(id).name.replace(/\*$/, '') });
const cap = (text: string) => text[0].toLocaleUpperCase('pl') + text.slice(1);

export const pl: EcologyTexts = {
  cards: {
    title: 'Ekologia',
    games: {
      recycling: {
        label: 'Eko-patrol',
        blurb: 'Segregujemy śmieci: sto rzeczy — szkło, papier, plastik, metal i bio',
        intro: 'Polanę trzeba posprzątać! Szkło, papier, plastik, metal i resztki jedzenia wrzucamy do różnych pojemników — wtedy powstaną z nich nowe rzeczy.',
      },
      why: {
        label: 'Dlaczego tak?',
        blurb: 'Dlaczego topnieją lodowce i dlaczego nie wolno palić liści',
        intro: 'Przyroda potrzebuje naszej pomocy. Posłuchaj pytania i wybierz odpowiedź — a ja opowiem, dlaczego to ważne: o powietrzu, wodzie, zwierzętach, śmieciach i cieple na planecie.',
      },
    },
  },
  bin: (id) => BINS[id],
  retry: 'Spróbuj innego pojemnika!',
  rubbish,
  // The thing is the subject, so it stays in the nominative; only the verb answers to its number.
  ask: (id) => `Do którego pojemnika ${entry(id).name.endsWith('*') ? 'trafią' : 'trafi'} ${rubbish(id).name}?`,
  yes: (id, bin) => `Tak! ${cap(rubbish(id).name)} — do pojemnika „${BINS[bin].name}”.`,
  facts: (bin) => FACTS[bin],
  why: whyOf(ROWS, LINES),
};
