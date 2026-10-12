import type { TaskInstance } from '@/core/game/kernel/types';
import type { Card } from '@/core/game/templates/types';

/**
 * Picture cues — fading the association pictures off the answers.
 *
 * Some answers carry a picture that is not the answer itself but a crutch
 * for it: Copernicus' portrait under «Миколай Коперник», a flag under
 * «Японія». At first the picture helps the child learn the name. Once the
 * child has answered the same question right a couple of times, the
 * picture becomes the thing they recognise instead of the name. So:
 *
 *   1. The game marks such cards with `cue: true` (see `asCue`).
 *   2. Every clean answer (no mistake) to the task adds one to its count, kept per
 *      child in `progress` under `cueKey(...)`, synced with the save like `#plays`.
 *   3. From `CUE_FADE_AFTER` clean answers on, the task is asked with the
 *      cue pictures hidden. The child hears the prompt and reads or listens
 *      to the names.
 *   4. A mistake brings the pictures back as the first hint. It also puts the
 *      count back below the threshold: the next time the task comes up, the
 *      pictures are shown again until the child earns another clean answer.
 *
 * To plug a game in, mark its cue cards with `asCue`. The session
 * (`useGameSession`) and the card face (`CardFace`) do the rest.
 */

/** Clean answers to a task after which its cue pictures are hidden. */
export const CUE_FADE_AFTER = 2;
/** The count stops here: a few more are not "more known". */
const CUE_COUNT_CAP = 9;

/** Marks a card's picture (image / emoji) as an association cue that fades. */
export function asCue(card: Card): Card {
  return { ...card, cue: true };
}

/** Where a task's clean-answer count lives in the child's `progress` map. */
export function cueKey(moduleId: string, subCategoryId: string, taskKey: string): string {
  return `${moduleId}:${subCategoryId}#cue:${taskKey}`;
}

/** The cards of a payload that can carry a cue (the answers and draggables). */
function cardsOf(payload: unknown): Card[] {
  if (!payload || typeof payload !== 'object') return [];
  const p = payload as Record<string, unknown>;
  const lists = [p.options, p.items, p.slots, p.cards, p.bins];
  return lists.flatMap((list) => (Array.isArray(list) ? (list as Card[]) : [])).concat(p.item ? [p.item as Card] : []);
}

/** Does the task have any cue pictures at all? Only those tasks are counted. */
export function hasCues(task: Pick<TaskInstance, 'payload'>): boolean {
  return cardsOf(task.payload).some((c) => c.cue && (c.image || c.emoji));
}

/** Are the cue pictures hidden right now? */
export function cuesHidden(state: { known: number; mistakes: number; solved: boolean }): boolean {
  // Solved: the picture comes back as the reward ("yes, that's him").
  return state.known >= CUE_FADE_AFTER && state.mistakes === 0 && !state.solved;
}

/**
 * The task's count after one showing: +1 for a clean answer. A mistake made
 * while the pictures were hidden drops it below the threshold, so the
 * pictures come back next time. `null`: nothing to write.
 */
export function nextKnown(known: number, answer: { clean: boolean; wasHidden: boolean }): number | null {
  if (answer.clean) return Math.min(CUE_COUNT_CAP, known + 1);
  if (answer.wasHidden) return Math.max(1, CUE_FADE_AFTER - 1);
  return null;
}
