import { pairs } from './shared';

/** Countries, their flags and capitals in Polish. A country is written `nominative|genitive` («flaga Ukrainy»). */

export const COUNTRIES = pairs(`
ua Ukraina|Ukrainy, us Stany Zjednoczone|Stanów Zjednoczonych, gb Wielka Brytania|Wielkiej Brytanii, fr Francja|Francji, de Niemcy|Niemiec, it Włochy|Włoch,
pl Polska|Polski, jp Japonia|Japonii, ca Kanada|Kanady, es Hiszpania|Hiszpanii, cn Chiny|Chin, br Brazylia|Brazylii,
tr Turcja|Turcji, gr Grecja|Grecji, eg Egipt|Egiptu, in Indie|Indii, au Australia|Australii, mx Meksyk|Meksyku,
ar Argentyna|Argentyny, ch Szwajcaria|Szwajcarii, se Szwecja|Szwecji, no Norwegia|Norwegii, nl Holandia|Holandii, pt Portugalia|Portugalii,
kr Korea Południowa|Korei Południowej, il Izrael|Izraela, at Austria|Austrii, cz Czechy|Czech, be Belgia|Belgii, dk Dania|Danii,
fi Finlandia|Finlandii, ie Irlandia|Irlandii, hu Węgry|Węgier, ro Rumunia|Rumunii, bg Bułgaria|Bułgarii, hr Chorwacja|Chorwacji,
sk Słowacja|Słowacji, lt Litwa|Litwy, lv Łotwa|Łotwy, ee Estonia|Estonii, md Mołdawia|Mołdawii, ge Gruzja|Gruzji,
sa Arabia Saudyjska|Arabii Saudyjskiej, ae Zjednoczone Emiraty Arabskie|Zjednoczonych Emiratów Arabskich, th Tajlandia|Tajlandii, vn Wietnam|Wietnamu, za Republika Południowej Afryki|Republiki Południowej Afryki, nz Nowa Zelandia|Nowej Zelandii,
cu Kuba|Kuby, jm Jamajka|Jamajki, cl Chile|Chile, co Kolumbia|Kolumbii, pe Peru|Peru, is Islandia|Islandii,
rs Serbia|Serbii, si Słowenia|Słowenii, cy Cypr|Cypru, mt Malta|Malty, lu Luksemburg|Luksemburga, mc Monako|Monako,
kz Kazachstan|Kazachstanu, am Armenia|Armenii, az Azerbejdżan|Azerbejdżanu, uz Uzbekistan|Uzbekistanu, mn Mongolia|Mongolii, pk Pakistan|Pakistanu,
id Indonezja|Indonezji, ph Filipiny|Filipin, my Malezja|Malezji, sg Singapur|Singapuru, np Nepal|Nepalu, ir Iran|Iranu,
iq Irak|Iraku, qa Katar|Kataru, jo Jordania|Jordanii, lb Liban|Libanu, ma Maroko|Maroka, tn Tunezja|Tunezji,
dz Algieria|Algierii, ke Kenia|Kenii, ng Nigeria|Nigerii, et Etiopia|Etiopii, gh Ghana|Ghany, tz Tanzania|Tanzanii,
ve Wenezuela|Wenezueli, uy Urugwaj|Urugwaju, py Paragwaj|Paragwaju, bo Boliwia|Boliwii, ec Ekwador|Ekwadoru, cr Kostaryka|Kostaryki,
pa Panama|Panamy, do Dominikana|Dominikany, ht Haiti|Haiti, bs Bahamy|Bahamów, gt Gwatemala|Gwatemali, hn Honduras|Hondurasu,
me Czarnogóra|Czarnogóry, mk Macedonia Północna|Macedonii Północnej, al Albania|Albanii, ba Bośnia i Hercegowina|Bośni i Hercegowiny, ad Andora|Andory, li Liechtenstein|Liechtensteinu,
sm San Marino|San Marino, va Watykan|Watykanu, kp Korea Północna|Korei Północnej, af Afganistan|Afganistanu, bd Bangladesz|Bangladeszu, lk Sri Lanka|Sri Lanki,
mm Mjanma|Mjanmy, kh Kambodża|Kambodży, la Laos|Laosu, bt Bhutan|Bhutanu, mv Malediwy|Malediwów, kw Kuwejt|Kuwejtu,
bh Bahrajn|Bahrajnu, om Oman|Omanu, ye Jemen|Jemenu, sy Syria|Syrii, tj Tadżykistan|Tadżykistanu, tm Turkmenistan|Turkmenistanu,
kg Kirgistan|Kirgistanu, bn Brunei|Brunei, tl Timor Wschodni|Timoru Wschodniego, ly Libia|Libii, sd Sudan|Sudanu, ss Sudan Południowy|Sudanu Południowego,
sn Senegal|Senegalu, ci Wybrzeże Kości Słoniowej|Wybrzeża Kości Słoniowej, cm Kamerun|Kamerunu, ug Uganda|Ugandy, rw Rwanda|Rwandy, zw Zimbabwe|Zimbabwe,
zm Zambia|Zambii, ao Angola|Angoli, mz Mozambik|Mozambiku, mg Madagaskar|Madagaskaru, na Namibia|Namibii, bw Botswana|Botswany,
ml Mali|Mali, ne Niger|Nigru, td Czad|Czadu, bf Burkina Faso|Burkina Faso, gn Gwinea|Gwinei, sl Sierra Leone|Sierra Leone,
lr Liberia|Liberii, tg Togo|Togo, bj Benin|Beninu, ga Gabon|Gabonu, cg Republika Konga|Republiki Konga, cd Demokratyczna Republika Konga|Demokratycznej Republiki Konga,
cf Republika Środkowoafrykańska|Republiki Środkowoafrykańskiej, gq Gwinea Równikowa|Gwinei Równikowej, er Erytrea|Erytrei, dj Dżibuti|Dżibuti, so Somalia|Somalii, bi Burundi|Burundi,
mw Malawi|Malawi, ls Lesotho|Lesotho, sz Eswatini|Eswatini, mr Mauretania|Mauretanii, gm Gambia|Gambii, gw Gwinea Bissau|Gwinei Bissau,
cv Republika Zielonego Przylądka|Republiki Zielonego Przylądka, st Wyspy Świętego Tomasza i Książęca|Wysp Świętego Tomasza i Książęcej, km Komory|Komorów, sc Seszele|Seszeli, mu Mauritius|Mauritiusa, ni Nikaragua|Nikaragui,
sv Salwador|Salwadoru, bz Belize|Belize, gy Gujana|Gujany, sr Surinam|Surinamu, tt Trynidad i Tobago|Trynidadu i Tobago, bb Barbados|Barbadosu,
lc Saint Lucia|Saint Lucii, vc Saint Vincent i Grenadyny|Saint Vincent i Grenadyn, gd Grenada|Grenady, ag Antigua i Barbuda|Antigui i Barbudy, dm Dominika|Dominiki, kn Saint Kitts i Nevis|Saint Kitts i Nevis,
fj Fidżi|Fidżi, pg Papua-Nowa Gwinea|Papui-Nowej Gwinei, ws Samoa|Samoa, to Tonga|Tonga, vu Vanuatu|Vanuatu, sb Wyspy Salomona|Wysp Salomona,
ki Kiribati|Kiribati, tv Tuvalu|Tuvalu, nr Nauru|Nauru, pw Palau|Palau, fm Mikronezja|Mikronezji, mh Wyspy Marshalla|Wysp Marshalla
`);

export const LOOKS: Record<string, string> = {
  ua: 'Ta flaga ma dwa pasy: niebieski jak niebo i żółty jak pole pszenicy.',
  jp: 'Ta flaga ma czerwone koło pośrodku białego tła.',
  fr: 'Trzy pionowe pasy: niebieski, biały i czerwony.',
  us: 'Czerwone i białe pasy oraz niebieski narożnik z gwiazdkami.',
  ca: 'Czerwony liść klonu pośrodku.',
  br: 'Zielona flaga z żółtym rombem i niebieskim kołem.',
  it: 'Trzy pionowe pasy: zielony, biały i czerwony.',
  de: 'Trzy poziome pasy: czarny, czerwony i złoty.',
  gb: 'Niebieska flaga z czerwonymi i białymi krzyżami.',
  pl: 'Dwa pasy: biały na górze i czerwony na dole.',
  cn: 'Czerwona flaga z żółtymi gwiazdami w rogu.',
  in: 'Pomarańczowy, biały i zielony pas oraz niebieskie koło pośrodku.',
  au: 'Niebieska flaga z gwiazdami i małą brytyjską flagą w rogu.',
  eg: 'Czerwony, biały i czarny pas oraz złoty orzeł pośrodku.',
  es: 'Pas czerwony, szeroki żółty i znów czerwony.',
  gr: 'Niebieskie i białe pasy oraz biały krzyż w rogu.',
  se: 'Niebieska flaga z żółtym krzyżem.',
  ch: 'Czerwony kwadrat z białym krzyżem.',
  tr: 'Czerwona flaga z białym półksiężycem i gwiazdą.',
  mx: 'Zielony, biały i czerwony pas oraz orzeł pośrodku.',
  ar: 'Błękitny, biały i błękitny pas oraz słoneczko pośrodku.',
  kr: 'Biała flaga z czerwono-niebieskim kołem pośrodku.',
};

export const CAPITALS = pairs(`
ua Kijów, us Waszyngton, gb Londyn, fr Paryż, de Berlin, it Rzym, pl Warszawa, jp Tokio,
ca Ottawa, es Madryt, cn Pekin, br Brasília, tr Ankara, gr Ateny, eg Kair, in Nowe Delhi,
au Canberra, mx Meksyk, ar Buenos Aires, ch Berno, se Sztokholm, no Oslo, nl Amsterdam, pt Lizbona,
kr Seul, at Wiedeń, cz Praga, be Bruksela, dk Kopenhaga, fi Helsinki, ie Dublin, hu Budapeszt,
ro Bukareszt, bg Sofia, hr Zagrzeb, sk Bratysława, lt Wilno, lv Ryga, ee Tallinn, md Kiszyniów,
ge Tbilisi, sa Rijad, ae Abu Zabi, th Bangkok, vn Hanoi, nz Wellington, cu Hawana, jm Kingston,
cl Santiago, co Bogota, pe Lima, is Reykjavík, rs Belgrad, si Lublana, cy Nikozja, mt Valletta,
kz Astana, am Erywań, az Baku, uz Taszkent, mn Ułan Bator, pk Islamabad, ph Manila, my Kuala Lumpur,
np Katmandu, ir Teheran, iq Bagdad, qa Doha, jo Amman, lb Bejrut, ma Rabat, ke Nairobi,
ng Abudża, et Addis Abeba, gh Akra, ve Caracas, uy Montevideo, py Asunción, ec Quito, cr San José
`);

/** Continents and oceans: `on the map|«płyń do …» / «flaga …» (genitive)|«mieszka …» (where)`. */
export const REGIONS: Record<string, [name: string, of: string, where: string]> = {
  north_america: ['Ameryka Północna', 'Ameryki Północnej', 'w Ameryce Północnej'],
  south_america: ['Ameryka Południowa', 'Ameryki Południowej', 'w Ameryce Południowej'],
  europe: ['Europa', 'Europy', 'w Europie'],
  africa: ['Afryka', 'Afryki', 'w Afryce'],
  asia: ['Azja', 'Azji', 'w Azji'],
  australia: ['Australia', 'Australii', 'w Australii'],
  antarctica: ['Antarktyda', 'Antarktydy', 'na Antarktydzie'],
  pacific: ['Ocean Spokojny', 'Oceanu Spokojnego', 'w Oceanie Spokojnym'],
  atlantic: ['Ocean Atlantycki', 'Oceanu Atlantyckiego', 'w Oceanie Atlantyckim'],
  indian: ['Ocean Indyjski', 'Oceanu Indyjskiego', 'w Oceanie Indyjskim'],
  arctic: ['Ocean Arktyczny', 'Oceanu Arktycznego', 'w Oceanie Arktycznym'],
  southern: ['Ocean Południowy', 'Oceanu Południowego', 'w Oceanie Południowym'],
};

/** «kraj w …»: the part of the world a country belongs to. */
export const IN_CONTINENT: Record<string, string> = {
  europe: 'Europie',
  asia: 'Azji',
  africa: 'Afryce',
  north_america: 'Ameryce Północnej',
  south_america: 'Ameryce Południowej',
  australia: 'Australii i Oceanii',
};
