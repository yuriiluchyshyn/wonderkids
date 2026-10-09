import { Mechanics } from '@/core/game/kernel/mechanics';
import type { GameCard, SubjectDef } from '../shared/templateModule';
import { RELEASE } from './tasks';
import { natureTexts } from './lang';

/** The subject as the hub shows it. */
export const SUBJECT: SubjectDef = {
  texts: { en: natureTexts('en').cards, pl: natureTexts('pl').cards },
  id: 'nature',
  title: 'Природа',
  icon: '🌿',
  accent: '#16a34a',
};

/**
 * The games of this subject — their catalog cards, in the order the hub lists
 * them. How each game makes its tasks lives in `tasks.ts` under the same id.
 */
export const GAMES: GameCard[] = [
  {
    id: 'seasons',
    gameId: 'nature_seasons_months',
    label: 'Пори року і місяці',
    icon: '🍂',
    blurb: 'Що коли буває в природі й дванадцять місяців по порядку',
    intro:
      'У році чотири пори: зима, весна, літо й осінь, а в кожній — по три місяці. Подивись на картинку і покажи, коли це буває!',
    introFor: (step, lang) => natureTexts(lang).introFor(step),
    langs: natureTexts.langs,
    steps: 8,
    difficulty: 1,
    publishDate: RELEASE,
    tasksPerLevel: 10,
    mechanics: [Mechanics.SorterBins, Mechanics.GridChoice, Mechanics.ChronoSequence],
    hasText: true,
  },
];
