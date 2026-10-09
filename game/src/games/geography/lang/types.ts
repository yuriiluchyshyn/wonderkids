import type { ModuleTexts } from '@/core/game/kernel/types';
import type { BiomeId } from '../content/data';

/**
 * Everything the Geography galaxy says, in one language. Countries, animals,
 * zones, oceans, seas and cities are named by their id (`content/`); which of
 * them a task is about is decided by the generator, never by the words.
 */
export interface GeographyTexts {
  cards?: ModuleTexts;
  /** A country's name, as it stands on a card. */
  country(id: string): string;
  /** A continent or an ocean, as it is named on the map. */
  region(id: string): string;
  flags: {
    ask(country: string): string;
    hint(country: string): string;
    stories(country: string): (string | undefined)[];
  };
  map: {
    animalAsk(animal: string): string;
    animalHint(animal: string): string;
    animalFacts(animal: string): string[];
    countryAsk(country: string): string;
    countryHint(country: string): string;
    countryYes(country: string): string[];
  };
  /** A natural zone: its name, what it answers to a stranger, how to know it, and what is told about it. */
  zone(id: BiomeId): { name: string; no: string; signs: string[]; facts: string[] };
  /** An animal of a zone: its name, a riddle about it, a word on where it lives, and its stories. */
  animal(id: string): { name: string; clue: string; fact: string; facts: string[] };
  zones: {
    whereAsk(animal: string): string;
    whereHint(animal: string): string;
    whoAsk(zone: BiomeId): string;
    whoHint(zone: BiomeId): string;
    riddleAsk(animal: string): string;
    riddleHint(animal: string, zone: BiomeId): string;
    oddAsk: string;
    oddHint(zone: BiomeId): string;
    zoneAsk(zone: BiomeId, sign: number): string;
    zoneHint(zone: BiomeId, dwellers: string[]): string;
    zoneYes(zone: BiomeId, sign: number): string;
  };
  /** An ocean: what is told about it, and the riddles that lead to it with their answers. */
  ocean(id: string): { fact: string; pool: string[]; riddles: string[]; riddleFacts: string[] };
  seas: {
    sailTo(ocean: string): string;
    riddleAsk(ocean: string, riddle: number): string;
    hint(clue: string): string;
    itIs(ocean: string): string;
    sea(id: string): { ask: string; fact: string };
    place(id: string): { ask: string; fact: string };
    river(id: string): { ask: string; fact: string };
    shoreAsk(country: string): string;
    shoreYes(country: string, ocean: string): string;
  };
  capitals: {
    landmark(id: string): { name: string; capital: string; ask: string; hint: string; facts: string[] };
    capital(country: string): string;
    ask(country: string): string;
    hint(country: string): string;
    stories(country: string): string[];
    countryAsk(country: string): string;
    countryHint(country: string): string;
    day: string;
    night: string;
    dayNight(id: string): { ask: string; caption: string; why: string };
    dayNightHint: string;
    /** The clock in a city when it is `hour` in Kyiv. */
    clock(id: string, hour: number): { ask: string; caption: string; hint: string; yes: string };
    hourSay(hour: number): string;
  };
}
