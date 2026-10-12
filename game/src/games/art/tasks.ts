import { Mechanics } from '@/core/game/kernel/mechanics';
import type { TaskConfig, TaskInstance } from '@/core/game/kernel/types';
import type { Card, TemplatePayload } from '@/core/game/templates/types';
import { shuffle } from '@/core/utils/random';
import { templateTask, type GameTasks } from '../shared/templateModule';
import { COLORS, LEARN_STEPS, MIXES, PAINTS, STEPS, type ColorId, type PaintId } from './content/data';
import { artTexts } from './grammar';

type Tasks = TaskInstance<TemplatePayload>[];

/** «Змішувач Кольорів»: every step brings new things to paint — and on later steps three paints, or glitter. */
function mixer(step: number, config: Pick<TaskConfig, 'lang'>): Tasks {
  const T = artTexts(config.lang);
  return STEPS.slice(0, step).flatMap(({ tubes, things }) =>
    things.map(([emoji, thing, mixId]) => {
      const mix = MIXES[mixId];
      const color = COLORS[mix.color] as { hex: string; shine?: boolean };
      return templateTask(
        `mix:${mixId}:${emoji}`,
        T.prompt(thing, mixId),
        {
          template: Mechanics.ColorMix,
          object: { id: 'object', emoji, label: T.thing(thing) },
          result: { id: mixId, name: T.colors[mix.color], color: color.hex, shine: color.shine },
          paints: tubes.map((id) => {
            const paint = PAINTS[id] as { color: string; shine?: boolean };
            return { id, name: T.paints[id], color: paint.color, shine: paint.shine };
          }),
          recipe: [...(mix.recipe as readonly PaintId[])],
          hint: T.hint(mixId),
        },
        step,
        T.outro(mixId),
      );
    }),
  );
}

/** Answers on a colour board. */
const CHOICES = 6;

/** How far apart two colours look (plain RGB distance; a sparkle against none counts as far). */
function distance(a: ColorId, b: ColorId): number {
  const rgb = (id: ColorId) => {
    const hex = COLORS[id].hex;
    return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  };
  const [x, y] = [rgb(a), rgb(b)];
  const shine = (id: ColorId) => Boolean((COLORS[id] as { shine?: boolean }).shine);
  return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]) + (shine(a) === shine(b) ? 0 : 120);
}

/**
 * The five other colours on a board: early on any of the colours learnt so
 * far; the further the path, the more of them are the colours that look most
 * like the one asked (sky blue beside blue and turquoise).
 */
function others(color: ColorId, opened: readonly ColorId[], step: number): ColorId[] {
  const rest = opened.filter((c) => c !== color);
  const near = step <= 2 ? 0 : Math.min(CHOICES - 1, Math.ceil(step / 4));
  const close = [...rest].sort((a, b) => distance(color, a) - distance(color, b)).slice(0, near);
  const far = shuffle(rest.filter((c) => !close.includes(c))).slice(0, CHOICES - 1 - close.length);
  return [...close, ...far];
}

/**
 * «Вивчаємо кольори» (UI_GRID_CHOICE): «Вибери жовтий колір» — six blobs of
 * colour, no names; or «Який це колір?» — a splash of it and six names. Every
 * step opens new colours (`LEARN_STEPS`), and the boards fill with colours
 * that look more and more alike. No facts: the next task follows at once.
 */
function colors(step: number, config: Pick<TaskConfig, 'lang'>): Tasks {
  const T = artTexts(config.lang);
  const opened = LEARN_STEPS.slice(0, step).flat();
  const swatch = (id: ColorId): Card['swatch'] => ({ color: COLORS[id].hex, shine: (COLORS[id] as { shine?: boolean }).shine });
  return opened.flatMap((color) => {
    const board = shuffle([color, ...others(color, opened, step)]);
    const named = shuffle([color, ...others(color, opened, step)]);
    return [
      templateTask(
        `color:pick:${color}`,
        T.pickColor(color),
        {
          template: Mechanics.GridChoice,
          cols: 3,
          // No names and no speaker: they would say which one it is.
          options: board.map((id) => ({ id, swatch: swatch(id) })),
          correctId: color,
        },
        step,
      ),
      templateTask(
        `color:name:${color}`,
        T.nameColor,
        {
          template: Mechanics.GridChoice,
          cols: 3,
          stimulus: { swatch: swatch(color) },
          options: named.map((id) => ({ id, label: T.colors[id] })),
          correctId: color,
        },
        step,
      ),
    ];
  });
}

/** Task generators of every game, by game id (the cards are in `config.ts`). */
export const TASKS: Record<string, GameTasks> = {
  mixer: { pool: mixer },
  colors: { pool: colors },
};
