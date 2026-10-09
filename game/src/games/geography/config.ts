import { Mechanics } from '@/core/game/kernel/mechanics';
import { V4_RELEASE, type GameCard, type SubjectDef } from '../shared/templateModule';
import { COUNTRIES } from './content/countries';
import { FLAG_STEPS, BIOME_STEPS, OCEAN_STEPS, CAPITALS, CAPITAL_STEPS, ZONE_ANIMALS } from './tasks';
import { geographyTexts } from './lang';

/** The subject as the hub shows it. */
export const SUBJECT: SubjectDef = {
  id: 'geography',
  texts: { en: geographyTexts('en').cards, pl: geographyTexts('pl').cards },
  title: 'Географія',
  icon: '🌍',
  accent: '#0ea5e9',
};

/**
 * The games of this subject — their catalog cards, in the order the hub lists
 * them. How each game makes its tasks lives in `tasks.ts` under the same id.
 */
export const GAMES: GameCard[] = [
  {
    id: 'flags',
    langs: geographyTexts.langs,
    gameId: 'geo_flags_quiz',
    label: 'Вгадай Прапор',
    icon: '🚩',
    blurb: `Усі ${COUNTRIES.length} прапори світу — від найвідоміших`,
    intro: 'У кожної країни є свій прапор. Послухай назву країни і знайди її прапор серед шести! На кожній сходинці — п’ять нових прапорів, а знайомі повертаються, щоб ти їх не забув.',
    // One step per five flags: the whole world, best-known first.
    steps: FLAG_STEPS,
    difficulty: 1,
    publishDate: V4_RELEASE,
    tasksPerLevel: 10,
    mechanics: Mechanics.GridChoice,
  },
  {
    id: 'continents',
    langs: geographyTexts.langs,
    gameId: 'geo_continent_puzzle',
    label: 'Склади Карту',
    icon: '🗺️',
    blurb: 'Розстав тварин і прапори на материках',
    intro: 'На Землі сім материків. Перетягни тваринку чи прапор на той материк, де вони живуть.',
    steps: 12,
    difficulty: 2,
    publishDate: V4_RELEASE,
    tasksPerLevel: 10,
    mechanics: Mechanics.MapPuzzle,
  },
  {
    id: 'biomes',
    langs: geographyTexts.langs,
    gameId: 'geo_biomes_sorter',
    label: 'Тварини і Природні Зони',
    icon: '🐧',
    blurb: `${ZONE_ANIMALS.length} тварини і сім природних зон — від Арктики до савани`,
    intro: 'Кожна тваринка любить свій дім. Комусь добре серед криги, а комусь — у спекотній пустелі. Допоможи їм дістатися додому! Далі на шляху — нові тварини, загадки «Хто це?» і завдання «Хто тут зайвий?».',
    steps: BIOME_STEPS,
    difficulty: [1, 2],
    publishDate: V4_RELEASE,
    tasksPerLevel: 10,
    mechanics: [Mechanics.SorterBins, Mechanics.GridChoice],
    hasText: true,
  },
  {
    id: 'oceans',
    langs: geographyTexts.langs,
    gameId: 'geo_oceans',
    label: 'Моря та Океани',
    icon: '⛵',
    blurb: 'П’ять океанів, півсотні морів і заток, острови, країни та річки',
    intro: 'На нашій планеті п’ять океанів. Послухай, куди пливти, і торкнись потрібного океану на карті! Далі на шляху — загадки про океани, моря й затоки, острови, країни та річки.',
    steps: OCEAN_STEPS,
    difficulty: 2,
    publishDate: V4_RELEASE,
    tasksPerLevel: 10,
    mechanics: Mechanics.MapPuzzle,
  },
  {
    id: 'capitals',
    langs: geographyTexts.langs,
    gameId: 'geo_timezones_capitals',
    label: 'Столиці та Часові Пояси',
    icon: '🌐',
    blurb: `${CAPITALS.length} столиць світу, день і ніч та різниця в часі`,
    intro: 'Упізнай столицю за її найвідомішою спорудою і за назвою країни. А ще дізнаємось, чому в одних містах день, коли в інших ніч, і котра там година!',
    steps: CAPITAL_STEPS,
    difficulty: 3,
    publishDate: V4_RELEASE,
    tasksPerLevel: 10,
    mechanics: Mechanics.GridChoice,
    hasText: true,
  },
];
