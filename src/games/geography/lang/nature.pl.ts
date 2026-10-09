import { own } from '@/core/lang/marks';
import type { BiomeId } from '../content/data';
import { split } from './shared';

/** Animals and natural zones in Polish. */

/** The animals put on the continents: «gdzie mieszka …?» */
export const MAP_ANIMALS: Record<string, string> = {
  kangaroo: 'kangur', penguin: 'pingwin', lion: 'lew', panda: 'panda', llama: 'lama',
  bison: 'bizon', hedgehog: 'jeż', giraffe: 'żyrafa', koala: 'koala', tiger: 'tygrys',
};

/** An animal of a zone: `name|riddle|where it lives|two more stories` (the stories only for the later animals). */
export const ANIMALS = split({
  polar_bear: 'niedźwiedź polarny|Wielki biały zwierz, który chodzi po krach i łowi foki.|Niedźwiedź polarny żyje wśród lodu, a gęste futro go grzeje.',
  camel: 'wielbłąd|Ma jeden garb i potrafi długo iść przez piaski bez wody.|Wielbłąd może długo nie pić, dlatego dobrze mu na pustyni.',
  monkey: 'małpa|Zwinnie skacze z gałęzi na gałąź i lubi banany.|Małpa zwinnie skacze po gałęziach w dżungli.',
  dolphin: 'delfin|Mądry morski zwierz, który wyskakuje z wody i oddycha powietrzem.|Delfin żyje w oceanie, ale oddycha powietrzem.',
  seal: 'foka|Ma płetwy zamiast łap i odpoczywa na krach.|Foka nie marznie w lodowatej wodzie dzięki grubej warstwie tłuszczu.',
  parrot: 'papuga|Kolorowy ptak z zakrzywionym dziobem, który umie powtarzać słowa.|Kolorowe papugi żyją na drzewach w lesie tropikalnym.',
  scorpion: 'skorpion|Ma szczypce i zagięty ogon z kolcem na końcu.|Skorpion w dzień chowa się przed upałem pod kamieniami.',
  octopus: 'ośmiornica|Ma osiem ramion i trzy serca.|Ośmiornica ma osiem ramion i trzy serca!',
  arctic_hare: 'zając polarny|Uszatek w białym futerku, którego nie widać na śniegu.|Zając polarny jest biały, żeby chować się na śniegu.',
  tiger: 'tygrys|Największy kot na świecie — rudy w czarne paski.|Pręgowany tygrys chowa się wśród gęstych zarośli.',
  lizard: 'jaszczurka|Mały gad, który potrafi odrzucić własny ogon.|Jaszczurka lubi wygrzewać się na gorącym piasku.',
  whale: 'wieloryb|Największe zwierzę na Ziemi, które wypuszcza fontannę wody.|Wieloryb to największe zwierzę na Ziemi.',
  shark: 'rekin|Morski drapieżnik z ostrą płetwą na grzbiecie i wieloma rzędami zębów.|Rekiny żyły w oceanie jeszcze przed dinozaurami.',
  gorilla: 'goryl|Największa małpa, która bije się pięściami w pierś.|Goryl to największa małpa, żyje w afrykańskich lasach.',
  snake: 'wąż|Nie ma nóg, pełza i syczy.|Pustynne węże szybko suną po piasku.',
  arctic_fox: 'lis polarny|Lisek z dalekiej północy: zimą biały, a latem szarobrązowy.|Lis polarny ma bardzo ciepłe białe futro.',
  lion: 'lew|Król zwierząt z bujną grzywą.|Lew żyje na otwartych trawiastych równinach Afryki i poluje na stada.',
  zebra: 'zebra|Podobna do konia, ale cała w czarno-białe paski.|Zebry pasą się stadami na trawiastych równinach.',
  giraffe: 'żyrafa|Najwyższe zwierzę z długą szyją i w plamy.|Żyrafa sięga po liście z czubków pojedynczych drzew wśród traw.',
  elephant: 'słoń|Największe zwierzę lądowe z trąbą i wielkimi uszami.|Słonie wędrują po trawiastych równinach od wodopoju do wodopoju.',
  rhino: 'nosorożec|Ciężki zwierz o grubej skórze i z rogiem na nosie.|Nosorożec pasie się na równinach, gdzie jest dużo trawy.',
  brown_bear: 'niedźwiedź brunatny|Wielki brązowy zwierz, który lubi miód i zimą śpi w gawrze.|Niedźwiedź brunatny znajduje w lesie jagody, orzechy i zaciszną gawrę.',
  squirrel: 'wiewiórka|Ruda skoczka z puszystym ogonem, która chowa orzechy.|Wiewiórka mieszka na drzewach i je orzechy oraz szyszki.',
  wolf: 'wilk|Szary drapieżnik, który żyje w watasze i wyje do księżyca.|Wilcza wataha żyje i poluje wśród lasów.',
  hedgehog: 'jeż|Mały zwierzak w kolczastym futerku, który zwija się w kulkę.|Jeż szuka chrząszczy w leśnej ściółce i zimuje pod stertą liści.',
  owl: 'sowa|Nocny ptak z wielkimi oczami, który woła „hu-hu”.|Sowa mieszka w dziupli starego drzewa.',
  deer: 'jeleń|Smukły zwierz z rozgałęzionym porożem.|Jeleń chowa się wśród drzew i je liście oraz korę.',
  boar: 'dzik|Dzika świnia z kłami, która ryje ziemię w poszukiwaniu żołędzi.|Dzik ryje ziemię pod dębami, szukając żołędzi.',
  sea_turtle: 'żółw morski|Ma pancerz i płetwy, a jaja składa w piasku na plaży.|Żółw morski ma płetwy zamiast łap i całe życie pływa.',
  orangutan: 'orangutan|Wielka ruda małpa z bardzo długimi rękami.|Orangutan prawie nigdy nie schodzi z drzew lasu tropikalnego.',
  crab: 'krab|Ma szczypce i pancerz i chodzi bokiem.|Krab żyje na dnie morza i na wybrzeżu.',
  sloth: 'leniwiec|Najpowolniejszy zwierz: wisi na gałęzi głową w dół i prawie cały czas śpi.|Leniwiec całe życie wisi na gałęziach w wilgotnym lesie tropikalnym.',
  jellyfish: 'meduza|Przezroczysta, podobna do parasolki, z parzącymi czułkami.|Meduza prawie cała składa się z wody i płynie z prądem.',
  clownfish: 'błazenek|Pomarańczowa rybka w białe paski, która chowa się w ukwiale.|Błazenek żyje na ciepłych rafach koralowych.',
  squid: 'kałamarnica|Ma dziesięć ramion i ucieka, wypuszczając chmurkę atramentu.|Kałamarnica pływa w morskiej toni jak mała rakieta.',
  mountain_goat: 'kozica|Rogata skoczka, która wspina się po stromych skałach.|Kozica skacze po prawie pionowych skałach.',
  eagle: 'orzeł|Wielki drapieżny ptak o bystrym wzroku, który szybuje wysoko na niebie.|Orzeł buduje gniazdo na wysokich skałach.',
  llama: 'lama|Puszysta krewna wielbłąda bez garbu, która nosi ładunki w Andach.|Lama żyje wysoko w górach Ameryki Południowej — Andach.',
  mountain_ram: 'muflon|Ma wielkie zakręcone rogi i skacze z kamienia na kamień.|Muflon łatwo skacze z kamienia na kamień.',
  crocodile: 'krokodyl|Zielony zębaty gad, który leży w rzece jak kłoda.|Krokodyl żyje w ciepłych rzekach i bagnach lasu tropikalnego.|Krokodyl może godzinę leżeć pod wodą bez oddychania.|Krokodyle żyły na Ziemi już w czasach dinozaurów.',
  tree_frog: 'rzekotka|Mała kolorowa skoczka z lepkimi palcami, która mieszka na liściach.|Rzekotka mieszka na liściach wysoko w koronach lasu tropikalnego.|Na palcach rzekotki są lepkie poduszeczki — trzyma się nimi liści.|Najbarwniejsze żaby tropików są trujące: kolor ostrzega, że nie wolno ich dotykać.',
  morpho: 'motyl morfo|Ma wielkie niebieskie skrzydła, które błyszczą w słońcu.|Motyl morfo lata wśród drzew lasu tropikalnego.|Skrzydła motyla morfo są niebieskie i błyszczą jak metal.|Rozpiętość skrzydeł morfo jest jak dłoń dorosłego człowieka.',
  bat: 'nietoperz|Lata nocą, a śpi, zwisając głową w dół.|Największe nietoperze — rudawki — żyją w lasach tropikalnych i jedzą owoce.|Nietoperz to jedyny ssak, który potrafi naprawdę latać.|Nietoperze śpią w dzień, zwisając głową w dół.',
  peacock: 'paw|Ptak, który rozkłada ogon w ogromny barwny wachlarz.|Paw żyje w gęstych lasach gorących Indii.|Wspaniały ogon z „oczami” mają tylko samce pawi.|Paw rozkłada ogon jak wachlarz, żeby spodobać się pawicy.',
  leafcutter: 'mrówka grzybiarka|Maleńka robotnica, która niesie nad głową kawałek liścia.|Mrówki grzybiarki żyją w lasach tropikalnych Ameryki.|Mrówki grzybiarki noszą kawałki liści wiele razy cięższe od siebie.|Na liściach te mrówki hodują pod ziemią grzyby — i nimi się żywią.',
  hippo: 'hipopotam|Gruby zwierz z ogromną paszczą, który cały dzień siedzi w wodzie.|Hipopotam żyje w rzekach i jeziorach afrykańskiej sawanny.|W dzień hipopotam siedzi w wodzie, a nocą wychodzi paść się na trawie.|Hipopotam potrafi otworzyć paszczę szerzej niż jakiekolwiek inne zwierzę lądowe.',
  buffalo: 'bawół|Potężny czarny byk z szerokimi wygiętymi rogami.|Bawół afrykański pasie się w wielkich stadach na sawannie.|Bawoły trzymają się razem: takiego stada boi się zaatakować nawet lew.|Bawół lubi leżeć w błocie — tak ratuje się przed upałem i owadami.',
  kangaroo: 'kangur|Skacze na tylnych łapach i nosi malucha w torbie.|Kangur żyje na trawiastych równinach Australii.|Mama kangurzyca nosi malucha w torbie na brzuchu.|Kangur nie umie chodzić do tyłu.',
  grasshopper: 'konik polny|Zielony skoczek, który cyka w trawie.|Konik polny żyje w wysokiej trawie otwartych równin.|Konik polny skacze na odległość dwadzieścia razy większą niż jego ciało.|Konik polny „śpiewa”, pocierając skrzydełkiem o skrzydełko.',
  flamingo: 'flaming|Różowy ptak na długich nogach, który lubi stać na jednej.|Flamingi żyją na płytkich słonych jeziorach wśród afrykańskiej sawanny.|Flamingi różowieją od skorupiaków i glonów, które jedzą.|Flaming często stoi na jednej nodze — tak mniej marznie.',
  panda: 'panda|Czarno-biały niedźwiedź, który cały dzień żuje bambus.|Panda żyje w lasach bambusowych na zboczach gór w Chinach.|Panda je bambus prawie cały dzień.|Nowo narodzona panda jest różowa i waży tyle co jabłko.',
  koala: 'koala|Szary puszysty zwierzak, który siedzi na eukaliptusie i prawie cały czas śpi.|Koala żyje na eukaliptusach w lasach Australii.|Koala je tylko liście eukaliptusa i prawie nigdy nie pije.|Koala śpi nawet dwadzieścia godzin na dobę.',
  otter: 'wydra|Zwinna pływaczka z gęstym futrem, która łowi ryby w rzece.|Wydra żyje nad leśnymi rzekami i jeziorami.|Wydra świetnie pływa i łowi ryby pod wodą.|Futro wydry jest tak gęste, że skóra pod nim nie moknie.',
  beaver: 'bóbr|Budowniczy tam z płaskim ogonem i mocnymi zębami.|Bóbr żyje na leśnych rzekach i buduje tam tamy.|Bóbr przegryza zębami pień drzewa.|Wejście do bobrowego żeremia jest ukryte pod wodą.',
  badger: 'borsuk|Ma biały pyszczek z dwoma czarnymi pasami i mieszka w norze.|Borsuk żyje w lesie, w głębokiej norze z wieloma korytarzami.|Borsuk to wielki czyścioch: regularnie zmienia ściółkę w swojej norze.|Zimą borsuk śpi w norze, choć w ciepłe dni może się budzić.',
  skunk: 'skunks|Czarno-biały zwierzak, który broni się bardzo nieprzyjemnym zapachem.|Skunks żyje w lasach Ameryki Północnej.|Kiedy skunks się boi, pryska bardzo śmierdzącą cieczą.|Czarno-białe ubarwienie skunksa ostrzega: „Nie podchodź!”',
  raccoon: 'szop pracz|Ma czarną „maskę” na pyszczku i ogon w paski.|Szop pracz żyje w lesie blisko wody i śpi w dziuplach.|Szop pracz płucze jedzenie w wodzie, zanim je zje.|Na pyszczku szopa jest czarna „maska” jak u rozbójnika.',
  forest_mouse: 'mysz leśna|Maleńki gryzoń z długim ogonkiem, który gromadzi nasiona.|Mysz leśna mieszka w norce pod korzeniami drzew.|Mysz leśna gromadzi na zimę nasiona i orzeszki.|Mysz leśna dobrze się wspina i potrafi wejść na drzewo.',
  raven: 'kruk|Wielki czarny ptak, który woła „kra” i jest bardzo mądry.|Kruk buduje gniazdo na wysokich drzewach w głębi lasu.|Kruk należy do najmądrzejszych ptaków: potrafi rozwiązywać łamigłówki.|Kruki żyją w parach i nie rozstają się przez całe życie.',
  snail: 'ślimak|Pełznie bardzo powoli i nosi domek na grzbiecie.|Ślimak żyje w wilgotnej leśnej trawie i pod liśćmi.|Ślimak nosi swój domek na grzbiecie.|Oczy ślimaka są na końcach długich czułków.',
  bee: 'dzika pszczoła|Pasiasta robotnica, która zbiera nektar i robi miód.|Dzikie pszczoły mieszkają w dziuplach leśnych drzew.|Żeby zrobić łyżkę miodu, pszczoły odwiedzają tysiące kwiatów.|Pszczoła opowiada siostrom, gdzie są kwiaty, specjalnym tańcem.',
  spider: 'pająk krzyżak|Ma osiem nóg i plecie pajęczynę.|Pająk krzyżak plecie pajęczynę między gałęziami w lesie.|Pająk ma osiem nóg, więc nie jest owadem.|Pajęczyna jest mocniejsza niż stalowa nić tej samej grubości.',
  ladybug: 'biedronka|Czerwony chrząszczyk w czarne kropki na grzbiecie.|Biedronka żyje na leśnych polanach i na skraju lasu.|Biedronka zjada mszyce i tak ratuje rośliny.|Jaskrawe kropki biedronki ostrzegają ptaki, że jest niesmaczna.',
  moose: 'łoś|Największy jeleniowaty, z porożem podobnym do łopat.|Łoś żyje w gęstych północnych lasach w pobliżu bagien.|Łoś jest największy z jeleniowatych: jest wyższy od dorosłego człowieka.|Poroże łosia przypomina szerokie łopaty, a co roku je zrzuca.',
  wisent: 'żubr|Najcięższy zwierz Europy — kudłaty leśny byk.|Żubr żyje w starych lasach Europy' + own(' — także w Polsce, w Puszczy Białowieskiej') + '.|Żubr to najcięższe zwierzę lądowe Europy.|Kiedyś żubry prawie wyginęły, ale ludzie uratowali je w rezerwatach.',
  turkey: 'dziki indyk|Wielki ptak z czerwonym „koralem”, który rozkłada ogon jak wachlarz.|Dziki indyk żyje w lasach Ameryki Północnej.|Dziki indyk umie latać i nocuje na drzewach.|Indyk samiec rozkłada ogon jak wachlarz, podobnie jak paw.',
  lobster: 'homar|Morski rak z dwiema wielkimi szczypcami i długimi wąsami.|Homar żyje na kamienistym dnie morza.|Homar ma dwie wielkie szczypce: jedną miażdży, drugą tnie.|Homar rośnie całe życie i co jakiś czas zrzuca ciasny pancerz.',
  shrimp: 'krewetka|Mały skorupiak z długimi wąsami, który pływa w ławicach.|Krewetki żyją w morzu w wielkich ławicach.|Serce krewetki znajduje się w głowie.|Krewetka pływa do tyłu, gwałtownie podginając ogon.',
  puffer: 'rozdymka|Ryba, która ze strachu nadyma się jak kolczasta piłka.|Rozdymka żyje w ciepłych morzach wśród korali.|Kiedy rozdymka się boi, nadyma się jak kolczasta piłka.|Rozdymka jest bardzo trująca, dlatego drapieżniki jej nie ruszają.',
  tuna: 'tuńczyk|Wielka srebrzysta ryba — jedna z najszybszych w oceanie.|Tuńczyk całe życie pływa po otwartym oceanie.|Tuńczyk to jeden z najszybszych pływaków oceanu.|Tuńczyk nigdy się nie zatrzymuje: płynie nawet we śnie.',
  sperm_whale: 'kaszalot|Olbrzymi zębaty wieloryb z ogromną kanciastą głową.|Kaszalot żyje w oceanie i nurkuje w najciemniejsze głębiny.|Kaszalot nurkuje na głębokość ponad kilometra — po olbrzymie kałamarnice.|Kaszalot ma największy mózg ze wszystkich zwierząt na Ziemi.',
  penguin: 'pingwin|Ptak w czarnym „fraku”, który nie lata, za to świetnie pływa.|Pingwiny żyją na wybrzeżu Antarktydy i żywią się w zimnym oceanie.|Pingwin to ptak, który nie lata, za to świetnie pływa.|Tata pingwin ogrzewa jajo na łapach, pod fałdą skóry.',
  oyster: 'ostryga|Mieszka w muszli z dwóch połówek i nigdzie się nie rusza.|Ostryga żyje na dnie morza, przyrośnięta muszlą do kamienia.|Jeśli do muszli wpadnie ziarenko piasku, niektóre małże hodują wokół niego perłę.|Ostryga przecedza przez siebie morską wodę i tak ją oczyszcza.',
  hermit: 'krab pustelnik|Nosi na sobie cudzą muszlę zamiast domku.|Krab pustelnik żyje na dnie morza w cudzej pustej muszli.|Kiedy krab pustelnik podrośnie, szuka sobie większej muszli.|Swoją muszlę krab pustelnik wszędzie nosi na sobie.',
  coral: 'koralowiec|Wygląda jak kamienny krzaczek, a naprawdę to mnóstwo maleńkich zwierzątek.|Koralowce żyją w ciepłych, przejrzystych morzach i budują rafy.|Koralowiec przypomina kamień albo roślinę, ale to maleńkie zwierzątka.|Na rafie koralowej żyje więcej różnych ryb niż gdziekolwiek indziej w oceanie.',
  lemming: 'leming|Mały puszysty gryzoń tundry, podobny do chomika.|Leming żyje w zimnej tundrze nad Oceanem Arktycznym.|Zimą leming drąży korytarze pod śniegiem, gdzie jest cieplej.|Lemingami żywią się lisy polarne i sowy śnieżne.',
  snow_goose: 'gęś śnieżna|Biały wędrowny ptak, który leci kluczem i gęga.|Gęś śnieżna wychowuje pisklęta w zimnej tundrze na dalekiej północy.|Na zimę gęsi śnieżne odlatują daleko na południe ogromnymi stadami.|W locie gęsi ustawiają się w klucz — tak łatwiej lecieć.',
  bactrian: 'wielbłąd dwugarbny|Ma dwa garby i gęstą sierść.|Wielbłąd dwugarbny żyje na zimnych pustyniach Azji.|W garbach wielbłąda nie ma wody, tylko zapas tłuszczu.|Gęsta sierść chroni wielbłąda dwugarbnego i przed upałem, i przed mrozem.',
  scarab: 'skarabeusz|Chrząszcz, który toczy przed sobą wielką kulkę.|Skarabeusz żyje w gorących piaskach.|Skarabeusz toczy przed sobą kulkę o wiele większą od siebie.|W starożytnym Egipcie skarabeusza uważano za świętego chrząszcza.',
  jerboa: 'skoczek pustynny|Maleńki skoczek z długimi tylnymi łapkami i pędzelkiem na ogonie.|Skoczek pustynny żyje na pustyni i w dzień chowa się w chłodnej norze.|Skoczek pustynny skacze na długich tylnych łapkach jak mały kangur.|Skoczek pustynny może wcale nie pić: wystarcza mu wilgoć z jedzenia.',
  yak: 'jak|Kudłaty górski byk z sierścią aż do ziemi.|Jak żyje bardzo wysoko w górach Tybetu.|Długa gęsta sierść jaka zwisa prawie do ziemi i grzeje w mróz.|Jaki pomagają ludziom nosić ładunki górskimi ścieżkami.',
  snow_leopard: 'pantera śnieżna|Cętkowany górski kot z bardzo długim puszystym ogonem.|Pantera śnieżna żyje wśród skał i śniegów najwyższych gór Azji.|Długim puszystym ogonem pantera śnieżna okrywa się jak kołdrą.|Pantera śnieżna skacze przez przepaście szerokie jak pokój.',
});

interface Zone {
  name: string;
  /** «to dżungla» */
  it: string;
  /** «w dżungli» */
  where: string;
  no: string;
  signs: string[];
  facts: string[];
}

export const ZONES: Record<BiomeId, Zone> = {
  arctic: {
    name: 'Arktyka', it: 'Arktyka', where: 'w Arktyce', no: 'Brr, tu jest za zimno!',
    signs: [
      'Tu prawie zawsze jest zima: śnieg, lód i siarczysty mróz.',
      'Tu latem słońce nie zachodzi, a zimą trwa długa noc polarna.',
      'Tu ziemia nie rozmarza nawet latem, a drzewa nie rosną wcale.',
      'Tu po morzu pływają kry, a na niebie świeci zorza polarna.',
      'Tu najcieplejszy miesiąc jest zimniejszy niż nasza wiosna.',
      'Tu ludzie jeżdżą saniami zaprzężonymi w psy albo renifery.',
    ],
    facts: [
      'Arktyka leży wokół bieguna północnego — na samym „czubku” Ziemi.',
      'W Arktyce pod biegunem nie ma lądu: jest tam ocean pokryty grubym lodem.',
      'Arktyczne zwierzęta mają białe futro, żeby chować się na śniegu.',
      'Latem w Arktyce słońce nie zachodzi przez kilka miesięcy — to dzień polarny.',
    ],
  },
  jungle: {
    name: 'Dżungla', it: 'dżungla', where: 'w dżungli', no: 'Oj, tu jest za wilgotno i za ciasno!',
    signs: [
      'Tu zawsze jest ciepło i codziennie pada deszcz, a drzewa rosną tak gęsto, że na dole panuje półmrok.',
      'Tu z gałęzi zwisają liany, a na drzewach żyje więcej zwierząt niż na ziemi.',
      'Tu nie ma zimy: cały rok jest gorąco i wilgotno jak w szklarni.',
      'Tu drzewa są tak wysokie, że ich korony tworzą zielony dach.',
      'Tu rośnie kakaowiec, z którego robi się czekoladę, i banany.',
      'Tu po południu prawie codziennie grzmi burza.',
    ],
    facts: [
      'Dżungla to las tropikalny. Żyje w nim ponad połowa wszystkich gatunków zwierząt na Ziemi.',
      'W dżungli drzewa rosną piętrami: na dole jest ciemno, a u góry — słońce i ptaki.',
      'Największy las tropikalny rośnie wzdłuż rzeki Amazonki w Ameryce Południowej.',
      'W dżungli deszcz pada prawie codziennie, dlatego zawsze jest tam wilgotno.',
    ],
  },
  desert: {
    name: 'Pustynia', it: 'pustynia', where: 'na pustyni', no: 'Uff, tu jest za gorąco i za sucho!',
    signs: [
      'Tu w dzień panuje straszny upał, prawie nie ma wody, a dookoła jest piasek i kamienie.',
      'Tu deszcz może nie padać latami, a z roślin rosną tylko kolczaste kaktusy.',
      'Tu w dzień piasek jest gorący jak patelnia, a nocą bywa mróz.',
      'Tu wiatr usypuje wysokie piaszczyste wzgórza — wydmy.',
      'Tu wodę można znaleźć tylko w oazie.',
      'Tu rośliny gromadzą wodę w grubych łodygach i mają kolce zamiast liści.',
    ],
    facts: [
      'Największa gorąca pustynia świata to Sahara w Afryce.',
      'W dzień na pustyni jest bardzo gorąco, a nocą bywa naprawdę zimno.',
      'Miejsce na pustyni, gdzie jest woda i rosną palmy, nazywa się oazą.',
      'Pustynne zwierzęta wychodzą przeważnie nocą, gdy upał słabnie.',
    ],
  },
  ocean: {
    name: 'Ocean', it: 'ocean', where: 'w oceanie', no: 'Bul-bul! Ja tak nie umiem pływać!',
    signs: [
      'Tu wszędzie jest słona woda — głęboka, z falami i prądami.',
      'Tu są rafy koralowe, a na dnie — prawdziwe podwodne góry.',
      'Tu nie ma ziemi pod nogami — tylko woda aż po horyzont.',
      'Tu dwa razy na dobę woda podchodzi do brzegu i cofa się z powrotem.',
      'Tu podczas sztormu wznoszą się fale wysokie jak dom.',
      'Tu w głębinie zawsze jest ciemno i zimno, a niektóre ryby same świecą.',
    ],
    facts: [
      'Oceany pokrywają większą część naszej planety — dlatego Ziemia z kosmosu jest niebieska.',
      'Woda w oceanie jest słona, nie można jej pić.',
      'Najgłębsze miejsca oceanu są ciemne i zimne — nie dociera tam słońce.',
      'W oceanie żyją i największe zwierzęta Ziemi — wieloryby, i całkiem maleńki plankton.',
    ],
  },
  savanna: {
    name: 'Sawanna', it: 'sawanna', where: 'na sawannie', no: 'Oj, tu są same trawy — i wcale nie ma gdzie się schować!',
    signs: [
      'Tu są bezkresne równiny z wysoką trawą, na których gdzieniegdzie stoją pojedyncze drzewa.',
      'Tu przez pół roku leją deszcze, a przez pół roku trwa susza, i wielkie stada wędrują w poszukiwaniu wody.',
      'Tu jest gorąco cały rok, a drzewa rosną daleko od siebie.',
      'Tu w porze suchej trawa żółknie i często wybuchają pożary.',
      'Tu rośnie baobab — drzewo z bardzo grubym pniem.',
      'Tu przy wodopoju zbierają się razem słonie, zebry i antylopy.',
    ],
    facts: [
      'Sawanna to trawiasta równina w ciepłych krajach. Najbardziej znane sawanny są w Afryce.',
      'Na sawannie żyją największe zwierzęta lądowe: słonie, żyrafy, nosorożce.',
      'W porze suchej trawa na sawannie żółknie, a rzeki robią się płytkie.',
      'Drzewa sawanny — baobaby i akacje — gromadzą wodę na suchą porę.',
    ],
  },
  forest: {
    name: 'Las', it: 'las', where: 'w lesie', no: 'Oj, tu jest tyle drzew, że się zgubię!',
    signs: [
      'Tu rosną dęby, sosny i świerki, jesienią opadają liście, a zimą leży śnieg.',
      'Tu są wszystkie cztery pory roku, a do tego grzyby, jagody i szyszki.',
      'Tu wiosną rozwijają się liście, a jesienią żółkną i opadają.',
      'Tu pod nogami jest miękki mech, a w górze szumią korony drzew.',
      'Tu zimą niedźwiedzie i jeże śpią, a wiosną się budzą.',
      'Tu można usłyszeć dzięcioła i kukułkę.',
    ],
    facts: [
      'Lasy nazywa się płucami planety: drzewa oczyszczają powietrze.',
      'W lesie jest wiele kryjówek: dziuple, nory, gęste krzaki.',
      'Jesienią las liściasty robi się żółty i czerwony, a iglasty zostaje zielony.',
      own('Najstarszy las w Polsce to Puszcza Białowieska — rosną w niej dęby, które mają kilkaset lat.'),
    ],
  },
  mountains: {
    name: 'Góry', it: 'góry', where: 'w górach', no: 'Och, tu jest za wysoko i strasznie stromo!',
    signs: [
      'Tu są strome skały, na szczytach cały rok leży śnieg, a powietrze jest zimne.',
      'Tu im wyżej się wchodzi, tym jest zimniej, a zamiast drzew są same kamienie.',
      'Tu powietrze jest tak rzadkie, że bez przyzwyczajenia trudno oddychać.',
      'Tu ze zboczy płyną szybkie zimne strumienie i spadają wodospady.',
      'Tu ze zbocza może zejść lawina śnieżna.',
      'Tu droga wije się serpentynami, a ścieżki biegną nad przepaściami.',
    ],
    facts: [
      'Najwyższa góra świata to Mount Everest.' + own(' Najwyższy szczyt Polski to Rysy w Tatrach.'),
      'Na wysokich szczytach śnieg nie topnieje nawet latem.',
      'Im wyżej w górach, tym mniej drzew: na szczytach są tylko kamienie i mech.',
      'Górskie zwierzęta świetnie wspinają się po skałach i mają gęste futro.',
    ],
  },
};
