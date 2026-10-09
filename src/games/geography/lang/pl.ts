import { COUNTRIES as LIST } from '../content/countries';
import { BIOME_ANIMALS, CONTINENT_ANIMALS, DAY_NIGHT as DAY_NIGHT_LIST, TIME_SHIFTS } from '../content/data';
import { ANIMAL_FACTS } from './animalFacts.pl';
import { CITIES, DAY_NIGHT, LANDMARKS, LANDMARK_FACTS } from './capitals.pl';
import { ANIMALS, MAP_ANIMALS, ZONES } from './nature.pl';
import { OCEANS, PLACES, RIVERS, SEAS } from './oceans.pl';
import { CAPITALS, COUNTRIES, IN_CONTINENT, LOOKS, REGIONS } from './places.pl';
import { cap } from './shared';
import type { GeographyTexts } from './types';

/** The Geography galaxy in Polish. */

const name = (id: string) => COUNTRIES[id].split('|')[0];
/** «flaga Ukrainy», «stolica Ukrainy» */
const of = (id: string) => COUNTRIES[id].split('|')[1];
const continentOf = Object.fromEntries(LIST.map((c) => [c.id, c.continent]));
const partOf = (id: string) => IN_CONTINENT[continentOf[id]];
const homeOf = Object.fromEntries(CONTINENT_ANIMALS.map((a) => [a.id, a.home]));
const first = new Set(BIOME_ANIMALS.map((a) => a.id));
const kyivAt = Object.fromEntries(DAY_NIGHT_LIST.map((q) => [q.id, q.kyiv]));
const shiftOf = Object.fromEntries(TIME_SHIFTS.map((t) => [t.id, t]));
const hours = (n: number) => `${n} ${n === 1 ? 'godzinę' : n >= 2 && n <= 4 ? 'godziny' : 'godzin'}`;

export const pl: GeographyTexts = {
  cards: {
    title: 'Geografia',
    games: {
      flags: {
        label: 'Zgadnij flagę',
        blurb: `Wszystkie flagi świata — jest ich ${LIST.length}, zaczynamy od najbardziej znanych`,
        intro: 'Każdy kraj ma swoją flagę. Posłuchaj nazwy kraju i znajdź jego flagę wśród sześciu! Na każdym stopniu czeka pięć nowych flag, a znajome wracają, żeby nie wyleciały ci z głowy.',
      },
      continents: {
        label: 'Ułóż mapę',
        blurb: 'Rozstaw zwierzęta i flagi na kontynentach',
        intro: 'Na Ziemi jest siedem kontynentów. Przeciągnij zwierzątko albo flagę na ten kontynent, na którym jest ich dom.',
      },
      biomes: {
        label: 'Zwierzęta i strefy przyrodnicze',
        blurb: `Zwierzęta z siedmiu stref przyrodniczych — od Arktyki po sawannę (jest ich ${Object.keys(ANIMALS).length})`,
        intro: 'Każde zwierzątko lubi swój dom. Jednym jest dobrze wśród lodu, a innym — na gorącej pustyni. Pomóż im wrócić do domu! Dalej na drodze czekają nowe zwierzęta, zagadki „Kto to?” i zadania „Kto tu nie pasuje?”.',
      },
      oceans: {
        label: 'Morza i oceany',
        blurb: 'Pięć oceanów, pół setki mórz i zatok, wyspy, kraje i rzeki',
        intro: 'Na naszej planecie jest pięć oceanów. Posłuchaj, dokąd płynąć, i dotknij właściwego oceanu na mapie! Dalej na drodze czekają zagadki o oceanach, morzach i zatokach, wyspach, krajach i rzekach.',
      },
      capitals: {
        label: 'Stolice i strefy czasowe',
        blurb: `Stolice świata (jest ich ${Object.keys(CAPITALS).length}), dzień i noc oraz różnica czasu`,
        intro: 'Rozpoznaj stolicę po jej najsłynniejszej budowli i po nazwie kraju. A jeszcze dowiemy się, dlaczego w jednych miastach jest dzień, kiedy w innych noc, i która jest tam godzina!',
      },
    },
  },
  country: name,
  region: (id) => REGIONS[id][0],
  flags: {
    ask: (id) => `Znajdź flagę ${of(id)}.`,
    hint: (id) => LOOKS[id] ?? `${name(id)} to kraj w ${partOf(id)}. Przyjrzyj się kolorom i rysunkom na flagach.`,
    stories: (id) => [
      `Tak, to flaga ${of(id)}!`,
      LOOKS[id],
      `Właśnie tak! ${name(id)} to kraj w ${partOf(id)}.`,
      `Świetnie! Znasz flagę ${of(id)}.`,
      `Brawo! To ${name(id)}.`,
      `Trafione! Flagi ${of(id)} już nie zapomnisz.`,
      `Świetna pamięć! To flaga ${of(id)}.`,
      `Tak trzymaj! To ${name(id)}. Szukaj tego kraju na mapie w ${partOf(id)}.`,
      `Jest! To flaga ${of(id)}.`,
      `Dokładnie! ${name(id)}. Zapamiętaj kolory tej flagi.`,
      `Tak! Jeśli zobaczysz tę flagę na zawodach — to ${name(id)}.`,
    ],
  },
  map: {
    animalAsk: (id) => `Gdzie mieszka ${MAP_ANIMALS[id]}? Przeciągnij na mapę.`,
    animalHint: (id) => `Szukaj kontynentu, który mruga. ${cap(MAP_ANIMALS[id])} mieszka ${REGIONS[homeOf[id]][2]}.`,
    animalFacts: (id) => ANIMAL_FACTS[id],
    // No verb here: some countries are plural in Polish («Niemcy leżą»), some are not.
    countryAsk: (id) => `${name(id)} — na którym to kontynencie? Przeciągnij flagę.`,
    countryHint: (id) => `Szukaj na mapie: ${REGIONS[continentOf[id]][0]} — ten kontynent mruga.`,
    countryYes: (id) => [`Tak! ${name(id)} to kraj w ${partOf(id)}.`, `Właśnie tak: ${name(id)} znajdziesz ${REGIONS[continentOf[id]][2]}.`],
  },
  zone: (id) => ZONES[id],
  animal: (id) => {
    const [animal, clue, fact, ...more] = ANIMALS[id];
    return { name: animal, clue, fact, facts: ANIMAL_FACTS[id] ?? (first.has(id) ? [fact] : [fact, ...more]) };
  },
  zones: {
    whereAsk: (id) => `Gdzie mieszka ${ANIMALS[id][0]}?`,
    whereHint: (id) => `Pomyśl, gdzie zwierzątku będzie dobrze. ${ANIMALS[id][2]}`,
    whoAsk: (id) => `Kto mieszka ${ZONES[id].where}?`,
    whoHint: (id) => `Przypomnij sobie, jaka to strefa przyrodnicza. ${ZONES[id].signs[0]}`,
    riddleAsk: (id) => `Kto to? ${ANIMALS[id][1]}`,
    riddleHint: (id, home) => `To zwierzę mieszka ${ZONES[home].where}. Jego nazwa zaczyna się na literę „${ANIMALS[id][0][0].toUpperCase()}”.`,
    oddAsk: 'Kto tu nie pasuje? Wszyscy pozostali to sąsiedzi: mieszkają w tej samej strefie przyrodniczej.',
    oddHint: (id) => `Wszyscy sąsiedzi mieszkają ${ZONES[id].where}. Znajdź tego, kto mieszka gdzie indziej.`,
    zoneAsk: (id, i) => `Jaka to strefa przyrodnicza? ${ZONES[id].signs[i]}`,
    zoneHint: (id, dwellers) => (dwellers.length > 0 ? `Tu mieszkają: ${dwellers.map((a) => ANIMALS[a][0]).join(', ')}.` : ZONES[id].signs[0]),
    zoneYes: (id, i) => `Tak, to ${ZONES[id].it}! ${ZONES[id].signs[i]}`,
  },
  ocean: (id) => OCEANS[id],
  seas: {
    sailTo: (id) => `Płyń do ${REGIONS[id][1]}!`,
    riddleAsk: (id, i) => `Płyń do ${OCEANS[id].riddles[i]}!`,
    hint: (clue) => `Szukaj wody, która mieni się falami. ${clue}`,
    itIs: (id) => `To ${REGIONS[id][0]}.`,
    sea: (id) => ({ ask: `${SEAS[id][0]} to część którego oceanu? Płyń tam!`, fact: SEAS[id][1] }),
    place: (id) => ({ ask: `${PLACES[id][0]} Płyń tam!`, fact: PLACES[id][1] }),
    river: (id) => ({ ask: `Do którego oceanu niesie swoje wody rzeka ${RIVERS[id][0]}? Płyń tam!`, fact: RIVERS[id][1] }),
    shoreAsk: (id) => `Który ocean oblewa brzegi ${of(id)}? Płyń tam!`,
    shoreYes: (id, ocean) => `Tak! Brzegi ${of(id)} oblewa ${REGIONS[ocean][0]}.`,
  },
  capitals: {
    landmark: (id) => {
      const [caption, seen, capital, country] = LANDMARKS[id];
      return {
        name: caption,
        capital,
        ask: `W której stolicy można zobaczyć ${seen}?`,
        hint: `${caption} to symbol ${country}. Przypomnij sobie stolicę tego kraju.`,
        facts: LANDMARK_FACTS[id],
      };
    },
    capital: (id) => CAPITALS[id],
    ask: (id) => `Jaka jest stolica ${of(id)}?`,
    hint: (id) => `Nazwa tej stolicy zaczyna się na literę „${CAPITALS[id][0]}”.`,
    stories: (id) => {
      const pair = `${CAPITALS[id]} to stolica ${of(id)}`;
      return [
        `Tak! ${pair}.`,
        `Właśnie tak! Stolica ${of(id)} to ${CAPITALS[id]}.`,
        `Świetnie! ${CAPITALS[id]} to najważniejsze miasto ${of(id)}.`,
        `Brawo! ${pair}. To w ${partOf(id)}.`,
        `Trafione! ${name(id)} i ${CAPITALS[id]} — zapamiętaj tę parę.`,
        `Świetna pamięć! ${pair}.`,
        `Tak trzymaj! Szukaj na mapie miasta ${CAPITALS[id]} w ${partOf(id)}.`,
        `Jest! ${pair}.`,
        `Dokładnie! ${name(id)}: kiedy odwiedzisz ten kraj, zobaczysz jego stolicę — ${CAPITALS[id]}.`,
        `Dobrze! ${pair}. Teraz już to wiesz.`,
      ];
    },
    countryAsk: (id) => `${CAPITALS[id]} to stolica którego kraju?`,
    countryHint: (id) => LOOKS[id] ?? `Ten kraj leży w ${partOf(id)}. Jego nazwa zaczyna się na literę „${name(id)[0]}”.`,
    day: 'Dzień',
    night: 'Noc',
    dayNight: (id) => {
      const now = kyivAt[id] === 'day' ? 'dzień' : 'noc';
      return { ask: `W Kijowie jest teraz ${now}. A co w ${DAY_NIGHT[id][0]}?`, caption: `Kijów: ${now}`, why: DAY_NIGHT[id][1] };
    },
    dayNightHint: 'Ziemia kręci się jak bączek. Słońce oświetla tylko jedną jej stronę: tam jest dzień, a po drugiej stronie — noc.',
    clock: (id, hour) => {
      const t = shiftOf[id];
      const city = CITIES[id];
      const by = Math.abs(t.shift);
      const side = t.shift > 0 ? 'później' : 'wcześniej';
      const rule = t.shift === 0 ? `W ${city} jest ta sama godzina co w Kijowie` : `${'winter' in t ? 'Zimą w' : 'W'} ${city} jest o ${hours(by)} ${side} niż w Kijowie`;
      return {
        ask: `W Kijowie jest ${hour}:00. ${rule}. Która godzina jest w ${city}?`,
        caption: `Kijów — ${hour}:00`,
        hint:
          t.shift === 0
            ? 'To miasto leży w tej samej strefie czasowej co Kijów — zegary pokazują to samo.'
            : `„O ${hours(by)} ${side}” — to ${hour} ${t.shift > 0 ? 'plus' : 'minus'} ${by}.`,
        yes: `Tak! Kiedy w Kijowie jest ${hour}:00, w ${city} jest ${hour + t.shift}:00.`,
      };
    },
    hourSay: (hour) => `${hour}:00`,
  },
};
