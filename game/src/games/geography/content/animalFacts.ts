/**
 * Facts about every animal of the Geography games, keyed by animal id (ten
 * for the first animals, six for those added with the savanna, forest and
 * mountains).
 * These are what a child hears after placing the animal — so every one of
 * them is about THAT animal, never about its continent or biome in general.
 * What is said about Ukraine is marked `own`: the other languages tell their own there.
 */
import { own } from '@/core/language/marks';
import TEXTS from '@/locales/app/uk/games/geography.json';

const J = TEXTS.content.animalFacts;

export const ANIMAL_FACTS: Record<string, string[]> = {
  giraffe: J.ANIMAL_FACTS.giraffe,
  lion: J.ANIMAL_FACTS.lion,
  kangaroo: J.ANIMAL_FACTS.kangaroo,
  penguin: J.ANIMAL_FACTS.penguin,
  panda: J.ANIMAL_FACTS.panda,
  llama: J.ANIMAL_FACTS.llama,
  bison: [
    J.ANIMAL_FACTS.bison[0],
    J.ANIMAL_FACTS.bison[1],
    J.ANIMAL_FACTS.bison[2],
    J.ANIMAL_FACTS.bison[3],
    J.ANIMAL_FACTS.bison[4],
    J.ANIMAL_FACTS.bison[5],
    J.ANIMAL_FACTS.bison[6],
    J.ANIMAL_FACTS.bison[7],
    J.ANIMAL_FACTS.bison[8][1] + own(J.ANIMAL_FACTS.bison[8][2]) + '.',
    J.ANIMAL_FACTS.bison[9],
  ],
  hedgehog: [
    J.ANIMAL_FACTS.hedgehog[0][1] + own(J.ANIMAL_FACTS.hedgehog[0][2]) + '.',
    J.ANIMAL_FACTS.hedgehog[1],
    J.ANIMAL_FACTS.hedgehog[2],
    J.ANIMAL_FACTS.hedgehog[3],
    J.ANIMAL_FACTS.hedgehog[4],
    J.ANIMAL_FACTS.hedgehog[5],
    J.ANIMAL_FACTS.hedgehog[6],
    J.ANIMAL_FACTS.hedgehog[7],
    J.ANIMAL_FACTS.hedgehog[8],
    J.ANIMAL_FACTS.hedgehog[9],
  ],
  koala: J.ANIMAL_FACTS.koala,
  tiger: J.ANIMAL_FACTS.tiger,
  polar_bear: J.ANIMAL_FACTS.polar_bear,
  camel: J.ANIMAL_FACTS.camel,
  monkey: J.ANIMAL_FACTS.monkey,
  dolphin: J.ANIMAL_FACTS.dolphin,
  seal: J.ANIMAL_FACTS.seal,
  parrot: J.ANIMAL_FACTS.parrot,
  scorpion: J.ANIMAL_FACTS.scorpion,
  octopus: J.ANIMAL_FACTS.octopus,
  arctic_hare: J.ANIMAL_FACTS.arctic_hare,
  lizard: J.ANIMAL_FACTS.lizard,
  whale: J.ANIMAL_FACTS.whale,
  shark: J.ANIMAL_FACTS.shark,
  gorilla: J.ANIMAL_FACTS.gorilla,
  snake: J.ANIMAL_FACTS.snake,
  arctic_fox: J.ANIMAL_FACTS.arctic_fox,
  zebra: J.ANIMAL_FACTS.zebra,
  elephant: J.ANIMAL_FACTS.elephant,
  rhino: J.ANIMAL_FACTS.rhino,
  brown_bear: [
    J.ANIMAL_FACTS.brown_bear[0],
    J.ANIMAL_FACTS.brown_bear[1],
    J.ANIMAL_FACTS.brown_bear[2],
    J.ANIMAL_FACTS.brown_bear[3],
    J.ANIMAL_FACTS.brown_bear[4],
    own(J.ANIMAL_FACTS.brown_bear[5]),
  ],
  wolf: J.ANIMAL_FACTS.wolf,
  squirrel: J.ANIMAL_FACTS.squirrel,
  owl: J.ANIMAL_FACTS.owl,
  deer: J.ANIMAL_FACTS.deer,
  boar: J.ANIMAL_FACTS.boar,
  sea_turtle: J.ANIMAL_FACTS.sea_turtle,
  orangutan: J.ANIMAL_FACTS.orangutan,
  crab: J.ANIMAL_FACTS.crab,
  sloth: J.ANIMAL_FACTS.sloth,
  jellyfish: J.ANIMAL_FACTS.jellyfish,
  clownfish: J.ANIMAL_FACTS.clownfish,
  squid: J.ANIMAL_FACTS.squid,
  mountain_goat: J.ANIMAL_FACTS.mountain_goat,
  eagle: J.ANIMAL_FACTS.eagle,
  mountain_ram: J.ANIMAL_FACTS.mountain_ram,
};
