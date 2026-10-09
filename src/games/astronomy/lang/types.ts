import type { ModuleTexts } from '@/core/game/kernel/types';

/**
 * Everything the Astronomy galaxy says, in one language. Planets and clues are
 * named by their id, constellations by their place in `FIGURES`, quiz
 * questions by their id (`content/`).
 */
export interface AstronomyTexts {
  cards?: ModuleTexts;
  /** What is new on a step. `sky` — how many steps of labelled skies there are before the starry ones. */
  introFor: { planets(step: number, quizFrom: number): string | undefined; constellations(step: number, sky: number): string | undefined };
  planet(id: string): string;
  sun: string;
  lineUp: {
    sun: { ask: string; ends: [string, string]; hint(first: string, all: string): string; fact(names: string): string };
    size: { ask: string; ends: [string, string]; hint(smallest: string, biggest: string): string; fact(names: string): string };
  };
  /** A clue about a planet: «Червона планета». */
  feature(id: string): string;
  features: { ask: string; hint(feature: string, planet: string): string; fact(feature: string, planet: string): string };
  quiz(id: string): { question: string; fact: string };
  /** `place` — the planet's place from the Sun, 0 for the nearest. */
  quizHint(planet: string, place: number): string;
  /** The letters the stars of a sky are labelled with. */
  alphabet: readonly string[];
  /** A constellation: the name on its card, and what is told about it. */
  figure(at: number): { name: string; fact: string };
  sky: {
    abc(first: string, last: string): string;
    order(first: string, last: string): string;
    skip(by: number, firstThree: string, last: string): string;
    hintAbc(first: string, firstFour: string): string;
    hint(first: string, nextThree: string): string;
    is(at: number): string;
  };
  find: { ask(at: number): string; hint(at: number, stars: number): string };
}
