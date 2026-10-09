import { COUNTRIES as LIST } from '../content/countries';
import { BIOME_ANIMALS, CONTINENT_ANIMALS, DAY_NIGHT as DAY_NIGHT_LIST, TIME_SHIFTS } from '../content/data';
import { ANIMAL_FACTS } from './animalFacts.en';
import { CITIES, DAY_NIGHT, LANDMARKS, LANDMARK_FACTS } from './capitals.en';
import { ANIMALS, MAP_ANIMALS, ZONES } from './nature.en';
import { OCEANS, PLACES, RIVERS, SEAS } from './oceans.en';
import { CAPITALS, COUNTRIES, IN_CONTINENT, LOOKS, REGIONS } from './places.en';
import { cap } from './shared';
import type { GeographyTexts } from './types';

/** The Geography galaxy in English. */

/** «the Netherlands» in a sentence, «Netherlands» on a card. */
const the = (id: string) => COUNTRIES[id];
const bare = (id: string) => COUNTRIES[id].replace(/^the /, '');
const continentOf = Object.fromEntries(LIST.map((c) => [c.id, c.continent]));
const partOf = (id: string) => IN_CONTINENT[continentOf[id]];
const homeOf = Object.fromEntries(CONTINENT_ANIMALS.map((a) => [a.id, a.home]));
const first = new Set(BIOME_ANIMALS.map((a) => a.id));
const kyivAt = Object.fromEntries(DAY_NIGHT_LIST.map((q) => [q.id, q.kyiv]));
const shiftOf = Object.fromEntries(TIME_SHIFTS.map((t) => [t.id, t]));
const hours = (n: number) => `${n} ${n === 1 ? 'hour' : 'hours'}`;

export const en: GeographyTexts = {
  cards: {
    title: 'Geography',
    games: {
      flags: {
        label: 'Guess the Flag',
        blurb: `All ${LIST.length} flags of the world — starting with the best known`,
        intro: 'Every country has a flag of its own. Listen to the name of the country and find its flag among six! On every step there are five new flags, and the ones you know come back so that you don’t forget them.',
      },
      continents: {
        label: 'Put the Map Together',
        blurb: 'Put animals and flags on the continents',
        intro: 'There are seven continents on Earth. Drag the animal or the flag onto the continent where it belongs.',
      },
      biomes: {
        label: 'Animals and Natural Zones',
        blurb: `${Object.keys(ANIMALS).length} animals and seven natural zones — from the Arctic to the savanna`,
        intro: 'Every animal loves its own home. Some are happy among the ice, and some in the hot desert. Help them get home! Farther along the way there are new animals, “Who is it?” riddles and “Who is the odd one out?” puzzles.',
      },
      oceans: {
        label: 'Seas and Oceans',
        blurb: 'Five oceans, half a hundred seas and gulfs, islands, countries and rivers',
        intro: 'There are five oceans on our planet. Listen to where to sail, and tap the right ocean on the map! Farther along the way there are riddles about oceans, seas and gulfs, islands, countries and rivers.',
      },
      capitals: {
        label: 'Capitals and Time Zones',
        blurb: `${Object.keys(CAPITALS).length} capitals of the world, day and night, and the difference in time`,
        intro: 'Know a capital by its most famous building and by the name of its country. And we will also find out why it is day in some cities when it is night in others, and what time it is there!',
      },
    },
  },
  country: bare,
  region: (id) => REGIONS[id],
  flags: {
    ask: (id) => `Find the flag of ${the(id)}.`,
    hint: (id) => LOOKS[id] ?? `${cap(the(id))} is a country in ${partOf(id)}. Look closely at the colors and the picture on the flags.`,
    stories: (id) => [
      `Yes, this is the flag of ${the(id)}!`,
      LOOKS[id],
      `That’s right! ${cap(the(id))} is a country in ${partOf(id)}.`,
      `Wonderful! You know the flag of ${the(id)}.`,
      `Well done! This is ${the(id)}.`,
      `Spot on! You won’t forget the flag of ${the(id)} now.`,
      `What a memory! This is the flag of ${the(id)}.`,
      `Keep it up! This is ${the(id)}. Look for this country on the map in ${partOf(id)}.`,
      `Got it! This is the flag of ${the(id)}.`,
      `Exactly! ${cap(the(id))}. Remember the colors of this flag.`,
      `Yes! If you see this flag at a sports contest — it is ${the(id)}.`,
    ],
  },
  map: {
    animalAsk: (id) => `Where does the ${MAP_ANIMALS[id]} live? Drag it onto the map.`,
    animalHint: (id) => `Look for the continent that is blinking. The ${MAP_ANIMALS[id]} lives in ${REGIONS[homeOf[id]]}.`,
    animalFacts: (id) => ANIMAL_FACTS[id],
    countryAsk: (id) => `Which continent is ${the(id)} on? Drag the flag.`,
    countryHint: (id) => `Look for ${REGIONS[continentOf[id]]} — it is blinking.`,
    countryYes: (id) => [`Yes! ${cap(the(id))} is a country in ${partOf(id)}.`, `That’s right: ${the(id)} is on the continent of ${REGIONS[continentOf[id]]}.`],
  },
  zone: (id) => ZONES[id],
  animal: (id) => {
    const [name, clue, fact, ...more] = ANIMALS[id];
    return { name, clue, fact, facts: ANIMAL_FACTS[id] ?? (first.has(id) ? [fact] : [fact, ...more]) };
  },
  zones: {
    whereAsk: (id) => `Where does the ${ANIMALS[id][0]} live?`,
    whereHint: (id) => `Think where the animal would be happy. ${ANIMALS[id][2]}`,
    whoAsk: (id) => `Who lives ${ZONES[id].where}?`,
    whoHint: (id) => `Remember what natural zone this is. ${ZONES[id].signs[0]}`,
    riddleAsk: (id) => `Who is it? ${ANIMALS[id][1]}`,
    riddleHint: (id, home) => `This animal lives ${ZONES[home].where}. Its name begins with the letter “${ANIMALS[id][0][0].toUpperCase()}.”`,
    oddAsk: 'Who is the odd one out? All the others are neighbors: they live in the same natural zone.',
    oddHint: (id) => `All the neighbors live ${ZONES[id].where}. Find the one that lives somewhere else.`,
    zoneAsk: (id, i) => `Which natural zone is this? ${ZONES[id].signs[i]}`,
    zoneHint: (id, dwellers) => (dwellers.length > 0 ? `Living here: the ${dwellers.map((a) => ANIMALS[a][0]).join(', the ')}.` : ZONES[id].signs[0]),
    zoneYes: (id, i) => `Yes, it’s ${ZONES[id].where.replace(/^in /, '')}! ${ZONES[id].signs[i]}`,
  },
  ocean: (id) => OCEANS[id],
  seas: {
    sailTo: (id) => `Sail to ${REGIONS[id]}!`,
    riddleAsk: (id, i) => `Sail to ${OCEANS[id].riddles[i]}!`,
    hint: (clue) => `Look for the water that ripples with waves. ${clue}`,
    itIs: (id) => `It is ${REGIONS[id]}.`,
    sea: (id) => ({ ask: `${SEAS[id][0]} is a part of which ocean? Sail there!`, fact: SEAS[id][1] }),
    place: (id) => ({ ask: `${PLACES[id][0]} Sail there!`, fact: PLACES[id][1] }),
    river: (id) => ({ ask: `Which ocean do the waters of ${RIVERS[id][0]} flow to? Sail there!`, fact: RIVERS[id][1] }),
    shoreAsk: (id) => `Which ocean washes the shores of ${the(id)}? Sail there!`,
    shoreYes: (id, ocean) => `Yes! The shores of ${the(id)} are washed by ${REGIONS[ocean]}.`,
  },
  capitals: {
    landmark: (id) => {
      const [name, inSentence, capital, country] = LANDMARKS[id];
      return {
        name,
        capital,
        ask: `In which capital can you see ${inSentence}?`,
        hint: `${cap(inSentence)} is a symbol of ${country}. Remember the capital of that country.`,
        facts: LANDMARK_FACTS[id],
      };
    },
    capital: (id) => CAPITALS[id],
    ask: (id) => `What is the capital of ${the(id)}?`,
    hint: (id) => `The name of this capital begins with the letter “${CAPITALS[id][0]}.”`,
    stories: (id) => {
      const pair = `${CAPITALS[id]} is the capital of ${the(id)}`;
      return [
        `Yes! ${pair}.`,
        `That’s right! The capital of ${the(id)} is ${CAPITALS[id]}.`,
        `Wonderful! ${CAPITALS[id]} is the chief city of ${the(id)}.`,
        `Well done! ${pair}. It is in ${partOf(id)}.`,
        `Spot on! ${cap(the(id))} and ${CAPITALS[id]} — remember this pair.`,
        `What a memory! ${pair}.`,
        `Keep it up! Look for the city of ${CAPITALS[id]} on the map in ${partOf(id)}.`,
        `Got it! ${pair}.`,
        `Exactly! If you go to ${the(id)}, you will see its capital — ${CAPITALS[id]}.`,
        `Correct! ${pair}. Now you know.`,
      ];
    },
    countryAsk: (id) => `${CAPITALS[id]} is the capital of which country?`,
    countryHint: (id) => LOOKS[id] ?? `This country is in ${partOf(id)}. Its name begins with the letter “${bare(id)[0]}.”`,
    day: 'Day',
    night: 'Night',
    dayNight: (id) => {
      const now = kyivAt[id];
      return { ask: `It is ${now} in Kyiv now. What about ${DAY_NIGHT[id][0]}?`, caption: `Kyiv: ${now}`, why: DAY_NIGHT[id][1] };
    },
    dayNightHint: 'The Earth spins like a top. The sun shines on only one side of it: there it is day, and on the other side it is night.',
    clock: (id, hour) => {
      const t = shiftOf[id];
      const city = CITIES[id];
      const by = Math.abs(t.shift);
      const side = t.shift > 0 ? 'later' : 'earlier';
      const rule = t.shift === 0 ? `The time in ${city} is the same as in Kyiv` : `${'winter' in t ? 'In winter it' : 'It'} is ${hours(by)} ${side} in ${city} than in Kyiv`;
      return {
        ask: `It is ${hour}:00 in Kyiv. ${rule}. What time is it in ${city}?`,
        caption: `Kyiv — ${hour}:00`,
        hint:
          t.shift === 0
            ? 'This city is in the same time zone as Kyiv — the clocks show the same time.'
            : `“${cap(hours(by))} ${side}” means ${hour} ${t.shift > 0 ? 'plus' : 'minus'} ${by}.`,
        yes: `Yes! When it is ${hour}:00 in Kyiv, it is ${hour + t.shift}:00 in ${city}.`,
      };
    },
    hourSay: (hour) => `${hour}:00`,
  },
};
