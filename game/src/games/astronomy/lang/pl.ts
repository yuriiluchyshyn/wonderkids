import { ordinalWords } from '@/core/lang/pl';
import type { AstronomyTexts } from './types';

/** The Astronomy galaxy in Polish. */

const PLANETS: Record<string, string> = { mercury: 'Merkury', venus: 'Wenus', earth: 'Ziemia', mars: 'Mars', jupiter: 'Jowisz', saturn: 'Saturn', uranus: 'Uran', neptune: 'Neptun' };

const FEATURES: Record<string, string> = {
  red: 'Czerwona Planeta',
  rings: 'Ma wielkie pierścienie',
  home: 'Tutaj mieszkamy my',
  biggest: 'Największa planeta',
  nearest: 'Najbliższa Słońca',
  farthest: 'Najdalsza od Słońca',
  hottest: 'Najgorętsza planeta',
  sideways: 'Obraca się, leżąc na boku',
  moon: 'Ma jeden księżyc — Księżyc',
  smallest: 'Najmniejsza planeta',
  spot: 'Ma Wielką Czerwoną Plamę — olbrzymi wir',
  winds: 'Tutaj wieją najszybsze wiatry',
  olympus: 'Ma najwyższą górę — Olympus Mons',
  morning: 'Nazywają ją Gwiazdą Poranną',
  year: 'Rok trwa tu tylko 88 dni',
  light: 'Lżejsza od wody',
  oceans: 'Błękitna planeta z oceanami',
  day: 'Doba trwa tu tylko 10 godzin',
  icy: 'Lodowy olbrzym w turkusowym kolorze',
  math: 'Odkryto ją dzięki matematyce',
  moons: 'Ma dwa maleńkie księżyce — Fobosa i Deimosa',
  backwards: 'Obraca się w przeciwną stronę',
  titan: 'Ma księżyc Tytan z własną atmosferą',
  ganymede: 'Ma największy księżyc — Ganimedesa',
};

/** The constellations, in the order of `FIGURES`: the name, the accusative («Znajdź … Strzałę») and what is told about it. */
const FIGURES: [name: string, whom: string, fact: string][] = [
  ['Kasjopeja', 'Kasjopeję', 'Kasjopeja przypomina literę W. Nosi imię królowej z mitu.'],
  ['Krzyż Południa', 'Krzyż Południa', 'Krzyż Południa widać tylko z południowej połowy Ziemi — jest na fladze Australii.'],
  ['Strzała', 'Strzałę', 'Strzała to jeden z najmniejszych gwiazdozbiorów na niebie.'],
  ['Delfin', 'Delfina', 'Gwiazdozbiór Delfina jest mały, ale dobrze widoczny na letnim niebie.'],
  ['Baran', 'Barana', 'Baran to baran o złotym runie z greckiego mitu.'],
  ['Kruk', 'Kruka', 'Cztery jasne gwiazdy Kruka tworzą na niebie czworokąt.'],
  ['Wielki Wóz', 'Wielki Wóz', 'Wielki Wóz to siedem gwiazd gwiazdozbioru Wielkiej Niedźwiedzicy. Przypomina wóz z dyszlem.'],
  ['Mała Niedźwiedzica', 'Małą Niedźwiedzicę', 'Na końcu „ogona” Małej Niedźwiedzicy świeci Gwiazda Polarna — zawsze wskazuje północ.'],
  ['Cefeusz', 'Cefeusza', 'Gwiazdozbiór Cefeusza przypomina domek ze spiczastym dachem.'],
  ['Lutnia', 'Lutnię', 'W gwiazdozbiorze Lutni świeci Wega — jedna z najjaśniejszych gwiazd naszego nieba.'],
  ['Bliźnięta', 'Bliźnięta', 'Dwie najjaśniejsze gwiazdy Bliźniąt nazywają się Kastor i Polluks — jak bracia z mitu.'],
  ['Korona Północna', 'Koronę Północną', 'Gwiazdy Korony Północnej tworzą półkole — jak prawdziwa korona.'],
  ['Skorpion', 'Skorpiona', 'W sercu Skorpiona płonie czerwona gwiazda Antares.'],
  ['Smok', 'Smoka', 'Smok wije się między Wielką a Małą Niedźwiedzicą.'],
  ['Orion', 'Oriona', 'Orion to niebieski myśliwy. Trzy gwiazdy pośrodku to jego pas.'],
  ['Lew', 'Lwa', 'Najjaśniejsza gwiazda Lwa nazywa się Regulus — „mały król”.'],
  ['Hydra', 'Hydrę', 'Hydra to najdłuższy gwiazdozbiór na całym niebie.'],
];

type Row = [question: string, fact: string];
/** The hundred questions of the planet quiz, in the order of `content/planetQuiz.ts`. */
const QUIZ: Record<string, Row[]> = {
  mercury: [
    ['Która planeta okrąża Słońce najszybciej?', 'Merkury pędzi wokół Słońca najszybciej ze wszystkich planet — prawie 50 kilometrów na sekundę.'],
    ['Na której planecie w dzień jest ponad 400 stopni, a w nocy minus 170?', 'Na Merkurym prawie nie ma powietrza, które zatrzymałoby ciepło: w dzień jest tam skwar, a w nocy siarczysty mróz.'],
    ['Która planeta jest tylko trochę większa od naszego Księżyca?', 'Merkury jest tylko trochę większy od Księżyca — i tak samo pokryty kraterami.'],
    ['Która planeta jest cała w kraterach i bardzo przypomina Księżyc?', 'Powierzchnia Merkurego jest cała podziurawiona kraterami: przez miliardy lat uderzały w nią meteoryty.'],
    ['Która planeta nie ma ani księżyców, ani powietrza?', 'Merkury nie ma ani jednego księżyca i prawie nie ma atmosfery.'],
    ['Do której planety światło Słońca dociera najszybciej — w zaledwie trzy minuty?', 'Do Merkurego światło ze Słońca leci około trzech minut, a do Ziemi — ponad osiem.'],
    ['Na której planecie Słońce wygląda na niebie trzy razy większe niż z Ziemi?', 'Z Merkurego Słońce wydaje się trzy razy większe niż z Ziemi — tak blisko niego leży ta planeta.'],
    ['Którą planetę nazwano na cześć szybkiego rzymskiego boga posłańca?', 'Merkury był u Rzymian bogiem posłańcem w skrzydlatych sandałach. Planetę nazwano tak, bo jest najszybsza.'],
    ['Którą planetę najtrudniej zobaczyć z Ziemi, bo chowa się w blasku Słońca?', 'Merkurego widać tylko krótko o świcie albo tuż po zachodzie — zawsze jest blisko Słońca.'],
    ['Przy której planecie pracowała sonda kosmiczna MESSENGER?', 'Sonda MESSENGER przez cztery lata krążyła wokół Merkurego i sfotografowała całą jego powierzchnię.'],
    ['Na której planecie w ciemnych kraterach przy biegunach kryje się lód, choć jest najbliżej Słońca?', 'Do kraterów na biegunach Merkurego nigdy nie zagląda Słońce, dlatego leży tam lód.'],
    ['W której planecie żelazne jądro zajmuje prawie cały środek?', 'Merkury jest jak żelazna kula w cienkiej kamiennej skorupie: jądro zajmuje większą jego część.'],
  ],
  venus: [
    ['Na której planecie jest 460 stopni i w dzień, i w nocy?', 'Na Wenus jest goręcej niż w piecu: gęste chmury nie wypuszczają ciepła ani w dzień, ani w nocy.'],
    ['Którą planetę okrywają gęste żółte chmury z kwasu?', 'Chmury Wenus są z żrącego kwasu. Nie widać przez nie powierzchni planety.'],
    ['Którą planetę nazywa się siostrą Ziemi, bo jest prawie tej samej wielkości?', 'Wenus jest prawie tak duża jak Ziemia, ale nie da się na niej żyć.'],
    ['Na której planecie Słońce wschodzi na zachodzie, a zachodzi na wschodzie?', 'Wenus obraca się w przeciwną stronę, dlatego Słońce wschodzi tam na zachodzie.'],
    ['Która planeta obraca się wokół siebie najwolniej — jeden obrót trwa 243 ziemskie dni?', 'Wenus kręci się tak wolno, że jeden jej obrót trwa dłużej niż jej rok.'],
    ['Która planeta jest najjaśniejsza na naszym nocnym niebie?', 'Po Słońcu i Księżycu najjaśniejsza na niebie jest Wenus: jej chmury świetnie odbijają światło.'],
    ['Na której planecie powietrze naciska tak mocno, jakby było się na dnie oceanu?', 'Powietrze na Wenus naciska dziewięćdziesiąt razy mocniej niż na Ziemi — jak woda na głębokości kilometra.'],
    ['Którą planetę nazwano na cześć rzymskiej bogini piękna?', 'Wenus to rzymska bogini piękna i miłości. Planetę nazwano tak za jej jasny blask.'],
    ['Na której planecie jest najwięcej wulkanów?', 'Na Wenus jest ponad tysiąc wielkich wulkanów — więcej niż na jakiejkolwiek innej planecie.'],
    ['Która planeta podchodzi do Ziemi najbliżej?', 'Najbliżej Ziemi podlatuje Wenus — ale i wtedy dzieli nas od niej czterdzieści milionów kilometrów.'],
    ['Która planeta jest druga od Słońca?', 'Wenus to druga planeta od Słońca, między Merkurym a Ziemią.'],
    ['Na której planecie padają kwaśne deszcze, które wyparowują, zanim dolecą do powierzchni?', 'Na Wenus jest tak gorąco, że krople kwaśnego deszczu wyparowują jeszcze w powietrzu.'],
  ],
  earth: [
    ['Na której planecie jest ciekła woda — rzeki, morza i oceany?', 'Tylko na Ziemi woda płynie rzekami i wypełnia oceany: nie jest tu ani za gorąco, ani za zimno.'],
    ['Na której jedynej planecie na pewno jest życie?', 'Ziemia to jedyna znana planeta, na której jest życie: rośliny, zwierzęta i ludzie.'],
    ['Na której planecie doba trwa równo 24 godziny?', 'Ziemia obraca się wokół siebie w 24 godziny — dlatego po nocy przychodzi dzień.'],
    ['Na której planecie rok trwa 365 dni?', 'W 365 dni Ziemia okrąża Słońce jeden raz — to właśnie jest rok.'],
    ['Która planeta jest trzecia od Słońca?', 'Ziemia to trzecia planeta od Słońca, między Wenus a Marsem.'],
    ['Na której planecie jest powietrze, którym mogą oddychać ludzie?', 'Tylko w powietrzu Ziemi jest dość tlenu, żeby mogli oddychać ludzie i zwierzęta.'],
    ['Którą planetę widać z kosmosu jako niebieską, z białymi chmurami i zielonymi lądami?', 'Z kosmosu Ziemia wygląda jak niebieska kulka: większą jej część pokrywa woda.'],
    ['Do której planety światło Słońca leci trochę ponad osiem minut?', 'Promień słońca dociera do Ziemi w osiem minut i dwadzieścia sekund.'],
    ['Która planeta jest największa z czterech skalistych?', 'Ziemia jest największą ze skalistych planet: większą od Wenus, Marsa i Merkurego.'],
    ['Wokół której planety lata Międzynarodowa Stacja Kosmiczna?', 'Międzynarodowa Stacja Kosmiczna okrąża Ziemię w półtorej godziny.'],
    ['Z której planety startowały wszystkie rakiety kosmiczne?', 'Wszystkie rakiety, satelity i kosmonauci wyruszali w kosmos z Ziemi.'],
    ['Na której planecie ważysz dokładnie tyle, ile pokazuje domowa waga?', 'Domowa waga pokazuje, ile ważysz na Ziemi. Na innych planetach byłoby to inaczej.'],
    ['Na której planecie zdarza się całkowite zaćmienie Słońca, gdy Księżyc dokładnie je zasłania?', 'Z Ziemi Księżyc i Słońce wydają się tej samej wielkości, dlatego Księżyc może zasłonić Słońce całkowicie.'],
  ],
  mars: [
    ['Po której planecie jeżdżą łaziki?', 'Po Marsie jeżdżą roboty łaziki: robią zdjęcia, wiercą w skałach i szukają śladów wody.'],
    ['Na której planecie niebo w dzień jest różoworude, a zachód Słońca — niebieski?', 'Przez rudy pył niebo na Marsie jest w dzień różowe, a o zachodzie Słońca — niebieskie. Na Ziemi jest odwrotnie.'],
    ['Na której planecie jest największy kanion Układu Słonecznego?', 'Dolina Marinera na Marsie jest tak długa, że sięgnęłaby przez całą Europę.'],
    ['Na której planecie doba jest tylko trochę dłuższa od ziemskiej — 24 godziny 37 minut?', 'Doba na Marsie jest prawie taka sama jak na Ziemi: dłuższa tylko o trzydzieści siedem minut.'],
    ['Na której planecie rok trwa prawie dwa ziemskie lata?', 'Mars okrąża Słońce w 687 dni — to prawie dwa ziemskie lata.'],
    ['Na której planecie ludzie marzą o zbudowaniu pierwszej bazy?', 'Naukowcy przygotowują lot ludzi na Marsa: ze wszystkich planet jest najbardziej podobny do Ziemi.'],
    ['Na której planecie burze pyłowe mogą okryć ją całą?', 'Burza pyłowa na Marsie potrafi na kilka miesięcy zasłonić pyłem całą planetę.'],
    ['Na której planecie są czapy lodowe na biegunach i suche koryta dawnych rzek?', 'Kiedyś na Marsie płynęły rzeki. Dziś woda została tam tylko jako lód.'],
    ['Którą planetę nazwano na cześć rzymskiego boga wojny?', 'Mars to rzymski bóg wojny. Planetę nazwano tak za jej czerwony kolor.'],
    ['Która planeta jest czwarta od Słońca?', 'Mars to czwarta planeta od Słońca, zaraz za Ziemią.'],
    ['Która planeta jest mniej więcej dwa razy węższa od Ziemi?', 'Mars ma dwa razy mniejszą średnicę niż Ziemia — i jest dziesięć razy lżejszy.'],
    ['Na której planecie po raz pierwszy latał śmigłowiec z Ziemi?', 'Mały śmigłowiec Ingenuity wzbił się nad Marsem — był to pierwszy lot na innej planecie.'],
    ['Na której planecie pod gruntem znaleziono lód i szuka się śladów dawnego życia?', 'Pod gruntem Marsa jest lód. Naukowcy sprawdzają, czy nie żyły tam kiedyś mikroby.'],
  ],
  jupiter: [
    ['Na której planecie ważyłoby się najwięcej — dwa i pół raza więcej niż na Ziemi?', 'Jowisz przyciąga najmocniej: dziecko, które waży trzydzieści kilogramów, ważyłoby tam siedemdziesiąt pięć.'],
    ['Która planeta obraca się wokół siebie najszybciej?', 'Jowisz robi pełny obrót w niecałe dziesięć godzin — szybciej niż wszystkie planety.'],
    ['Która planeta jest piąta od Słońca — pierwsza wśród olbrzymów?', 'Jowisz to piąta planeta od Słońca i pierwszy z czterech olbrzymów.'],
    ['Która planeta jest cięższa niż wszystkie pozostałe planety razem wzięte?', 'Jowisz jest dwa i pół raza cięższy niż wszystkie pozostałe planety razem.'],
    ['Która planeta ma księżyc Europę z oceanem pod lodem?', 'Pod lodową skorupą Europy, księżyca Jowisza, kryje się ocean słonej wody.'],
    ['Która planeta ma księżyc Io z setkami czynnych wulkanów?', 'Io, księżyc Jowisza, to najbardziej wulkaniczne miejsce w Układzie Słonecznym.'],
    ['Cztery wielkie księżyce której planety odkrył Galileusz?', 'Galileusz zobaczył przez lunetę cztery księżyce Jowisza: Io, Europę, Ganimedesa i Kallisto.'],
    ['Na której planecie rok trwa prawie dwanaście ziemskich lat?', 'Jowisz okrąża Słońce w prawie dwanaście ziemskich lat.'],
    ['Która planeta jest pasiasta — w brązowe i białe pasy chmur?', 'Pasy Jowisza to pasma chmur, które wiatr pędzi w różne strony.'],
    ['Którą planetę nazwano na cześć najważniejszego rzymskiego boga?', 'Jowisz to król rzymskich bogów. Największej planecie nadano jego imię.'],
    ['Przy której planecie pracuje sonda kosmiczna Juno?', 'Sonda Juno krąży wokół Jowisza i zagląda pod jego chmury.'],
    ['Która planeta chroni Ziemię, przyciągając do siebie komety i planetoidy?', 'Jowisz swoim przyciąganiem przechwytuje wiele komet i planetoid, które mogłyby lecieć ku Ziemi.'],
    ['Na której planecie świecą najpotężniejsze zorze polarne?', 'Zorze polarne na Jowiszu są setki razy potężniejsze od ziemskich i nigdy nie gasną.'],
  ],
  saturn: [
    ['Która planeta ma najwięcej księżyców — ponad sto czterdzieści?', 'Wokół Saturna odkryto ponad sto czterdzieści księżyców — więcej niż wokół jakiejkolwiek innej planety.'],
    ['Która planeta jest druga pod względem wielkości?', 'Saturn to druga co do wielkości planeta: większy od niego jest tylko Jowisz.'],
    ['Która planeta jest szósta od Słońca?', 'Saturn to szósta planeta od Słońca, między Jowiszem a Uranem.'],
    ['Na której planecie rok trwa prawie trzydzieści ziemskich lat?', 'Saturn okrąża Słońce w dwadzieścia dziewięć i pół ziemskiego roku.'],
    ['Pierścienie której planety składają się z kawałków lodu i skał?', 'Pierścienie Saturna to miliardy okruchów lodu i kamyków: od ziarenka piasku po wielkość domu.'],
    ['Na biegunie której planety kręci się niezwykły sześciokątny wir?', 'Na północnym biegunie Saturna szaleje burza w kształcie foremnego sześciokąta.'],
    ['Która planeta ma księżyc Enceladus, który wyrzuca w kosmos fontanny wody?', 'Enceladus, księżyc Saturna, tryska w kosmos gejzerami spod swojej lodowej skorupy.'],
    ['Którą planetę przez trzynaście lat badała sonda Cassini?', 'Sonda Cassini przez trzynaście lat badała Saturna, jego pierścienie i księżyce.'],
    ['Którą planetę nazwano na cześć rzymskiego boga rolnictwa i czasu?', 'Saturn był u Rzymian bogiem rolnictwa i czasu, ojcem Jowisza.'],
    ['Która planeta jest najdalszą z tych, które dobrze widać bez teleskopu?', 'Saturn to najdalsza planeta, którą ludzie od dawna widzieli gołym okiem.'],
    ['Która planeta jest najbardziej spłaszczona — jak przygnieciona piłka?', 'Saturn obraca się tak szybko, że wyraźnie spłaszczył się na biegunach.'],
    ['Pierścienie której planety widać nawet przez mały teleskop?', 'Pierścienie Saturna są tak szerokie i jasne, że widać je nawet przez amatorski teleskop.'],
    ['Na księżycu której planety są jeziora i deszcze z ciekłego gazu?', 'Na Tytanie, księżycu Saturna, są jeziora i rzeki — ale nie z wody, tylko z ciekłego metanu.'],
  ],
  uranus: [
    ['Która planeta jest najzimniejsza — bywa tam minus 224 stopnie?', 'Najniższą temperaturę wśród planet zmierzono na Uranie: minus 224 stopnie.'],
    ['Która planeta jest siódma od Słońca?', 'Uran to siódma planeta od Słońca, między Saturnem a Neptunem.'],
    ['Na której planecie rok trwa 84 ziemskie lata?', 'Uran okrąża Słońce w osiemdziesiąt cztery ziemskie lata — tyle, ile trwa długie ludzkie życie.'],
    ['Na której planecie zima i lato trwają po dwadzieścia jeden lat?', 'Uran leży na boku, dlatego każda pora roku trwa tam dwadzieścia jeden lat.'],
    ['Którą planetę jako pierwszą odkryto za pomocą teleskopu?', 'Uran był pierwszą planetą odkrytą przez teleskop — dokonał tego William Herschel.'],
    ['Księżyce której planety noszą imiona bohaterów Szekspira?', 'Księżyce Urana nazywają się jak bohaterowie sztuk Szekspira: Tytania, Oberon, Miranda, Ariel.'],
    ['Którą planetę nazwano na cześć greckiego boga nieba?', 'Uran to starogrecki bóg nieba. To jedyna planeta o greckim, a nie rzymskim imieniu.'],
    ['Do której planety światło Słońca leci prawie trzy godziny?', 'Do Urana promień słońca leci dwie godziny i czterdzieści minut.'],
    ['Która planeta jest trzecia pod względem wielkości?', 'Uran to trzecia co do wielkości planeta, po Jowiszu i Saturnie.'],
    ['Na której planecie biegun może być oświetlony przez Słońce czterdzieści dwa lata z rzędu?', 'Na biegunach Urana dzień trwa czterdzieści dwa lata, a potem tyle samo trwa noc.'],
    ['Która planeta toczy się po orbicie na boku jak piłka i ma trzynaście ciemnych pierścieni?', 'Uran ma trzynaście cienkich, ciemnych pierścieni, a stoją one prawie pionowo, bo planeta leży na boku.'],
  ],
  neptune: [
    ['Która planeta jest ósma — ostatnia — od Słońca?', 'Neptun to ósma i ostatnia planeta Układu Słonecznego.'],
    ['Na której planecie rok trwa 165 ziemskich lat?', 'Neptun okrąża Słońce w sto sześćdziesiąt pięć ziemskich lat.'],
    ['Do której planety światło Słońca leci ponad cztery godziny?', 'Do Neptuna promień słońca leci cztery godziny i dziesięć minut.'],
    ['Która planeta jest ciemnoniebieska jak głębokie morze?', 'Neptun jest ciemnoniebieski: gaz metan w jego powietrzu pochłania czerwone światło.'],
    ['Którą planetę nazwano na cześć rzymskiego boga mórz?', 'Neptun to rzymski bóg mórz. Niebieskiej planecie nadano jego imię.'],
    ['Która planeta ma księżyc Tryton, który krąży „tyłem”?', 'Tryton, księżyc Neptuna, krąży w przeciwną stronę — nie tak, jak obraca się sama planeta.'],
    ['Której planety nigdy nie widać bez teleskopu — nawet w najciemniejszą noc?', 'Neptun jest tak daleko, że można go zobaczyć tylko przez teleskop.'],
    ['Na której planecie od dnia jej odkrycia minął dopiero jeden rok?', 'Neptuna odkryto w 1846 roku, a pierwsze pełne okrążenie Słońca zakończył dopiero w 2011 roku.'],
    ['Która planeta jest czwarta pod względem wielkości, ale cięższa od Urana?', 'Neptun jest trochę węższy od Urana, za to cięższy od niego.'],
    ['Która planeta jest najdalej od Ziemi?', 'Neptun to najdalsza od nas planeta: dzieli nas od niego ponad cztery miliardy kilometrów.'],
    ['Na której planecie zauważono Wielką Ciemną Plamę — burzę wielkości Ziemi?', 'Wielka Ciemna Plama na Neptunie to olbrzymia burza. To znika, to pojawia się znowu.'],
    ['Obok której planety Voyager 2 przeleciał na końcu, zanim opuścił Układ Słoneczny?', 'Voyager 2 to jedyna sonda, która odwiedziła Neptuna. Potem poleciała ku gwiazdom.'],
    ['Na której planecie pory roku trwają po czterdzieści lat?', 'Rok na Neptunie jest tak długi, że każda pora roku trwa tam ponad czterdzieści ziemskich lat.'],
  ],
};

export const pl: AstronomyTexts = {
  cards: {
    title: 'Astronomia',
    games: {
      planets: {
        label: 'Parada planet',
        blurb: 'Ustaw planety od Słońca i według wielkości, a o każdej poznaj mnóstwo ciekawostek',
        intro: 'Wokół Słońca krąży osiem planet. Ustaw je po kolei: najpierw tę, która jest najbliżej Słońca!',
      },
      constellations: {
        label: 'Kosmiczny nawigator',
        blurb: 'Łącz gwiazdy po kolei, rysuj gwiazdozbiory i szukaj ich na gwiaździstym niebie',
        intro: 'Gwiazdy na niebie układają się w obrazki — gwiazdozbiory. Dotykaj gwiazd po kolei, od najmniejszej liczby, a zobaczysz, co powstanie!',
      },
    },
  },
  introFor: {
    planets: (step, quizFrom) => {
      if (step === 2) return 'Teraz dalekie planety olbrzymy: Jowisz, Saturn, Uran i Neptun.';
      if (step === 4) return 'Planety bywają malutkie i olbrzymie. Ustaw je według wielkości: od najmniejszej do największej!';
      if (step === 7) return 'Każda planeta jest w czymś wyjątkowa. Połącz wskazówkę z planetą, o której opowiada.';
      if (step === quizFrom) return 'Teraz pytania o planety: gdzie jest gorąco, a gdzie zimno, gdzie jest woda, ile trwa dzień i rok. Dotknij planety, o którą chodzi!';
      return undefined;
    },
    constellations: (step, sky) => {
      if (step === 3) return 'Teraz liczenie nie zaczyna się od jedynki. Znajdź najmniejszą liczbę i idź dalej po kolei.';
      if (step === 6) return 'Gwiazdozbiory są coraz większe, a na gwiazdach są teraz litery. Łącz je według alfabetu!';
      if (step === 11) return 'Teraz liczymy co dwa: dwa, cztery, sześć, osiem…';
      if (step === 13) return 'A teraz dziesiątkami: dziesięć, dwadzieścia, trzydzieści…';
      if (step === sky + 1) return 'Teraz na niebie jest dużo gwiazd i nie ma na nich liczb. Gwiazdy gwiazdozbioru są trochę większe od pozostałych. Znajdź je i połącz palcem!';
      if (step === sky + 7) return 'Gwiazd na niebie jest więcej, a gwiazdy gwiazdozbioru nie są już takie duże. Patrz uważnie!';
      if (step === sky + 13) return 'Najtrudniejsze niebo: gwiazdy gwiazdozbioru są tylko odrobinę większe od pozostałych.';
      return undefined;
    },
  },
  planet: (id) => PLANETS[id] ?? id,
  sun: 'Słońce',
  lineUp: {
    sun: {
      ask: 'Ustaw planety: od najbliższej Słońca do najdalszej.',
      ends: ['przy Słońcu', 'najdalej'],
      hint: (first, all) => `Pierwsza stoi planeta najbliższa Słońca: ${first}. Wszystkie planety po kolei: ${all}.`,
      fact: (names) => `Od Słońca te planety stoją tak: ${names}.`,
    },
    size: {
      ask: 'Ustaw planety według wielkości: od najmniejszej do największej.',
      ends: ['najmniejsza', 'największa'],
      hint: (smallest, biggest) => `Najmniejszą planetą jest tutaj ${smallest}, a największą — ${biggest}.`,
      fact: (names) => `Od najmniejszej do największej: ${names}.`,
    },
  },
  feature: (id) => FEATURES[id] ?? id,
  features: {
    ask: 'Połącz każdą wskazówkę z jej planetą.',
    hint: (feature, planet) => `„${feature}” — to ${planet}.`,
    fact: (feature, planet) => `${feature} — to ${planet}.`,
  },
  quiz: (id) => {
    const [, planet, at] = /^([a-z]+)(\d+)$/.exec(id) ?? [];
    const [question = '', fact = ''] = QUIZ[planet]?.[Number(at)] ?? [];
    return { question, fact };
  },
  quizHint: (planet, place) => `Nazwa tej planety zaczyna się na literę „${planet[0]}”. Od Słońca jest ${ordinalWords(place + 1, 'f')}.`,
  alphabet: [...'AĄBCĆDEĘFGHIJKLŁMNŃOÓPRSŚTUWYZŹŻ'],
  figure: (at) => ({ name: FIGURES[at][0], fact: FIGURES[at][2] }),
  sky: {
    abc: (first, last) => `Połącz gwiazdy według alfabetu: od ${first} do ${last}.`,
    order: (first, last) => `Połącz gwiazdy po kolei: od ${first} do ${last}.`,
    skip: (by, firstThree, last) => `Połącz gwiazdy, licząc ${by === 2 ? 'co dwa' : 'dziesiątkami'}: ${firstThree} — i dalej aż do ${last}.`,
    hintAbc: (first, firstFour) => `Zacznij od litery ${first}. Dalej idź według alfabetu: ${firstFour}…`,
    hint: (first, nextThree) => `Zacznij od gwiazdy z liczbą ${first}. Dalej: ${nextThree}…`,
    is: (at) => `To ${FIGURES[at][0]}!`,
  },
  find: {
    ask: (at) => `Znajdź na niebie ${FIGURES[at][1]}. Te gwiazdy są trochę większe od pozostałych — połącz je palcem.`,
    hint: (_at, stars) => `W tym gwiazdozbiorze ${stars >= 2 && stars <= 4 ? `są ${stars} gwiazdy` : `jest ${stars} gwiazd`}. Migoczą — dotknij każdej.`,
  },
};
