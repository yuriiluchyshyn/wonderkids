import type { Achiever, Invention } from './data';
import TEXTS from '@/locales/app/uk/games/history.json';

const J = TEXTS.content.poland;

/**
 * The history of Poland: the people and the inventions of the two games that
 * come with the Polish language. The words here are the Ukrainian ones, like
 * the rest of `content/`; Polish and English are in `grammar/`.
 *
 * `picture` borrows a portrait that is already drawn; without it a person is
 * shown by the emoji alone — there are no portraits of these people yet.
 */
export const PL_FIGURES: Achiever[] = [
  { id: 'mieszko', name: J.PL_FIGURES.mieszko.name, face: '🤴', symbol: '🦅', symbolName: J.PL_FIGURES.mieszko.symbolName, fact: J.PL_FIGURES.mieszko.fact },
  { id: 'kopernik', picture: 'copernicus', name: J.PL_FIGURES.kopernik.name, face: '👨‍🏫', symbol: '☀️', symbolName: J.PL_FIGURES.kopernik.symbolName, fact: J.PL_FIGURES.kopernik.fact },
  { id: 'chopin', name: J.PL_FIGURES.chopin.name, face: '🧑‍🎼', symbol: '🎹', symbolName: J.PL_FIGURES.chopin.symbolName, fact: J.PL_FIGURES.chopin.fact },
  { id: 'sklodowska', picture: 'curie', who: 'she', name: J.PL_FIGURES.sklodowska.name, face: '👩‍🔬', symbol: '🧪', symbolName: J.PL_FIGURES.sklodowska.symbolName, fact: J.PL_FIGURES.sklodowska.fact },
  { id: 'chrobry', name: J.PL_FIGURES.chrobry.name, face: '👑', symbol: '⚔️', symbolName: J.PL_FIGURES.chrobry.symbolName, fact: J.PL_FIGURES.chrobry.fact },
  { id: 'kazimierz', name: J.PL_FIGURES.kazimierz.name, face: '🤴', symbol: '🏰', symbolName: J.PL_FIGURES.kazimierz.symbolName, fact: J.PL_FIGURES.kazimierz.fact },
  { id: 'jadwiga', who: 'she', name: J.PL_FIGURES.jadwiga.name, face: '👸', symbol: '🎓', symbolName: J.PL_FIGURES.jadwiga.symbolName, fact: J.PL_FIGURES.jadwiga.fact },
  { id: 'jagiello', name: J.PL_FIGURES.jagiello.name, face: '🧔‍♂️', symbol: '🛡️', symbolName: J.PL_FIGURES.jagiello.symbolName, fact: J.PL_FIGURES.jagiello.fact },
  { id: 'sobieski', name: J.PL_FIGURES.sobieski.name, face: '🤴', symbol: '🐎', symbolName: J.PL_FIGURES.sobieski.symbolName, fact: J.PL_FIGURES.sobieski.fact },
  { id: 'kosciuszko', name: J.PL_FIGURES.kosciuszko.name, face: '🧑‍✈️', symbol: '🌾', symbolName: J.PL_FIGURES.kosciuszko.symbolName, fact: J.PL_FIGURES.kosciuszko.fact },
  { id: 'mickiewicz', name: J.PL_FIGURES.mickiewicz.name, face: '🧑‍🦱', symbol: '📖', symbolName: J.PL_FIGURES.mickiewicz.symbolName, fact: J.PL_FIGURES.mickiewicz.fact },
  { id: 'matejko', name: J.PL_FIGURES.matejko.name, face: '👨‍🎨', symbol: '🖼️', symbolName: J.PL_FIGURES.matejko.symbolName, fact: J.PL_FIGURES.matejko.fact },
  { id: 'korczak', name: J.PL_FIGURES.korczak.name, face: '👨‍⚕️', symbol: '🧒', symbolName: J.PL_FIGURES.korczak.symbolName, fact: J.PL_FIGURES.korczak.fact },
  { id: 'hermaszewski', name: J.PL_FIGURES.hermaszewski.name, face: '🧑‍🚀', symbol: '🚀', symbolName: J.PL_FIGURES.hermaszewski.symbolName, fact: J.PL_FIGURES.hermaszewski.fact },
  { id: 'szymborska', who: 'she', name: J.PL_FIGURES.szymborska.name, face: '👩‍🦳', symbol: '✍️', symbolName: J.PL_FIGURES.szymborska.symbolName, fact: J.PL_FIGURES.szymborska.fact },
  { id: 'lem', name: J.PL_FIGURES.lem.name, face: '👨‍💼', symbol: '🤖', symbolName: J.PL_FIGURES.lem.symbolName, fact: J.PL_FIGURES.lem.fact },
];

export const PL_WHO_ASK: Record<string, string> = J.PL_WHO_ASK;

export const PL_INVENTIONS: Invention[] = [
  { id: 'pl_lamp', name: J.PL_INVENTIONS.pl_lamp.name, emoji: '🪔', by: J.PL_INVENTIONS.pl_lamp.by, face: 'lukasiewicz', fact: J.PL_INVENTIONS.pl_lamp.fact },
  { id: 'pl_vitamins', name: J.PL_INVENTIONS.pl_vitamins.name, ask: J.PL_INVENTIONS.pl_vitamins.ask, emoji: '🍊', by: J.PL_INVENTIONS.pl_vitamins.by, fact: J.PL_INVENTIONS.pl_vitamins.fact },
  { id: 'pl_radio', name: J.PL_INVENTIONS.pl_radio.name, emoji: '📻', by: J.PL_INVENTIONS.pl_radio.by, fact: J.PL_INVENTIONS.pl_radio.fact },
  { id: 'pl_detector', name: J.PL_INVENTIONS.pl_detector.name, emoji: '🧲', by: J.PL_INVENTIONS.pl_detector.by, fact: J.PL_INVENTIONS.pl_detector.fact },
  { id: 'pl_crystal', name: J.PL_INVENTIONS.pl_crystal.name, ask: J.PL_INVENTIONS.pl_crystal.ask, emoji: '💎', by: J.PL_INVENTIONS.pl_crystal.by, fact: J.PL_INVENTIONS.pl_crystal.fact },
  { id: 'pl_rover', name: J.PL_INVENTIONS.pl_rover.name, emoji: '🌙', by: J.PL_INVENTIONS.pl_rover.by, fact: J.PL_INVENTIONS.pl_rover.fact },
  { id: 'pl_vaccine', name: J.PL_INVENTIONS.pl_vaccine.name, emoji: '💉', by: J.PL_INVENTIONS.pl_vaccine.by, fact: J.PL_INVENTIONS.pl_vaccine.fact },
  { id: 'pl_esperanto', name: J.PL_INVENTIONS.pl_esperanto.name, ask: J.PL_INVENTIONS.pl_esperanto.ask, emoji: '💬', by: J.PL_INVENTIONS.pl_esperanto.by, fact: J.PL_INVENTIONS.pl_esperanto.fact },
  { id: 'pl_enigma', name: J.PL_INVENTIONS.pl_enigma.name, ask: J.PL_INVENTIONS.pl_enigma.ask, emoji: '🔐', by: J.PL_INVENTIONS.pl_enigma.by, fact: J.PL_INVENTIONS.pl_enigma.fact },
  { id: 'pl_vest', name: J.PL_INVENTIONS.pl_vest.name, emoji: '🦺', by: J.PL_INVENTIONS.pl_vest.by, fact: J.PL_INVENTIONS.pl_vest.fact },
];
