import { Mechanics } from '@/core/game/kernel/mechanics';
import type { TaskConfig, TaskInstance } from '@/core/game/kernel/types';
import type { TemplatePayload } from '@/core/game/templates/types';
import { templateTask, type GameTasks } from '../shared/templateModule';
import { STEPS, MIXES, PAINTS } from './content/data';
import { artTexts } from './lang';

type Tasks = TaskInstance<TemplatePayload>[];

/** «Змішувач Кольорів»: every step brings new things to paint. */
function mixer(step: number, config: Pick<TaskConfig, 'lang'>): Tasks {
  const T = artTexts(config.lang);
  // A thing's words are found by its place among all the things, in order.
  let at = -1;
  return STEPS.slice(0, step).flatMap(({ tubes, things }) =>
    things.map(([emoji, , , mixId]) => {
      at += 1;
      const mix = MIXES[mixId];
      const [a, b] = mix.recipe;
      return templateTask(
        `mix:${mixId}:${emoji}`,
        T.prompt(at, mixId),
        {
          template: Mechanics.ColorMix,
          object: { id: 'object', emoji, label: T.thing(at) },
          result: { id: mixId, name: T.mixes[mixId], color: mix.color },
          paints: tubes.map((id) => ({ id, name: T.paints[id], color: PAINTS[id].color })),
          recipe: [a, b],
          hint: T.hint(mixId, a, b),
        },
        step,
        T.outro(mixId, a, b),
      );
    }),
  );
}

/** Task generators of every game, by game id (the cards are in `config.ts`). */
export const TASKS: Record<string, GameTasks> = {
  mixer: { pool: mixer },
};
