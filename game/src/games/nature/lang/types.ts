import type { ModuleTexts } from '@/core/game/kernel/types';
import type { SeasonId } from '../content/data';

/**
 * Everything the Nature galaxy says, in one language. Months are named by
 * their place in the year (0 — January), signs of a season by their place in
 * `SIGNS` (`content/data.ts`).
 *
 * The facts are not translations of one another where the thing itself differs
 * by language: «Січень» comes from «сікти», «Styczeń» from «stykać», «January»
 * from Janus — each language tells the story of its own word.
 */
export interface NatureTexts {
  cards?: ModuleTexts;
  introFor(step: number): string | undefined;
  season(id: SeasonId): { name: string; no: string; facts: readonly string[] };
  month(at: number): { name: string; fact: string };
  /** A sign of a season: the question, the card's label and the fact. */
  sign(at: number): { ask: string; label: string; fact: string };
  monthSeason: { ask(month: number): string; hint(month: number, season: SeasonId): string };
  after: { ask(month: number): string; hint(month: number): string; fact(month: number): string };
  before: { ask(month: number): string; hint(month: number): string; fact(month: number): string };
  orderMonths: { ask(season: SeasonId): string; hint(season: SeasonId, first: number): string; fact(season: SeasonId, months: number[]): string };
  ends: [first: string, last: string];
  nth: { ask(month: number): string; hint: string; fact(month: number): string };
  orderSeasons: { ask(first: SeasonId): string; circle: string };
}
