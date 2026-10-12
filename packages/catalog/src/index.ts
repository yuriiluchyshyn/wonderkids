import { readFileSync } from 'node:fs';

/**
 * The catalogue of games — what the public site knows about them.
 *
 * The site and the game never import one another, so the game WRITES this
 * down: `game/scripts/catalog.mjs` loads every registered module and makes
 * `src/<lang>.json`, one file per language, listing only the games written in
 * that language. The files are committed, and the game's `tests/catalog.test.ts`
 * fails when they are stale — the site's pages of games (`site/build/games.ts`)
 * cannot drift from the game. Never edit the JSON by hand: change the game and
 * run `npm run catalog` in `game/`.
 *
 * Read on Node only (the site's build and tests): a page gets its games as HTML.
 */
export const CATALOG_LANGS = ['uk', 'en', 'pl'] as const;
export type CatalogLang = (typeof CATALOG_LANGS)[number];

/** A real task of a game, as a page can show it. */
export interface CatalogSample {
  /** The step of the game's path it was drawn at. */
  step: number;
  prompt: string;
  /** The answers of the board, where they are short words or pictograms. */
  answers?: string[];
  /** The right one among them — also given alone, when the answers are whole sentences. */
  right?: string;
  /** On a board that is not a choice of answers: the things laid out on it — words to pair, cards to put in order. */
  board?: string[];
}

export interface CatalogGame {
  /** As the game names it, and as the trial game is asked for it: `geography:flags`. */
  id: string;
  sub: string;
  icon: string;
  title: string;
  blurb: string;
  /** What the game tells a child before play — empty when it tells nothing. */
  intro: string;
  /** The set the game belongs to in its galaxy: a language of the Language galaxy. */
  set?: string;
  /** 1–3 stars, from and to: 1 — ages 4–6, 2 — 6–8, 3 — 8–10. */
  stars: [number, number];
  /** `path` — a ladder of steps, each harder; `free` — every task from the start. */
  kind: 'path' | 'free';
  steps: number;
  tasksPerLevel: number;
  mechanics: string[];
  /** How many different tasks a free-play game has. */
  tasks?: number;
  /** Two tasks from the first, the middle and the last step — four of a game that has no steps. */
  samples: CatalogSample[];
}

export interface CatalogGalaxy {
  id: string;
  icon: string;
  title: string;
  games: CatalogGame[];
}

export function loadCatalog(lang: CatalogLang): CatalogGalaxy[] {
  return JSON.parse(readFileSync(new URL(`./${lang}.json`, import.meta.url), 'utf8')) as CatalogGalaxy[];
}

/** The years a game is for, read off its stars. */
export function agesOf(game: Pick<CatalogGame, 'stars'>): [number, number] {
  return [2 + 2 * game.stars[0], 4 + 2 * game.stars[1]];
}

/** A game's piece of an address: `word_problems` → `word-problems`. */
export const gameSlug = (sub: string): string => sub.replaceAll('_', '-');
