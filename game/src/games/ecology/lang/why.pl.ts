import { own } from '@/core/lang/marks';
import type { Lines, Rows } from './types';

/**
 * «Dlaczego tak?» in Polish: the questions of `content/questions.ts` and
 * `content/questionsMore.ts`, in the same order. Where the Ukrainian asks
 * about Ukraine (its longest river, its biggest animal) the Polish asks the
 * same about Poland.
 */

export const ROWS: Rows = {
  waste: [
    ['Po co segregować śmieci?', 'Żeby zrobić z nich nowe rzeczy', 'Żeby pojemniki były ładniejsze', 'Żeby śmieci były cięższe', 'Posegregowane śmieci to surowiec: ze szkła, papieru i plastiku powstają nowe rzeczy.'],
    ['Z czym najlepiej chodzić do sklepu?', 'Z własną torbą z materiału', 'Za każdym razem z nową reklamówką', 'Z dziesięcioma reklamówkami na zapas', 'Torba służy latami, a reklamówka staje się śmieciem już po kilku minutach.'],
    ['Co zrobić z zabawką, którą już się nie bawisz?', 'Podarować innemu dziecku', 'Wyrzucić w lesie', 'Schować i zapomnieć', 'Rzecz, która jeszcze komuś posłuży, nie staje się śmieciem. To się nazywa „drugie życie rzeczy”.'],
    ['Co dłużej nie znika w przyrodzie?', 'Plastikowa butelka', 'Ogryzek jabłka', 'Suchy liść', 'Ogryzek zniknie po kilku tygodniach, a plastikowa butelka będzie leżeć setki lat.'],
    ['Gdzie oddać zużytą baterię?', 'Do specjalnego punktu zbiórki', 'Wrzucić do rzeki', 'Zakopać w ogrodzie', 'W baterii są szkodliwe substancje: jedna bateria może zatruć ziemię wokół siebie. Zbiera się je osobno.'],
    ['Co zrobić z obierkami warzyw i owoców?', 'Wrzucić na kompost', 'Rzucić na drogę', 'Spalić na podwórku', 'Na kompoście obierki gniją i stają się nawozem do ogrodu.'],
    ['Dlaczego po pikniku trzeba zabrać śmieci ze sobą?', 'Szkodzą zwierzętom i nie znikają latami', 'W lesie śmieci same znikają w nocy', 'I tak zjedzą je ptaki', 'Zwierzęta mogą się skaleczyć szkłem albo połknąć torebkę. Las ma zostać taki, jakim go zastaliśmy.'],
  ],
  air: [
    ['Co oczyszcza powietrze w mieście?', 'Drzewa', 'Samochody', 'Kominy fabryk', 'Drzewa pochłaniają dwutlenek węgla, zatrzymują kurz i dają nam tlen.'],
    ['Co jest dobrego w jeździe do szkoły rowerem?', 'Rower nie zanieczyszcza powietrza', 'Rower jedzie szybciej niż samolot', 'Rower głośno dzwoni', 'Rower nie spala paliwa, więc nie wyrzuca szkodliwych gazów.'],
    ['Dlaczego nie wolno palić opadłych liści?', 'Dym zatruwa powietrze, a w liściach mieszkają jeże i owady', 'Liście są potrzebne do malowania płotów', 'Psuje się od tego asfalt', 'Dym z liści szkodzi płucom. A opadłe liście to kołdra dla ziemi i zimowy dom dla jeży.'],
    ['Dlaczego samochody zanieczyszczają powietrze?', 'Spalają paliwo i wyrzucają gazy', 'Bo mają cztery koła', 'Bo jeżdżą po drodze', 'Gdy silnik spala benzynę, z rury wydechowej wydobywają się szkodliwe gazy.'],
    ['Dlaczego nie wolno podpalać suchej trawy?', 'W ogniu giną owady i gniazda, a pożar może dojść do lasu', 'Trawa zrobi się potem niebieska', 'Zaczyna od tego padać deszcz', 'Ogień biegnie po suchej trawie bardzo szybko i może przenieść się na las albo domy.'],
    ['Po co sadzi się drzewa wzdłuż dróg?', 'Zatrzymują kurz i dają cień', 'Żeby samochody jechały szybciej', 'Żeby było gdzie chować śmieci', 'Liście łapią kurz i spaliny, a drzewa tłumią też hałas.'],
    ['Co to jest smog?', 'Brudna mgła z dymu i spalin nad miastem', 'Nazwa puchatej chmurki', 'Poranna rosa na trawie', 'Smog pojawia się tam, gdzie jest dużo samochodów, fabryk i dymiących kominów. Oddychanie nim szkodzi.'],
  ],
  water: [
    ['Dlaczego trzeba zakręcać kran podczas mycia zębów?', 'Żeby nie marnować czystej wody', 'Żeby woda nie wystygła', 'Żeby kran odpoczął', 'Gdy myjesz zęby przy odkręconym kranie, wycieka kilka wiader czystej wody.'],
    ['Dlaczego nie wolno wrzucać śmieci do rzeki?', 'Zatruwają wodę i szkodzą rybom', 'Rzeka robi się od tego głębsza', 'Ryby lubią bawić się śmieciami', 'Brudna woda szkodzi rybom, ptakom i ludziom, którzy piją wodę z tej rzeki.'],
    ['Jaką wodę można pić?', 'Czystą: przefiltrowaną albo przegotowaną', 'Z kałuży', 'Z morza', 'W brudnej wodzie żyją zarazki, a woda morska jest za słona.'],
    ['Skąd bierze się woda w kranie?', 'Z rzek, jezior i podziemnych źródeł', 'Z chmurki nad domem', 'Robi się ją w fabryce z powietrza', 'Wodę pobiera się z rzeki albo spod ziemi, oczyszcza i rurami doprowadza do domów.'],
    ['Dlaczego trzeba oszczędzać słodką wodę?', 'Na Ziemi jest jej bardzo mało', 'Szybko się psuje', 'Jest cięższa od słonej', 'Prawie cała woda na planecie jest słona. Słodkiej, którą można pić, jest naprawdę niewiele.'],
    ['Jak oszczędzać wodę w domu?', 'Brać prysznic zamiast pełnej wanny', 'Zmywać naczynia przez cały dzień', 'Podlewać kwiaty podczas deszczu', 'Na pełną wannę potrzeba trzy razy więcej wody niż na krótki prysznic.'],
    ['Co się stanie, jeśli do rzeki wyleje się olej albo farbę?', 'Na wodzie powstanie błona i mieszkańcom rzeki będzie trudno oddychać', 'Woda będzie smaczniejsza', 'Rzeka popłynie szybciej', 'Błona nie przepuszcza powietrza do wody. Rybom i roślinom pod nią brakuje tlenu.'],
  ],
  climate: [
    ['Dlaczego topnieją lodowce?', 'Bo na Ziemi robi się cieplej', 'Bo gryzą je niedźwiedzie polarne', 'Bo są bardzo stare', 'Planeta powoli się nagrzewa i lód, który leżał tysiące lat, zaczyna topnieć.'],
    ['Komu jest najtrudniej, gdy topnieje lód w Arktyce?', 'Niedźwiedziom polarnym', 'Wielbłądom', 'Papugom', 'Niedźwiedzie polarne polują na foki z lodu. Gdy lodu jest mało, trudno im zdobyć jedzenie.'],
    ['Co to jest susza?', 'Gdy długo nie pada deszcz i ziemia wysycha', 'Gdy pada codziennie', 'Gdy spadnie pierwszy śnieg', 'Podczas suszy rzeki robią się płytkie, a roślinom brakuje wody.'],
    ['Dlaczego na Ziemi robi się cieplej?', 'Fabryki i samochody wyrzucają do powietrza dużo gazów', 'Słońce podeszło bliżej', 'Ludzie zaczęli się cieplej ubierać', 'Te gazy zatrzymują ciepło przy Ziemi jak kołdra. Dlatego planeta się nagrzewa.'],
    ['Co stanie się z morzem, jeśli stopnieje dużo lodowców?', 'Poziom wody się podniesie', 'Morze wyschnie', 'Woda zrobi się słodka', 'Woda z roztopów spływa do oceanu i jego poziom rośnie. Niskie brzegi mogą zostać zalane.'],
    ['Co pomaga Ziemi się nie przegrzewać?', 'Lasy: drzewa pochłaniają dwutlenek węgla', 'Więcej asfaltu', 'Więcej ognisk', 'Drzewa zabierają z powietrza gaz, który zatrzymuje ciepło. Dlatego lasy trzeba chronić i sadzić.'],
    ['Jak dziecko może pomóc klimatowi?', 'Gasić światło, dbać o rzeczy i więcej chodzić pieszo', 'Częściej palić ogniska', 'Wyrzucać niedojedzone jedzenie', 'Im mniej zużywamy energii i rzeczy, tym mniej gazów trafia do powietrza.'],
  ],
  wildlife: [
    ['Po co zimą robi się karmniki?', 'Ptakom trudno znaleźć jedzenie pod śniegiem', 'Żeby ptaki nie odleciały do ciepłych krajów', 'Żeby ozdobić drzewo', 'Zimą nasiona i owady są schowane pod śniegiem. Karmnik pomaga ptakom przetrwać mrozy.'],
    ['Czym można karmić ptaki zimą?', 'Ziarnem i niesoloną słoniną', 'Chipsami', 'Cukierkami', 'Słone, smażone i słodkie jedzenie szkodzi ptakom. Najlepsze są niesolone pestki słonecznika.'],
    ['Dlaczego pszczoły są takie ważne?', 'Zapylają kwiaty i dzięki temu rosną owoce', 'Głośno bzyczą', 'Rozpędzają chmury', 'Pszczoła przenosi pyłek z kwiatka na kwiatek — bez tego nie zawiązałyby się jabłka ani wiśnie.'],
    ['Dlaczego nie wolno zrywać przebiśniegów?', 'Są rzadkie i mogą zniknąć', 'Kłują', 'W ogóle nie pachną', 'Zerwany kwiat nie wyda nasion.' + own(' Przebiśniegi są w Polsce pod ochroną.')],
    ['Co zrobić, gdy znajdziesz pisklę pod drzewem?', 'Nie ruszać: rodzice są blisko i je karmią', 'Zabrać do domu', 'Zanieść je na drogę', 'Pisklęta uczą się latać z ziemi, a rodzice ich pilnują. W domu pisklę nie przeżyje.'],
    ['Dlaczego nie wolno niszczyć mrowiska?', 'Mrówki to sanitariusze lasu: niszczą szkodniki', 'Mrówki się obrażą i przestaną się witać', 'Wiewiórki trzymają w nim nasiona', 'Mrówki z jednego mrowiska zbierają w ciągu dnia tysiące szkodliwych owadów.'],
    ['Dlaczego nie wolno wycinać wszystkich lasów?', 'Las to dom zwierząt i źródło tlenu', 'Drzewa przeszkadzają wiatrowi', 'W lesie jest za ciemno', 'Bez lasu zwierzęta i ptaki zostają bez domu, a powietrze robi się brudniejsze.'],
  ],
  energy: [
    ['Dlaczego trzeba gasić światło, wychodząc z pokoju?', 'Żeby nie marnować prądu', 'Żeby żarówka świeciła jaśniej', 'Żeby w pokoju było ciszej', 'Żeby wytworzyć prąd, elektrownie spalają paliwo. Im mniej zużywamy, tym czystsze powietrze.'],
    ['Skąd można brać czystą energię?', 'Ze słońca i wiatru', 'Z dymu', 'Ze śmieci w rzece', 'Słońce i wiatr się nie kończą i niczego nie zanieczyszczają.'],
    ['Do czego służą wiatraki?', 'Wytwarzają prąd z wiatru', 'Rozpędzają chmury', 'Chłodzą powietrze', 'Wiatr obraca łopaty, a prądnica w środku zamienia ten ruch w prąd.'],
    ['Co to jest panel słoneczny?', 'Urządzenie, które wytwarza prąd ze światła słońca', 'Wielkie lustro', 'Dach dla samochodów', 'Panele słoneczne stawia się na dachach i na polach: działają, dopóki świeci słońce.'],
    ['Dlaczego ładowarkę lepiej wyjmować z gniazdka?', 'Zużywa prąd, nawet gdy niczego nie ładuje', 'Może się zgubić', 'Głośno buczy', 'Włączona ładowarka po trochu pobiera prąd. Takich „cichych” strat jest w domu sporo.'],
    ['Co jest lepsze, gdy w domu jest chłodno?', 'Najpierw założyć sweter, a nie włączać grzejnik na całego', 'Otworzyć okno', 'Zapalić wszystkie lampy', 'Grzejnik zużywa bardzo dużo prądu. Ciepłe ubranie grzeje bez niego.'],
    ['Dlaczego nie wolno długo trzymać otwartej lodówki?', 'Nagrzewa się i zużywa więcej prądu', 'Wylatuje z niej śnieg', 'Jedzenie zaczyna rosnąć', 'Do środka dostaje się ciepłe powietrze i lodówka musi pracować mocniej.'],
  ],
};

export const LINES: Lines = {
  waste: `
Gdzie trzeba wyrzucić papierek po cukierku?|Do kosza|Papierek sam nie zniknie: na ziemi będzie leżał latami.
Co można zrobić z kartonowym pudełkiem?|Oddać na makulaturę albo zrobić z niego zabawkę|Z kartonu powstaje nowy papier, a z pudełka wychodzi świetny domek.
Dlaczego karton po soku trzeba zgnieść przed wyrzuceniem?|Żeby zajmował mniej miejsca w pojemniku|Zgniecione śmieci zajmują mniej miejsca i śmieciarka zabierze ich naraz więcej.
Co powstanie ze starych plastikowych butelek?|Nowe butelki, zabawki, a nawet ubrania|Plastik się rozdrabnia i topi, a z jego nitek szyje się ciepłe bluzy.
Z czego powstanie nowy zeszyt, jeśli oddamy makulaturę?|Ze starego papieru|Stary papier się rozmacza, oczyszcza i robi z niego nowe kartki.
Dlaczego przetwarzanie papieru jest dobre dla lasu?|Bo wtedy wycina się mniej drzew|Papier robi się z drewna, więc każda oddana paczka makulatury chroni drzewa.
Co można zrobić z pustej puszki?|Nową puszkę albo część do roweru|Metal można topić wiele razy i wcale się przez to nie psuje.
Co zrobić z ubraniem, z którego się wyrosło?|Oddać młodszym dzieciom|Ubranie, które ktoś jeszcze będzie nosił, nie staje się śmieciem.
Co najlepiej zrobić z zepsutą zabawką?|Spróbować ją naprawić|Naprawiona rzecz służy dalej i nie trzeba kupować nowej.
Po co myć słoik, zanim odda się go do przetworzenia?|Żeby resztki jedzenia nie zepsuły reszty surowca|Brudne opakowania trudniej przetworzyć, a do tego brzydko pachną.
Dlaczego lepiej kupić jedno duże opakowanie niż wiele małych?|Bo wtedy mniej opakowań staje się śmieciem|Im mniej opakowań, tym mniej śmieci w domu.
Czym można zastąpić jednorazowy kubek?|Własnym kubkiem albo butelką na wodę|Butelka wielorazowa służy latami i nie staje się śmieciem.
Dlaczego jednorazowe naczynia szkodzą przyrodzie?|Używa się ich kilka minut, a leżą setki lat|Plastikowy widelec nie znika w przyrodzie przez bardzo długi czas.
W co można zapakować prezent, żeby było mniej śmieci?|W materiał albo w papier, który już był używany|Ładną chustkę albo torebkę można wykorzystać jeszcze wiele razy.
Dlaczego nie wolno wrzucać śmieci do toalety?|Bo zatykają rury i trafiają do rzeki|Kanalizacja jest przeznaczona tylko dla wody, a nie dla śmieci.
Gdzie oddać przepaloną żarówkę?|Do specjalnego punktu zbiórki|W niektórych żarówkach są szkodliwe substancje, dlatego zbiera się je osobno.
Gdzie oddać stary telefon?|Do punktu zbiórki elektroniki|W telefonie są cenne metale, które można wydobyć i wykorzystać ponownie.
Dlaczego starych leków nie wolno wyrzucać do zwykłego kosza?|Bo mogą zatruć wodę i glebę|Leki zbiera się osobno, żeby nie trafiły do przyrody.
Co to jest kompost?|Nawóz z przegniłych resztek roślin|Obierki, liście i trawa gniją i karmią glebę.
Kto pomaga zamienić obierki w nawóz?|Dżdżownice i mikroby|Zjadają resztki roślin i robią z nich żyzną ziemię.
Co to jest wysypisko?|Miejsce, dokąd wywozi się nieposegregowane śmieci|Na wysypisku śmieci leżą dziesiątki lat i zatruwają ziemię wokół.
Co oznacza znak z trzema strzałkami w kółku?|Że tę rzecz można przetworzyć|Strzałki pokazują drogę: rzecz — surowiec — nowa rzecz.
Dlaczego karton po soku trudno przetworzyć?|Bo sklejone są w nim papier, plastik i folia|Warstwy trzeba rozdzielić, a nie każdy zakład to potrafi.
Co można uszyć ze starych dżinsów?|Torbę albo piórnik|Mocny materiał długo jeszcze posłuży w nowej rzeczy.
Co zrobić z książką, którą już się przeczytało?|Podarować albo zanieść do biblioteki|Książkę może przeczytać jeszcze wiele dzieci.
Dlaczego plastikowa torebka jest groźna dla morza?|Żółwie mylą ją z meduzą i połykają|Połknięta torebka może zabić zwierzę.
Co to jest mikroplastik?|Maleńkie kawałeczki plastiku, których prawie nie widać|Plastik nie znika, tylko kruszy się na drobinki, które trafiają do wody i do jedzenia.
Dlaczego nie warto wypuszczać balonów w niebo?|Spadają na ziemię i stają się śmieciami|Balon, który spadł, może połknąć ptak albo inne zwierzę.
Co zrobić, gdy w pobliżu nie ma kosza?|Zabrać śmieci ze sobą|Papierek można schować do kieszeni i wyrzucić w domu.
Na czym polega akcja „Sprzątanie świata”?|Ludzie razem sprzątają park, las albo brzeg rzeki|Razem można posprzątać szybko — i przyrodzie jest lżej.
Jak zabrać ze sobą jedzenie bez zbędnych śmieci?|Włożyć je do własnego pojemnika|Pojemnik można umyć i zabierać codziennie.
Co zrobić z niezużytymi kredkami i zeszytami pod koniec roku szkolnego?|Używać ich dalej|Nowe kupuje się wtedy, gdy stare naprawdę się skończą.
Które śmieci znikają w przyrodzie najszybciej?|Resztki jedzenia i liście|Odpadki organiczne w kilka tygodni zjadają mikroby i dżdżownice.
Dlaczego rozbite szkło w lesie jest niebezpieczne?|Mogą się nim skaleczyć i ludzie, i zwierzęta|A szkiełko w słońcu może podpalić suchą trawę.
Co robi się w zakładzie przetwarzania odpadów?|Segreguje śmieci i robi z nich surowiec|Ze starych rzeczy powstaje tam materiał na nowe.
`,
  air: `
Czym oddychamy?|Powietrzem|Powietrze jest wszędzie wokół nas, choć go nie widać.
Co drzewa oddają do powietrza?|Tlen|Liście pochłaniają dwutlenek węgla i wydzielają tlen, którym oddychamy.
Czym najlepiej jeździć po mieście, żeby powietrze było czystsze?|Autobusem albo tramwajem|Jeden autobus wiezie tylu ludzi, ilu dziesiątki samochodów.
Jak dotrzeć do szkoły, nie zanieczyszczając powietrza?|Pieszo, rowerem albo hulajnogą|Nogi i rower nie spalają paliwa.
Po co na kominach fabryk zakłada się filtry?|Żeby zatrzymywały szkodliwy dym|Filtr łapie pył i sadzę, zanim trafią do powietrza.
Po co wietrzyć pokój?|Żeby było w nim świeże powietrze|Świeżym powietrzem łatwiej się oddycha i lepiej się po nim myśli.
Dlaczego w lesie łatwo się oddycha?|Bo drzewa oczyszczają powietrze|Liście zatrzymują kurz i dają dużo tlenu.
Dlaczego kierowca powinien wyłączyć silnik, gdy długo stoi?|Żeby nie wyrzucać niepotrzebnych spalin|Silnik zanieczyszcza powietrze, nawet gdy samochód nie jedzie.
Dlaczego samochód elektryczny jest lepszy dla miasta?|Nie wyrzuca dymu|Samochód elektryczny nie ma rury wydechowej.
Dlaczego nie wolno palić śmieci?|Do powietrza idzie wtedy trujący dym|Gdy pali się plastik, powstają bardzo szkodliwe substancje.
Dlaczego w niektórych wielkich miastach ludzie noszą na ulicy maski?|Bo powietrze jest tam bardzo brudne|Maska zatrzymuje część pyłu i dymu.
Skąd nad miastem bierze się pył?|Z samochodów, fabryk i budów|Pył wzbijają koła, wiatr i dym.
Co deszcz robi z pyłem?|Przybija go do ziemi|Po deszczu powietrze jest czystsze i świeższe.
Jak rośliny doniczkowe pomagają w domu?|Odświeżają powietrze|Rośliny pochłaniają dwutlenek węgla i nawilżają powietrze.
Co liście pochłaniają z powietrza?|Dwutlenek węgla|Rośliny potrzebują go, żeby rosnąć.
Dlaczego lasy nazywa się płucami planety?|Bo dają Ziemi tlen|Ogromne lasy codziennie oczyszczają powietrze dla całego świata.
Dlaczego dym tytoniowy jest szkodliwy?|Zatruwa płuca wszystkich, którzy są obok|Dym szkodzi i temu, kto pali, i tym, którzy stoją w pobliżu.
Dlaczego powietrze cierpi przez fajerwerki?|Zostają po nich dym i szkodliwy pył|A głośne wybuchy straszą ptaki i inne zwierzęta.
Dlaczego samoloty też zanieczyszczają powietrze?|Bo ich silniki spalają dużo paliwa|Jeden lot wyrzuca tyle gazów, ile samochód przez wiele miesięcy.
Dlaczego ścieżki rowerowe są dobre dla miasta?|Bo więcej ludzi przesiada się na rowery|Im mniej samochodów na ulicach, tym czystsze powietrze.
Co to są spaliny?|Dym, który wychodzi z rury samochodu|Powstają, gdy silnik spala paliwo.
Gdzie w mieście powietrze jest najczystsze?|W parku, z dala od dróg|Drzewa zatrzymują tam kurz i spaliny.
Dlaczego w górach powietrze jest czyste?|Nie ma tam fabryk i prawie nie ma samochodów|Górskie powietrze jest świeże i przejrzyste.
Dlaczego pożar lasu szkodzi nawet dalekim miastom?|Wiatr niesie dym na setki kilometrów|Dym z wielkiego pożaru widać nawet z kosmosu.
Dlaczego nie wolno wypalać ściernisk?|Dym zatruwa powietrze, a w glebie giną pożyteczne stworzenia|Ogień niszczy i owady, i ptasie gniazda.
Czym najlepiej ogrzewać dom, żeby mniej dymiło?|Suchym drewnem, a nie śmieciami|Mokre drewno i śmieci dają dużo gryzącego dymu.
Dlaczego w korkach powietrze jest szczególnie brudne?|Bo wiele samochodów stoi z włączonymi silnikami|Spaliny zbierają się nad drogą i nic ich nie rozwiewa.
Jak wiatr pomaga miastu?|Rozwiewa dym i przynosi świeże powietrze|W bezwietrzną pogodę dym wisi nad domami.
Do czego służy człowiekowi nos, gdy oddycha?|Oczyszcza i ogrzewa powietrze|Włoski w nosie zatrzymują kurz.
Który narząd pomaga nam oddychać?|Płuca|Płuca biorą z powietrza tlen i przekazują go krwi.
Co może zrobić dziecko, żeby powietrze było czystsze?|Posadzić drzewo i więcej chodzić pieszo|Nawet jedno drzewo oczyszcza powietrze przez dziesiątki lat.
Dlaczego po świecach i ognisku trzeba przewietrzyć pokój?|Bo ogień zużywa tlen i daje dym|Świeże powietrze przywraca w pokoju tlen.
Dlaczego aerozoli trzeba używać ostrożnie?|Rozpylają w powietrzu substancje chemiczne|Wdychanie takich substancji jest szkodliwe.
Jak nazywa się warstwa powietrza wokół Ziemi?|Atmosfera|Atmosfera chroni wszystko, co żyje, i zatrzymuje ciepło.
Co chroni nas przed palącymi promieniami słońca?|Warstwa ozonowa|Wysoko na niebie zatrzymuje szkodliwe promieniowanie.
`,
  water: `
Bez czego nie mogą żyć ani ludzie, ani rośliny, ani zwierzęta?|Bez wody|Woda jest potrzebna wszystkiemu, co żyje na Ziemi.
Co zrobić z wodą, gdy namydlasz ręce?|Zakręcić kran|W ciągu minuty z kranu wycieka kilka litrów wody.
Jak umyć zęby i nie zmarnować wody?|Nalać wody do kubka|Kubek wystarczy, a z odkręconego kranu wycieknie całe wiadro.
Co zrobić, gdy kran kapie?|Powiedzieć dorosłym, żeby go naprawili|Kropla po kropli w ciągu dnia zbiera się całe wiadro.
Skąd bierze się deszcz?|Z chmur|Woda paruje, zbiera się w chmury i wraca na ziemię.
Czym najlepiej podlewać kwiaty w ogrodzie?|Deszczówką|Deszczówkę można zebrać do beczki i nie brać wody z kranu.
Kiedy najlepiej podlewać ogród latem?|Wieczorem albo rano|W upał woda szybko paruje i nie dociera do korzeni.
Dlaczego nie można pić wody morskiej?|Bo jest bardzo słona|Po słonej wodzie chce się pić jeszcze bardziej.
Gdzie na Ziemi jest najwięcej słodkiej wody?|W lodowcach|Prawie cała słodka woda planety jest zamarznięta w lodzie.
Dlaczego czysta woda w stawie jest ważna dla żab?|Bo żaby oddychają także skórą|W brudnej wodzie żaby chorują i giną.
Dlaczego nie wolno myć samochodu nad brzegiem rzeki?|Środki do mycia trafiają do wody i szkodzą rybom|Piana i brud spływają prosto do rzeki.
Do czego służą oczyszczalnie ścieków?|Do oczyszczania brudnej wody z miasta|Dopiero po oczyszczeniu woda wraca do rzeki.
Dlaczego ropa rozlana w morzu to nieszczęście?|Pokrywa wodę błoną i zabija ptaki oraz ryby|Pióra ptaka w ropie się sklejają i ptak nie może latać.
Kto w rzece działa jak żywy filtr?|Małże|Małż przepuszcza wodę przez siebie i zatrzymuje brud.
Dlaczego nawozy z pól szkodzą rzekom?|Woda od nich zakwita i rybom brakuje powietrza|Glony się rozrastają i zabierają tlen.
Jak prać, żeby oszczędzać wodę?|Włączać pralkę, gdy jest pełna|Pełna pralka zużywa tyle samo wody co na wpół pusta.
Jak zmywać naczynia i nie marnować wody?|Nie trzymać kranu odkręconego przez cały czas|Naczynia można namydlić przy zakręconym kranie.
Po co na spłuczce są dwa przyciski?|Żeby spuszczać mniej wody, gdy to wystarczy|Mały przycisk zużywa dwa razy mniej wody.
Dlaczego nie wolno wycinać lasu na brzegach rzek?|Bez drzew rzeka robi się płytka i wysycha|Korzenie drzew zatrzymują wodę w ziemi.
Kto buduje na rzekach tamy z gałęzi?|Bobry|Bobrowe tamy zatrzymują wodę, a wokół osiedla się wiele zwierząt.
W co zamienia się woda na mrozie?|W lód|Woda zamarza, gdy temperatura spada poniżej zera.
W co zamienia się woda, gdy się gotuje?|W parę|Para jest lekka i unosi się w górę, do chmur.
${own('Jak nazywa się najdłuższa rzeka Polski?')}|Wisła|Wisła płynie przez cały kraj aż do Morza Bałtyckiego.
${own('Do jakiego morza wpada Wisła?')}|Do Bałtyckiego|Morze Bałtyckie oblewa północ Polski.
Dlaczego na pustyni jest mało roślin?|Bo jest tam bardzo mało wody|Bez wody nasiona nie kiełkują.
Dlaczego plastikowa butelka w morzu jest groźna?|Nie znika i kruszy się na mikroplastik|Drobinki plastiku połykają ryby i ptaki.
Dlaczego nie wolno zostawiać na brzegu żyłek i sieci?|Zaplątują się w nie ptaki i ryby|Porzucona sieć łowi zwierzęta jeszcze przez wiele lat.
Czego nie wolno wylewać do zlewu?|Farby, oleju i leków|Bardzo trudno oczyścić z nich wodę.
Po co chronić bagna?|Magazynują wodę i dają dom ptakom|Bagno jest jak wielka gąbka: trzyma wodę dla rzek.
Co to jest obieg wody?|Podróż wody z morza do chmur i z powrotem|Woda paruje, spada jako deszcz i rzekami płynie do morza.
Ile wody powinno pić dziecko każdego dnia?|Kilka szklanek|Woda pomaga ciału pracować i myśleć.
Co oznacza znak z przekreślonym kranem?|Że tej wody nie wolno pić|Taka woda nie jest oczyszczona i może zaszkodzić.
Dlaczego nie wolno wrzucać szkła do rzeki?|Skaleczą się nim ci, którzy się kąpią|Szkło leży na dnie wiele lat i się nie tępi.
Czego ryby potrzebują w wodzie, żeby oddychać?|Tlenu rozpuszczonego w wodzie|Ryby pobierają tlen z wody skrzelami.
Skąd bierze się woda w leśnym źródle?|Spod ziemi|Deszczówka przesiąka przez glebę i wypływa czystym strumykiem.
`,
  climate: `
Co ogrzewa naszą planetę?|Słońce|Ciepło słońca daje życie wszystkiemu na Ziemi.
Czym mierzy się temperaturę powietrza?|Termometrem|Słupek termometru podnosi się, gdy robi się cieplej.
Co to jest globalne ocieplenie?|Gdy na całej planecie robi się cieplej|Przez gazy z fabryk i samochodów Ziemia się nagrzewa.
Przez co planeta nagrzewa się szybciej?|Przez gazy z samochodów, fabryk i elektrowni|Te gazy trzymają ciepło jak kołdra.
Dlaczego gazy cieplarniane porównuje się do kołdry?|Bo nie wypuszczają ciepła z Ziemi|Im grubsza taka kołdra, tym goręcej planecie.
Co dzieje się z poziomem morza, gdy topnieje lód?|Podnosi się|Woda z roztopów spływa do oceanu, a ten zalewa niskie brzegi.
Komu zagraża podnoszenie się poziomu oceanu?|Mieszkańcom niskich wysp i wybrzeży|Niektóre wyspy mogą całkiem zniknąć pod wodą.
Dlaczego pingwinom potrzebny jest lód?|Na nim wychowują pisklęta|Bez lodu pingwiny nie mają gdzie zakładać gniazd.
Jak drzewa pomagają walczyć z ociepleniem?|Pochłaniają dwutlenek węgla|Im więcej lasów, tym mniej tego gazu w powietrzu.
Jak jazda na rowerze pomaga klimatowi?|Rower nie wyrzuca gazów|Każda podróż bez samochodu to trochę mniej ciepła dla planety.
Dlaczego miejscowe jabłka są lepsze dla klimatu niż przywiezione z daleka?|Nie trzeba ich wieźć samolotem ani statkiem|Przewożenie spala dużo paliwa.
Dlaczego latem jest więcej pożarów lasów?|Bo przez upał las bardzo wysycha|Suchy las zapala się od najmniejszej iskry.
Jak ocieplenie zmienia pogodę?|Wichury i ulewy stają się silniejsze|Ciepłe powietrze i ciepła woda dają burzom więcej siły.
Co to jest susza?|Gdy bardzo długo nie pada deszcz|W czasie suszy schną pola, a rzeki robią się płytkie.
Dlaczego susza jest groźna dla ludzi?|Bo bez deszczu nie rosną plony|Pszenica i warzywa potrzebują wody.
Dlaczego koralowce bledną?|Bo woda w oceanie robi się za ciepła|W przegrzanej wodzie koralowce chorują i tracą kolor.
Jak ptaki odczuwają zmianę klimatu?|Wracają z ciepłych krajów wcześniej|Wiosna przychodzi teraz często szybciej niż kiedyś.
Dlaczego zimy są coraz cieplejsze?|Bo cała planeta powoli się nagrzewa|W wielu miejscach spada mniej śniegu niż kiedyś.
Dlaczego pociąg jest lepszy dla klimatu niż samolot?|Wyrzuca o wiele mniej gazów|Pociąg elektryczny prawie nie zanieczyszcza powietrza.
Jak zgaszone światło pomaga klimatowi?|Elektrownie spalają mniej paliwa|Mniej spalonego paliwa to mniej gazów w powietrzu.
Dlaczego warto częściej jeść warzywa?|Ich uprawa wymaga mniej wody i energii|Hodowla zwierząt potrzebuje dużo ziemi i paszy.
Jak nazywa się ogromna bryła lodu płynąca po morzu?|Góra lodowa|Większa część góry lodowej jest ukryta pod wodą.
Gdzie żyją niedźwiedzie polarne?|W Arktyce|Polują na lodzie w pobliżu bieguna północnego.
Co to jest klimat?|Pogoda, jaka bywa w danym miejscu przez wiele lat|Na pustyni klimat jest suchy, a w tropikach — ciepły i wilgotny.
Czym pogoda różni się od klimatu?|Pogoda zmienia się codziennie, a klimat bardzo powoli|Deszcz dzisiaj to pogoda; deszczowe lato co roku to klimat.
Jak naukowcy obserwują lód na biegunach?|Fotografują go z satelitów|Zdjęcia z kosmosu pokazują, jak lodu ubywa.
Dlaczego w mieście jest goręcej niż w lesie?|Asfalt i mury bardzo nagrzewają się w słońcu|Drzewa dają cień i chłodzą powietrze.
Co dzieje się z planetą, gdy wycina się lasy?|W powietrzu przybywa dwutlenku węgla|Ścięte drzewa nie mogą go już pochłaniać.
Jak ubierać się zimą w domu, żeby oszczędzać ciepło?|Założyć sweter, zamiast podkręcać ogrzewanie|Ciepło ubrany człowiek nie marznie nawet przy słabszym ogrzewaniu.
Po co ociepla się domy?|Żeby ciepło nie uciekało na dwór|Ocieplony dom potrzebuje mniej paliwa.
Jaka energia nie nagrzewa planety?|Energia słońca, wiatru i wody|Nie wymaga spalania paliwa.
Co może zrobić dla klimatu każda rodzina?|Oszczędzać energię i mniej jeździć samochodem|Małe kroki wielu ludzi dają wielki efekt.
Dlaczego naukowcy codziennie zapisują pogodę?|Żeby widzieć, jak zmienia się klimat|Z zapisków z wielu lat widać, że planeta się ociepla.
Dlaczego ciepła zima szkodzi pszczołom?|Budzą się za wcześnie, gdy nie ma jeszcze kwiatów|Bez kwiatów pszczoły nie mają co jeść.
Dlaczego górskie lodowce są ważne dla rzek?|Woda z ich topnienia zasila rzeki latem|Jeśli lodowiec zniknie, rzeka może wyschnąć.
`,
  wildlife: `
Czym można karmić ptaki zimą?|Ziarnem i niesoloną słoniną|Chleb ptakom szkodzi, a ziarno daje im siłę.
Po co wiosną wiesza się budki lęgowe?|Żeby ptaki miały gdzie wychować pisklęta|W mieście ptakom trudno znaleźć dziuplę.
Co zrobić, gdy znajdziesz pisklę pod drzewem?|Nie ruszać: rodzice są gdzieś blisko|Pisklęta uczą się latać, a rodzice karmią je na ziemi.
Dlaczego nie wolno zrywać pierwszych wiosennych kwiatów?|Bo zostało ich bardzo mało|Zerwany kwiat nie wyda nasion i następnej wiosny go nie będzie.
Dlaczego pszczoły są ważne?|Zapylają kwiaty, a z nich wyrastają owoce|Bez pszczół nie byłoby ani jabłek, ani wiśni.
Czym nie wolno częstować jeża?|Mlekiem|Od mleka jeże boli brzuch.
Dlaczego nie wolno karmić wiewiórek cukierkami?|Słodycze szkodzą ich zdrowiu|Dla wiewiórek dobre są orzechy i nasiona.
Dlaczego kaczek w parku lepiej nie karmić chlebem?|Od chleba chorują|Kaczkom lepiej dawać ziarno albo pokrojone warzywa.
Dlaczego nie wolno niszczyć mrowisk?|Mrówki to sanitariusze lasu|Mrówki niszczą szkodniki i spulchniają ziemię.
Jaki pożytek jest z pająków?|Łapią muchy i komary|Pajęczyna to pułapka na dokuczliwe owady.
Czym pożyteczne są nietoperze?|W jedną noc zjadają setki komarów|Nietoperze polują w ciemności na szkodliwe owady.
Dlaczego nie wolno krzywdzić żab?|Zjadają komary i ślimaki|Jedna żaba pilnuje całej grządki.
Co zrobić, gdy zobaczysz w lesie węża?|Spokojnie odejść i go nie ruszać|Wąż nie zaatakuje, jeśli się go nie wystraszy.
Dlaczego w lesie trzeba zachowywać się cicho?|Żeby nie płoszyć zwierząt|Głośne dźwięki sprawiają, że zwierzęta uciekają i porzucają młode.
Dlaczego nie wolno łamać gałęzi drzew?|Drzewo od tego choruje|Przez ranę do drzewa dostają się choroby.
Dlaczego nie wolno rozdeptywać muchomorów?|Leczą się nimi leśne zwierzęta|Łosie zjadają muchomory jak lekarstwo.
Co to jest czerwona księga?|Lista rzadkich roślin i zwierząt, które trzeba chronić|Wpisuje się do niej te, których zostało bardzo mało.
${own('Jakie największe zwierzę żyje w polskich lasach?')}|Żubr|Żubr waży prawie tonę i jest w Polsce pod ochroną.
Co to jest rezerwat przyrody?|Miejsce, gdzie przyrodę się chroni i zostawia w spokoju|Nie wolno tam wycinać lasu, polować ani zrywać kwiatów.
Po co lasowi wilki?|Łapią słabe i chore zwierzęta|Dzięki temu choroby się nie rozprzestrzeniają.
Czym sowa jest pożyteczna dla pola?|Łapie myszy|Myszy zjadają ziarno, a sowa pilnuje plonów.
Dlaczego biedronka jest przyjaciółką ogrodnika?|Zjada mszyce|Mszyce wysysają sok z roślin i rośliny giną.
Dlaczego motylom potrzebne są kwiaty?|Piją z nich nektar|A przelatując z kwiatu na kwiat, motyle zapylają rośliny.
Dlaczego nie wolno zabierać żółwia z przyrody do domu?|W domu jest mu źle, jego dom to przyroda|Dzikie zwierzę w niewoli często choruje.
Jak pomóc bezdomnym zwierzętom?|Razem z dorosłymi zanieść karmę do schroniska|W schronisku zwierzęta są karmione, leczone i szuka się im rodziny.
Dlaczego słonie trzeba chronić?|Poluje się na nie dla kłów|Przez kłusowników słoni jest coraz mniej.
Dlaczego na Ziemi zostało mało pand?|Bo wycina się lasy bambusowe|Pandy jedzą prawie sam bambus.
Dlaczego hałas statków szkodzi wielorybom?|Przeszkadza im słyszeć się nawzajem|Wieloryby rozmawiają dźwiękami na ogromne odległości.
Dlaczego nie wolno dotykać ptasich gniazd?|Ptaki mogą porzucić gniazdo|Spłoszony ptak często nie wraca do jajek.
Po co zostawiać na łące nieskoszone kwiaty?|Żeby pszczoły i trzmiele miały co jeść|Na równo przystrzyżonym trawniku owady głodują.
Po co w lesie zostawia się stare powalone drzewa?|Mieszkają w nich chrząszcze, grzyby i małe zwierzęta|Spróchniały pień to cały dom.
Dlaczego dzikich zwierząt nie wolno głaskać?|Mogą ugryźć albo być chore|Dzikie zwierzę boi się człowieka i się broni.
Dlaczego wiosną nie wolno łowić ryb?|Bo ryby składają wtedy ikrę|Z ikry wylęgnie się narybek — przyszłe ryby.
Dlaczego łabędzie odlatują jesienią?|Bo zimą woda zamarza i nie mają gdzie znaleźć jedzenia|Wiosną wracają do domu.
Kto mieszka w dziupli starego drzewa?|Sowy, wiewiórki i nietoperze|Dziupla to gotowy ciepły domek.
`,
  energy: `
Skąd bierze się prąd w gniazdku?|Z elektrowni|Prąd płynie przewodami z elektrowni do każdego domu.
Co zrobić, wychodząc z pokoju?|Zgasić światło|Lampa, która nikomu nie świeci, marnuje energię.
Co zrobić z telewizorem, którego nikt nie ogląda?|Wyłączyć go|Włączony telewizor zużywa prąd, nawet gdy nikt na niego nie patrzy.
Co zamienia światło słońca w prąd?|Panel słoneczny|Panele stawia się na dachach, gdzie jest dużo słońca.
Co obraca łopaty wiatraka?|Wiatr|Wiatrak zamienia siłę wiatru w prąd.
Co wytwarza prąd w elektrowni wodnej?|Woda spadająca z tamy|Strumień wody obraca ogromne turbiny.
Po co w dzień odsłaniać zasłony?|Żeby korzystać ze światła słońca|Słońce świeci za darmo i niczego nie zanieczyszcza.
Dlaczego nie wolno długo trzymać otwartej lodówki?|Nagrzewa się i zużywa więcej prądu|Żeby znów się schłodzić, lodówka pracuje mocniej.
Dlaczego akumulatorki są lepsze od zwykłych baterii?|Można je ładować wiele razy|Jeden akumulatorek zastępuje setki baterii.
Co zrobić z ładowarką, gdy telefon się naładuje?|Wyjąć ją z gniazdka|Ładowarka w gniazdku pobiera prąd nawet bez telefonu.
Ile wody nalewać do czajnika?|Tyle, ile teraz potrzeba|Nadmiar wody czajnik grzeje dłużej i zużywa więcej prądu.
Dlaczego garnek przykrywa się pokrywką?|Żeby jedzenie szybciej się zagotowało|Pod pokrywką ciepło nie ucieka i kuchenka pracuje krócej.
Dlaczego zimą trzeba zamykać drzwi i okna?|Żeby ciepło nie uciekało z domu|Przez otwarte okno ciepło ucieka na dwór.
Co zrobić, gdy w domu jest chłodno?|Najpierw cieplej się ubrać|Sweter grzeje, a paliwa nie spala.
Co zrobić z komputerem po skończonej zabawie?|Wyłączyć go|Komputer w trybie uśpienia też zużywa prąd.
Z czego wytwarza się prąd w elektrowni cieplnej?|Z węgla albo gazu|Gdy się palą, do powietrza idzie dużo dymu.
Dlaczego węgiel i gaz kiedyś się skończą?|Bo ich zapasy pod ziemią się nie odnawiają|Powstawały przez miliony lat.
Jaką energię nazywa się odnawialną?|Tę, która się nie kończy: słońca, wiatru, wody|Słońce i wiatr będą i jutro, i za tysiąc lat.
Jak dom ze słonecznymi panelami ma światło w nocy?|W dzień magazynuje energię w akumulatorach|Energii zgromadzonej w ciągu dnia wystarcza na wieczór.
Gdzie najlepiej stawiać wiatraki?|Tam, gdzie często wieje: na polach i nad morzem|Im silniejszy wiatr, tym więcej prądu.
Jaka energia napędza rower?|Siła twoich nóg|Rower nie potrzebuje ani benzyny, ani prądu.
Co napędza tramwaj i trolejbus?|Prąd z przewodów|Dlatego nie dymią na ulicach.
Co spala zwykły samochód, żeby jechać?|Benzynę|Benzynę robi się z ropy naftowej.
Z czego robi się benzynę?|Z ropy naftowej|Ropę wydobywa się z głębi ziemi.
Jak suszyć pranie, nie zużywając prądu?|Na sznurku, na słońcu i wietrze|Słońce i wiatr suszą za darmo.
Jak wejść na pierwsze piętro i zaoszczędzić energię?|Schodami|Winda zużywa prąd, a schody są do tego zdrowe.
Do czego służy pokrętło na kaloryferze?|Żeby nie grzać mocniej, niż trzeba|Nadmiar ciepła to niepotrzebnie spalone paliwo.
Jaka latarka nie potrzebuje baterii?|Taka, która ładuje się od słońca albo na korbkę|Zakręcisz korbką — i jest światło.
Po co na dachach stawia się panele słoneczne?|Żeby dom sam wytwarzał sobie prąd|W słoneczny dzień panele dają prąd na cały dom.
Skąd nasze ciało bierze energię?|Z jedzenia|Jedzenie to paliwo dla człowieka.
Skąd energię biorą rośliny?|Ze światła słońca|Liście łapią światło i zamieniają je w pokarm.
Dlaczego nie wolno bawić się gniazdkiem?|Prąd elektryczny jest bardzo niebezpieczny|Prąd może mocno porazić.
Czym oświetlano domy, gdy nie było prądu?|Świecami i lampami naftowymi|Światło elektryczne pojawiło się dopiero trochę ponad sto lat temu.
Po co na sprzętach jest naklejka z literami od A do G?|Pokazuje, ile energii zużywa urządzenie|Litera A oznacza, że urządzenie jest najbardziej oszczędne.
Dlaczego nocą w pustych biurach trzeba gasić światło?|Marnuje energię i przeszkadza ptakom|Jasne okna mylą drogę wędrownym ptakom.
`,
};
