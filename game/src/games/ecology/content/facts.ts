import TEXTS from '@/locales/app/uk/games/ecology.json';

const J = TEXTS.content.facts;

/**
 * What happens to sorted rubbish — the stories «Еко-патруль» tells after a
 * correct answer. Twelve per material; a task tells the next one each time
 * (see `core/game/content/outro.ts`), so the child keeps hearing new reasons why
 * sorting is worth it.
 */
export const RECYCLING_FACTS: Record<'glass' | 'paper' | 'plastic' | 'metal' | 'organic', string[]> = J.RECYCLING_FACTS;
