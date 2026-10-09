import { split } from './shared';

/** Famous buildings, day and night, and the time in other cities — in Polish. */

/** `the name under the picture|the name after «zobaczyć» (accusative)|the capital|the country (genitive)`. */
export const LANDMARKS = split({
  paris: 'Wieża Eiffla|wieżę Eiffla|Paryż|Francji',
  kyiv: 'Sobór Sofijski|sobór Sofijski|Kijów|Ukrainy',
  london: 'Big Ben|Big Bena|Londyn|Wielkiej Brytanii',
  rome: 'Koloseum|Koloseum|Rzym|Włoch',
  cairo: 'Piramidy|piramidy|Kair|Egiptu',
  washington: 'Biały Dom|Biały Dom|Waszyngton|Stanów Zjednoczonych',
  athens: 'Akropol|Akropol|Ateny|Grecji',
  tokyo: 'Wieża Tokijska|Wieżę Tokijską|Tokio|Japonii',
  berlin: 'Brama Brandenburska|Bramę Brandenburską|Berlin|Niemiec',
  beijing: 'Zakazane Miasto|Zakazane Miasto|Pekin|Chin',
  copenhagen: 'Pomnik Małej Syrenki|pomnik Małej Syrenki|Kopenhaga|Danii',
  warsaw: 'Zamek Królewski|Zamek Królewski|Warszawa|Polski',
});

export const LANDMARK_FACTS = split({
  paris: 'Wieża Eiffla stoi w Paryżu — stolicy Francji.|Wieżę Eiffla zbudowano w 1889 roku na Wystawę Światową.|Wieża Eiffla ma ponad trzysta metrów wysokości.|Przez czterdzieści lat wieża Eiffla była najwyższą budowlą świata.|Wieżę nazwano na cześć inżyniera Gustave’a Eiffla.|Wieżę Eiffla złożono z osiemnastu tysięcy metalowych części.|Najpierw wieżę chciano rozebrać po dwudziestu latach, ale przydała się jako antena radiowa.|Żeby pomalować wieżę Eiffla, potrzeba sześćdziesięciu ton farby.|Latem w słońcu wieża robi się o kilka centymetrów wyższa: metal rozszerza się od ciepła.|Co wieczór wieża Eiffla migocze tysiącami światełek.',
  kyiv: 'Sobór Sofijski stoi w Kijowie — stolicy Ukrainy.|Sobór Sofijski zbudowano za księcia Jarosława Mądrego prawie tysiąc lat temu.|W soborze Sofijskim zachowały się mozaiki i freski, które mają setki lat.|Najsłynniejsza mozaika soboru przedstawia Matkę Bożą z rękami wzniesionymi do modlitwy.|W soborze Sofijskim była pierwsza biblioteka Rusi Kijowskiej.|W soborze Sofijskim pochowano księcia Jarosława Mądrego.|Sobór Sofijski ma trzynaście kopuł.|Dzwonnica soboru jest błękitna i widać ją z daleka.|Sobór Sofijski w Kijowie jest wpisany na listę światowego dziedzictwa UNESCO.|Na ścianach soboru zachowały się napisy, które ludzie wydrapali setki lat temu.',
  london: 'Big Ben stoi w Londynie — stolicy Wielkiej Brytanii.|Big Ben to tak naprawdę nazwa wielkiego dzwonu wewnątrz wieży.|Sama wieża z zegarem nazywa się Wieżą Elżbiety.|Dzwon Big Ben waży ponad trzynaście ton.|Zegar na wieży ma cztery tarcze.|Wskazówka minutowa tego zegara ma ponad cztery metry długości.|Zegar na wieży chodzi od 1859 roku.|Dokładność zegara poprawia się starymi monetami kładzionymi na wahadle.|Żeby wejść na wieżę, trzeba pokonać ponad trzysta schodów.|Bicia Big Bena Brytyjczycy słuchają w noc sylwestrową.',
  rome: 'Koloseum stoi w Rzymie — stolicy Włoch.|Koloseum ma prawie dwa tysiące lat.|Koloseum mieściło pięćdziesiąt tysięcy widzów.|Na arenie Koloseum walczyli gladiatorzy.|Koloseum zbudowano w niecałe dziesięć lat.|W upał nad widzami Koloseum rozpinano ogromny daszek z płótna.|Pod areną Koloseum były korytarze i klatki dla zwierząt.|Koloseum miało osiemdziesiąt wejść, więc widzowie wchodzili bardzo szybko.|Część kamieni z Koloseum zabrano później na inne budowle.|Koloseum to największy amfiteatr zbudowany w starożytności.',
  cairo: 'Piramidy stoją pod Kairem — stolicą Egiptu.|Egipskie piramidy mają ponad cztery i pół tysiąca lat.|Piramidy to grobowce faraonów.|Największa piramida to piramida Cheopsa.|Piramidę Cheopsa zbudowano z ponad dwóch milionów kamiennych bloków.|Przez prawie cztery tysiące lat piramida Cheopsa była najwyższą budowlą świata.|Piramidy to jedyny z siedmiu cudów świata starożytnego, który przetrwał.|Obok piramid leży Wielki Sfinks — lew z głową człowieka.|Kiedyś piramidy były pokryte gładkim białym kamieniem i lśniły w słońcu.|Piramidy budowano bez dźwigów i maszyn — tylko rękami i prostymi narzędziami.',
  washington: 'Biały Dom stoi w Waszyngtonie — stolicy Stanów Zjednoczonych.|W Białym Domu mieszka i pracuje prezydent Stanów Zjednoczonych.|Biały Dom ma ponad sto trzydzieści pokoi.|Pierwszy prezydent zamieszkał w Białym Domu w 1800 roku.|Miasto Waszyngton nazwano na cześć pierwszego prezydenta Stanów Zjednoczonych.|Gabinet prezydenta w Białym Domu ma owalny kształt i nazywa się Gabinetem Owalnym.|Żeby pomalować Biały Dom, potrzeba ponad dwóch tysięcy litrów białej farby.|W Białym Domu jest sala kinowa, basen i kręgielnia.|Co roku wiosną na trawniku Białego Domu dzieci toczą wielkanocne jajka.|Biały Dom jest narysowany na banknocie dwudziestodolarowym.',
  athens: 'Akropol stoi w Atenach — stolicy Grecji.|Akropol to wzgórze ze starożytnymi świątyniami nad miastem.|Najsłynniejsza świątynia Akropolu to Partenon.|Partenon ma prawie dwa i pół tysiąca lat.|Partenon zbudowano na cześć bogini Ateny.|Świątynie Akropolu zbudowano z białego marmuru.|Według legendy bogini Atena podarowała miastu drzewo oliwne.|Słowo „akropol” znaczy „górne miasto”.|W Atenach narodziły się teatr i demokracja.|Pierwsze nowożytne igrzyska olimpijskie odbyły się w Atenach w 1896 roku.',
  tokyo: 'Wieża Tokijska stoi w Tokio — stolicy Japonii.|Wieża Tokijska przypomina wieżę Eiffla, ale jest trochę wyższa.|Wieżę Tokijską pomalowano na biało i pomarańczowo, żeby dobrze widziały ją samoloty.|Wieżę Tokijską zbudowano w 1958 roku.|Z Wieży Tokijskiej w pogodny dzień widać górę Fudżi.|Wieża Tokijska nadaje sygnały telewizyjne i radiowe.|Tokio to jedno z największych miast świata.|W Japonii często zdarzają się trzęsienia ziemi, dlatego Wieżę Tokijską zbudowano bardzo mocną.|Wieczorem Wieża Tokijska świeci ciepłym pomarańczowym światłem.|Japonię, gdzie stoi Wieża Tokijska, nazywa się Krajem Kwitnącej Wiśni.',
  berlin: 'Brama Brandenburska stoi w Berlinie — stolicy Niemiec.|Brama Brandenburska ma ponad dwieście lat.|Na szczycie bramy stoi rydwan zaprzężony w cztery konie.|Rydwanem na bramie powozi bogini zwycięstwa.|Brama Brandenburska ma pięć przejazdów między kolumnami.|Kiedyś Brama Brandenburska była wjazdem do miasta.|Przez wiele lat obok bramy stał mur, który dzielił Berlin na dwie części.|Kiedy mur runął, Brama Brandenburska stała się symbolem jedności Niemiec.|Brama Brandenburska jest przedstawiona na niemieckich monetach euro.|Przy Bramie Brandenburskiej berlińczycy witają Nowy Rok.',
  beijing: 'Zakazane Miasto leży w Pekinie — stolicy Chin.|Zakazane Miasto to pałac chińskich cesarzy.|Zakazane Miasto ma ponad sześćset lat.|W Zakazanym Mieście jest prawie tysiąc budynków.|Zwykłym ludziom nie wolno było kiedyś tu wchodzić — dlatego miasto nazwano Zakazanym.|Dachy Zakazanego Miasta są pokryte żółtą dachówką: żółty był kolorem cesarza.|Zakazane Miasto otaczają wysoki mur i fosa z wodą.|W Zakazanym Mieście mieszkało dwudziestu czterech cesarzy.|Dziś w Zakazanym Mieście jest muzeum.|Zakazane Miasto to największy zespół pałacowy na świecie.',
  copenhagen: 'Pomnik Małej Syrenki stoi w Kopenhadze — stolicy Danii.|Mała Syrenka to bohaterka baśni Hansa Christiana Andersena.|Pomnik Małej Syrenki siedzi na kamieniu tuż nad morzem.|Pomnik Małej Syrenki ma ponad sto lat.|Pomnik Małej Syrenki jest nieduży — ma trochę ponad metr wysokości.|Pomnik Małej Syrenki zrobiono z brązu.|Mała Syrenka jest symbolem Kopenhagi.|Andersen, który wymyślił Małą Syrenkę, mieszkał i pisał baśnie w Kopenhadze.|W Danii, gdzie siedzi Mała Syrenka, wymyślono klocki Lego.|W Kopenhadze jest więcej rowerów niż samochodów.',
  warsaw: 'Zamek Królewski stoi w Warszawie — stolicy Polski.|W Zamku Królewskim mieszkali polscy królowie.|Zamek Królewski stoi przy placu Zamkowym na Starym Mieście.|Podczas wojny zamek zburzono, a potem odbudowano od nowa.|Zamek Królewski odbudowano za pieniądze ofiarowane przez ludzi z całej Polski.|Przed zamkiem stoi wysoka kolumna króla Zygmunta.|Na wieży Zamku Królewskiego jest zegar.|Dziś w Zamku Królewskim jest muzeum.|Stare Miasto w Warszawie jest wpisane na listę dziedzictwa UNESCO.|Symbolem Warszawy jest Syrenka z mieczem i tarczą.',
});

/** Day or night: `the city after «w» (locative)|why`. */
export const DAY_NIGHT = split({
  la: 'Los Angeles|Los Angeles leży po drugiej stronie Ziemi i słońce jeszcze tam nie dotarło.',
  london: 'Londynie|Londyn jest całkiem blisko Kijowa, więc tam też jest dzień.',
  delhi: 'Delhi|Indie leżą trochę dalej na wschód, tam też świeci słońce.',
  honolulu: 'Honolulu na Hawajach|Hawaje leżą daleko na Oceanie Spokojnym — tam jest teraz głęboka noc.',
  sydney_n: 'Sydney|Kiedy w Kijowie jest północ, w Australii jest już ranek nowego dnia.',
  la_n: 'Los Angeles|Kiedy w Kijowie jest północ, w Los Angeles trwa jeszcze dzień.',
  london_n: 'Londynie|Londyn jest niedaleko, więc tam też jest teraz noc.',
  warsaw_n: 'Warszawie|Warszawa leży blisko Kijowa, tam też jest noc.',
  paris: 'Paryżu|Paryż leży niedaleko Kijowa, w Europie — tam też jest dzień.',
  sydney: 'Sydney|Kiedy w Kijowie jest południe, w Australii jest już późny wieczór i ciemno.',
  ny_n: 'Nowym Jorku|Kiedy w Kijowie jest północ, w Nowym Jorku jest dopiero piąta po południu.',
  tokyo_n: 'Tokio|Kiedy w Kijowie jest północ, w Japonii jest już siódma rano — słońce wzeszło.',
  mexico: 'mieście Meksyk|Kiedy w Kijowie jest południe, w Meksyku jest dopiero czwarta rano — wszyscy śpią.',
  mexico_n: 'mieście Meksyk|Kiedy w Kijowie jest północ, w Meksyku jest jeszcze dzień — czwarta po południu.',
  vancouver: 'Vancouver w Kanadzie|Vancouver leży po drugiej stronie Ziemi: kiedy w Kijowie jest południe, tam jest druga w nocy.',
  wellington: 'Wellington w Nowej Zelandii|Nowa Zelandia leży najdalej od Kijowa: kiedy tam jest południe, w Nowej Zelandii jest już prawie północ.',
  wellington_n: 'Wellington w Nowej Zelandii|Kiedy w Kijowie jest północ, w Nowej Zelandii jest już prawie południe następnego dnia.',
});

/** The cities whose clocks are compared with Kyiv’s, as they stand after «w». */
export const CITIES: Record<string, string> = {
  warsaw: 'Warszawie', london: 'Londynie', athens: 'Atenach', paris: 'Paryżu', lisbon: 'Lizbonie', new_york: 'Nowym Jorku',
  vilnius: 'Wilnie', rome: 'Rzymie', dubai: 'Dubaju', beijing: 'Pekinie', tokyo: 'Tokio', sydney: 'Sydney',
};
