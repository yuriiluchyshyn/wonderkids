import { V4_RELEASE, type GameCard, type SubjectDef } from '../shared/templateModule';
import { COUNTRIES } from './content/countries';
import { FLAG_STEPS, BIOME_STEPS, OCEAN_STEPS, CAPITALS, CAPITAL_STEPS } from './tasks';
import { BIOME_ANIMALS } from './content/data';

/** The subject as the hub shows it. */
export const SUBJECT: SubjectDef = {
  id: 'geography',
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
    landmark: { name: 'Алея прапорів', emoji: '🚩', stages: [['🇺🇦', 'Україна'], ['🗼', 'Франція'], ['🗻', 'Японія'], ['🗽', 'Америка']] },
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
    mechanics: 'UI_GRID_CHOICE',
  },
  {
    id: 'continents',
    landmark: { name: 'Материки', emoji: '🗺️', stages: [['🦘', 'Австралія'], ['🦁', 'Африка'], ['🐼', 'Азія'], ['🌍', 'Увесь світ']] },
    gameId: 'geo_continent_puzzle',
    label: 'Склади Карту',
    icon: '🗺️',
    blurb: 'Розстав тварин і прапори на материках',
    intro: 'На Землі сім материків. Перетягни тваринку чи прапор на той материк, де вони живуть.',
    steps: 12,
    difficulty: 2,
    publishDate: V4_RELEASE,
    tasksPerLevel: 10,
    mechanics: 'UI_MAP_PUZZLE',
  },
  {
    id: 'biomes',
    landmark: { name: 'Заповідник', emoji: '🏞️', stages: [['❄️', 'Арктика'], ['🌴', 'Джунглі'], ['🌾', 'Савана'], ['🏔️', 'Гори']] },
    gameId: 'geo_biomes_sorter',
    label: 'Тварини і Природні Зони',
    icon: '🐧',
    blurb: `${BIOME_ANIMALS.length} тварин і сім природних зон — від Арктики до савани`,
    intro: 'Кожна тваринка любить свій дім. Комусь добре серед криги, а комусь — у спекотній пустелі. Допоможи їм дістатися додому! Далі на шляху з’являться нові зони: савана, ліс і гори.',
    steps: BIOME_STEPS,
    difficulty: [1, 2],
    publishDate: V4_RELEASE,
    tasksPerLevel: 10,
    mechanics: ['UI_SORTER_BINS', 'UI_GRID_CHOICE'],
    hasText: true,
  },
  {
    id: 'oceans',
    landmark: { name: 'Морський порт', emoji: '⚓', stages: [['⛵', 'Причал'], ['🏝️', 'Острів'], ['🚢', 'Порт'], ['🐬', 'Океанаріум']] },
    gameId: 'geo_oceans',
    label: 'Моря та Океани',
    icon: '⛵',
    blurb: 'П’ять океанів, сімнадцять морів і дванадцять дивовижних місць',
    intro: 'На нашій планеті п’ять океанів. Послухай, куди пливти, і торкнись потрібного океану на карті! Далі на шляху — загадки про океани, моря та найцікавіші місця.',
    steps: OCEAN_STEPS,
    difficulty: 2,
    publishDate: V4_RELEASE,
    tasksPerLevel: 10,
    mechanics: 'UI_MAP_PUZZLE',
  },
  {
    id: 'capitals',
    landmark: { name: 'Столиці світу', emoji: '🌐', stages: [['⛪', 'Київ'], ['🕰️', 'Лондон'], ['🗼', 'Париж'], ['🏯', 'Пекін']] },
    gameId: 'geo_timezones_capitals',
    label: 'Столиці та Часові Пояси',
    icon: '🌐',
    blurb: `${CAPITALS.length} столиць світу, день і ніч та різниця в часі`,
    intro: 'Упізнай столицю за її найвідомішою спорудою і за назвою країни. А ще дізнаємось, чому в одних містах день, коли в інших ніч, і котра там година!',
    steps: CAPITAL_STEPS,
    difficulty: 3,
    publishDate: V4_RELEASE,
    tasksPerLevel: 10,
    mechanics: 'UI_GRID_CHOICE',
    hasText: true,
  },
];
