import { own } from '@/core/language/marks';
import type { Topic } from './questions';
import { fill } from '@/core/language/fill';
import TEXTS from '@/locales/app/uk/games/ecology.json';

const J = TEXTS.content.questionsMore;

/**
 * More questions of «Чому так?», easiest first inside a topic — they follow
 * the seven hand-made ones of `questions.ts` along the path. One per line:
 *
 *   emoji | question | right answer | why (told after the answer, and the hint)
 *
 * A question brings no wrong answers of its own: the board is filled with the
 * right answers of other topics' questions of the same kind (why / what / how).
 * To make the game longer, add lines here — nothing else needs touching.
 */
export const MORE_QUESTIONS: Record<Topic, string> = {
  waste: J.MORE_QUESTIONS.waste,
  air: J.MORE_QUESTIONS.air,
  water: fill(J.MORE_QUESTIONS.water[1], { own: own(J.MORE_QUESTIONS.water[2]), own2: own(J.MORE_QUESTIONS.water[3]) }),
  climate: J.MORE_QUESTIONS.climate,
  wildlife: fill(J.MORE_QUESTIONS.wildlife[1], { own: own(J.MORE_QUESTIONS.wildlife[2]) }),
  energy: J.MORE_QUESTIONS.energy,
};
