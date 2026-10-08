import { STATION_COUNT, stationId } from './world';

/** The key of knowledge as it is drawn, and its count forms («5 ключів»). */
export const KEY = '🗝️';
export const KEY_COUNTED: [string, string, string] = ['ключ', 'ключі', 'ключів'];

export interface StationDef {
  id: string;
  name: string;
  emoji: string;
  /** What the station is for — read out when the child taps it. */
  about: string;
}

/**
 * The stations of knowledge: the same six on every planet, cheapest first
 * (`STATION_COSTS`). They are deliberately NOT derived from the game catalog —
 * a new game or a whole new galaxy adds ways to earn keys, never a station.
 */
const STATIONS: [emoji: string, name: string, about: string][] = [
  ['🔭', 'Обсерваторія', 'Звідси видно зорі, комети й далекі планети.'],
  ['📚', 'Бібліотека', 'Тут живуть літери, слова й цікаві історії.'],
  ['🧮', 'Лабораторія чисел', 'Тут рахують, міряють і розв’язують головоломки.'],
  ['🧭', 'Зала мандрівників', 'Тут зберігають карти, прапори й розповіді про далекі країни.'],
  ['🌿', 'Оранжерея', 'Тут ростуть рослини з усіх куточків світу і вчаться берегти природу.'],
  ['🏺', 'Музей часу', 'Тут зібрано все про давні часи, винаходи та мистецтво.'],
];

export const STATION_DEFS: StationDef[] = STATIONS.slice(0, STATION_COUNT).map(([emoji, name, about], i) => ({ id: stationId(i), name, emoji, about }));
