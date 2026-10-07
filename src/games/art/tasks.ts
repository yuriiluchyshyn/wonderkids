import type { TaskInstance } from '@/core/game/kernel/types';
import type { TemplatePayload } from '@/core/game/templates/types';
import { factPool } from '../shared/facts';
import { templateTask, type GameTasks } from '../shared/templateModule';
import { STEPS, MIXES, PAINTS, COLOR_FACTS } from './content/data';

type Tasks = TaskInstance<TemplatePayload>[];

/** «Змішувач Кольорів»: every step brings new things to paint. */
function mixer(step: number): Tasks {
  return STEPS.slice(0, step).flatMap(({ tubes, things }) =>
    things.map(([emoji, name, need, mixId]) => {
      const mix = MIXES[mixId];
      const [a, b] = mix.recipe.map((id) => PAINTS[id]);
      return templateTask(
        `mix:${mixId}:${emoji}`,
        `${need}. Які дві фарби треба змішати?`,
        {
          template: 'UI_COLOR_MIX',
          object: { id: 'object', emoji, label: name },
          result: { id: mixId, name: mix.name, color: mix.color },
          paints: tubes.map((id) => ({ id, name: PAINTS[id].name, color: PAINTS[id].color })),
          recipe: [a.id, b.id],
          hint: `${mix.name} колір вийде, якщо змішати ${a.paint} і ${b.paint} фарби.`,
        },
        step,
        factPool(`${a.name} і ${b.name.toLowerCase()} разом дають ${mix.name.toLowerCase()}!`, COLOR_FACTS),
      );
    }),
  );
}

/** Task generators of every game, by game id (the cards are in `config.ts`). */
export const TASKS: Record<string, GameTasks> = {
  mixer: { pool: mixer },
};
