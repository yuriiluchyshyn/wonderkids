import type { Assoc } from '../tasks';
import TEXTS from '@/locales/app/uk/games/language.json';

const J = TEXTS.content.assoc;

/**
 * Words linked by meaning («Холодно — Сніг» / "Cold — Snow"), the same pairs
 * in both languages, easy → harder. The last field is the group: pairs of one
 * group could be mixed up with each other, so they never meet in one task.
 *
 *   ukA | ukB | enA | enB | emojiA | emojiB | group
 */
const RAW = J.RAW;

const ALL = RAW.trim()
  .split('\n')
  .map((line) => line.split('|'));

export const ASSOC_UK: Assoc[] = ALL.map(([a, b, , , ea, eb, group]) => ({ a, b, ea, eb, group }));
export const ASSOC_EN: Assoc[] = ALL.map(([, , a, b, ea, eb, group]) => ({ a, b, ea, eb, group }));

/** The same pairs in Polish, row for row with `RAW`. */
const POLISH = `
zimno|śnieg
deszcz|parasol
noc|księżyc
pszczoła|miód
krowa|mleko
kura|jajko
pies|kość
małpa|banan
zając|marchewka
ryba|woda
klucz|zamek
lekarz|lekarstwo
upał|słońce
sen|łóżko
ptak|pióra
owca|wełna
wiewiórka|orzech
pająk|pajęczyna
kucharz|garnek
strażak|ogień
pilot|samolot
kosmonauta|rakieta
król|korona
oko|okulary
ręka|rękawiczka
noga|skarpetka
ząb|szczoteczka
chleb|masło
herbata|filiżanka
tort|świeczki
jabłko|drzewo
pociąg|tory
statek|morze
samochód|droga
ognisko|dym
zima|sanki
lato|lody
grzmot|błyskawica
gwiazda|niebo
motyl|kwiat
panda|bambus
ślimak|muszla
wielbłąd|pustynia
wieloryb|ocean
nauczyciel|szkoła
malarz|pędzel
rolnik|traktor
piosenkarz|mikrofon
klaun|cyrk
czarodziej|różdżka
pirat|skarb
głowa|czapka
szyja|szalik
palec|pierścionek
zupa|łyżka
pizza|ser
winogrona|sok
lampa|światło
mydło|wanna
telefon|dzwonek
zegar|czas
pieniądze|portfel
prezent|święto
list|poczta
rower|kask
autobus|przystanek
grzyb|las
jesień|liście
wiatr|latawiec
piłka|bramka
łuk|strzała
gitara|struny
aparat|zdjęcie
wędka|haczyk
ranek|śniadanie
choinka|święta
siekiera|drewno
zoo|lew
biblioteka|książki
lód|łyżwy
zeszyt|długopis
plecak|podręcznik
pingwin|kra
wulkan|lawa
nasiono|kiełek
góra|szczyt
rzeka|most
pianino|muzyka
szachy|szachownica
kino|popcorn
szpital|karetka
policja|syrena
murarz|cegła
młotek|gwóźdź
igła|nitka
nożyczki|papier
kompas|północ
termometr|temperatura
teleskop|gwiazdy
magnes|żelazo
`
  .trim()
  .split('\n')
  .map((line) => line.split('|'));

export const ASSOC_PL: Assoc[] = ALL.map(([, , , , ea, eb, group], i) => ({ a: POLISH[i][0], b: POLISH[i][1], ea, eb, group }));
