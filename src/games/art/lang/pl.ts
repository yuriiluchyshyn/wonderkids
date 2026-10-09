import type { MixId, PaintId } from '../content/data';
import type { ArtTexts } from './types';

/** The Art galaxy in Polish. */

/** A paint: its colour («Czerwony») and the paint itself in the accusative («farbę czerwoną»). */
const PAINTS: Record<PaintId, [name: string, paint: string]> = {
  red: ['Czerwony', 'czerwoną'], yellow: ['Żółty', 'żółtą'], blue: ['Niebieski', 'niebieską'], white: ['Biały', 'białą'], black: ['Czarny', 'czarną'], green: ['Zielony', 'zieloną'], orange: ['Pomarańczowy', 'pomarańczową'],
};
/** A mixed colour: its name, and what a thing is painted («na zielono»). */
const MIXES: Record<MixId, [name: string, how: string]> = {
  green: ['Zielony', 'na zielono'], orange: ['Pomarańczowy', 'na pomarańczowo'], purple: ['Fioletowy', 'na fioletowo'], pink: ['Różowy', 'na różowo'], grey: ['Szary', 'na szaro'],
  sky: ['Błękitny', 'na błękitno'], navy: ['Granatowy', 'na granatowo'], peach: ['Brzoskwiniowy', 'na brzoskwiniowo'], brown: ['Brązowy', 'na brązowo'], lime: ['Seledynowy', 'na seledynowo'],
  forest: ['Ciemnozielony', 'na ciemnozielono'],
};
/**
 * The things to colour, in the order of `STEPS`: the name, and the accusative
 * the sentence needs («Pomaluj żabkę na zielono») — the colour then needs no
 * gender of its own.
 */
const THINGS: [name: string, whom: string][] = [
  ['Żabka', 'żabkę'], ['Pomarańcza', 'pomarańczę'], ['Listek', 'listek'], ['Marchewka', 'marchewkę'],
  ['Winogrona', 'winogrona'], ['Bakłażan', 'bakłażan'], ['Krokodyl', 'krokodyla'], ['Dynia', 'dynię'],
  ['Ogórek', 'ogórek'], ['Lisek', 'liska'], ['Parasolka', 'parasolkę'],
  ['Świnka', 'świnkę'], ['Słoń', 'słonia'], ['Kwiatek', 'kwiatek'],
  ['Myszka', 'myszkę'], ['Wieloryb', 'wieloryba'], ['Flaming', 'flaminga'],
  ['Borówka', 'borówkę'], ['Dżinsy', 'dżinsy'], ['Wilk', 'wilka'],
  ['Brzoskwinia', 'brzoskwinię'], ['Motyl', 'motyla'], ['Kokardka', 'kokardkę'],
  ['Niedźwiedź', 'niedźwiedzia'], ['Kasztan', 'kasztan'], ['Czekolada', 'czekoladę'],
  ['Jabłko', 'jabłko'], ['Gruszka', 'gruszkę'], ['Sałata', 'sałatę'],
  ['Choinka', 'choinkę'], ['Brokuł', 'brokuł'], ['Ziemniak', 'ziemniaka'],
];
const low = (text: string) => text.toLocaleLowerCase('pl');
const first = <K extends string>(of: Record<K, [string, string]>) => Object.fromEntries(Object.entries<[string, string]>(of).map(([id, [name]]) => [id, name])) as Record<K, string>;

export const pl: ArtTexts = {
  cards: {
    title: 'Sztuka',
    games: {
      mixer: {
        label: 'Mieszanie kolorów',
        blurb: 'Mieszaj farby w kociołku i koloruj obrazki',
        intro: 'Obrazek jest jeszcze szary — trzeba go pokolorować! Wlej do czarodziejskiego kociołka dwie farby, żeby powstał potrzebny kolor.',
      },
    },
  },
  introFor: (step) => {
    if (step === 4) return 'Teraz są też biała i czarna farba. Biała rozjaśnia kolor, a czarna go przyciemnia.';
    if (step === 8) return 'Najtrudniejsze kolory powstają, gdy gotowy kolor zmieszasz z innym. Spróbuj!';
    return undefined;
  },
  paints: first(PAINTS),
  mixes: first(MIXES),
  thing: (at) => THINGS[at][0],
  prompt: (at, mix) => `Pomaluj ${THINGS[at][1]} ${MIXES[mix][1]}. Jakie dwie farby trzeba zmieszać?`,
  hint: (mix, a, b) => `Kolor ${low(MIXES[mix][0])} powstanie, gdy zmieszasz farbę ${PAINTS[a][1]} i ${PAINTS[b][1]}.`,
  outro: (mix, a, b) => `${PAINTS[a][0]} i ${low(PAINTS[b][0])} razem dają ${low(MIXES[mix][0])}!`,
};
