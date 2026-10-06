import type { TaskConfig, TaskInstance } from '@/core/kernel/types';
import type { TemplatePayload } from '@/core/templates/types';
import { pick, randInt, shuffle, uid } from '@/core/utils/random';
import { rewardForStep } from '../difficulty';
import { buildNumberOptions } from './options';

const TOYS = [
  { emoji: '🧸', name: 'ведмедик' },
  { emoji: '🚗', name: 'машинка' },
  { emoji: '🪀', name: 'йо-йо' },
  { emoji: '⚽', name: "м'яч" },
  { emoji: '🪁', name: 'повітряний змій' },
  { emoji: '🎨', name: 'фарби' },
  { emoji: '🧩', name: 'пазл' },
  { emoji: '🦖', name: 'динозаврик' },
  { emoji: '🚂', name: 'потяг' },
  { emoji: '🪅', name: 'піньята' },
];

/** Ukrainian coins and notes used in the tray, in hryvnias. */
const DENOMINATIONS = [50, 20, 10, 5, 2, 1];

/** The fewest coins/notes that make `amount`. */
function exactChange(amount: number): number[] {
  const out: number[] = [];
  let left = amount;
  for (const d of DENOMINATIONS) {
    while (left >= d) {
      out.push(d);
      left -= d;
    }
  }
  return out;
}

/**
 * «Магазин та кишенькові гроші»: pay for a toy with coins and notes (cash
 * tray), and on later steps pick the right change.
 */
export function generateShop(config: TaskConfig): TaskInstance<TemplatePayload> {
  const { step } = config;
  const toy = pick(TOYS);
  const price = Math.min(95, randInt(4 + step * 2, 9 + step * 5));
  const reward = rewardForStep(step) + 1;

  if (step >= 7 && Math.random() < 0.5) {
    const paid = [10, 20, 50, 100].find((note) => note > price) ?? 100;
    const change = paid - price;
    return {
      id: uid('sc'),
      key: `change:${price}:${paid}`,
      prompt: `${toy.name[0].toUpperCase()}${toy.name.slice(1)} коштує ${price} гривень. Ти даєш ${paid} гривень. Яка решта?`,
      reward,
      outro: `Так, решта — ${change} гривень!`,
      payload: {
        template: 'UI_GRID_CHOICE',
        cols: 2,
        stimulus: { emoji: toy.emoji, glyphs: [String(paid), '−', String(price), '=', '?'] },
        options: buildNumberOptions(change, 4, 6).map((n) => ({ id: String(n), glyphs: [String(n), 'грн'], speak: `${n} гривень` })),
        correctId: String(change),
        hint: `Від ${paid} відніми ${price}. Можна дорахувати від ${price} до ${paid}.`,
      },
    };
  }

  // The exact coins are always there, plus a few extras to choose between.
  const extras = Array.from({ length: 3 }, () => pick(DENOMINATIONS.filter((d) => d <= Math.max(5, price))));
  return {
    id: uid('sh'),
    key: `pay:${toy.name}:${price}`,
    prompt: `Купи іграшку: ${toy.name} коштує ${price} гривень. Поклади гроші на касу`,
    reward,
    outro: 'Ка-чин! Дякуємо за покупку!',
    payload: {
      template: 'UI_CASH_TRAY',
      item: { id: 'toy', emoji: toy.emoji },
      price,
      wallet: shuffle([...exactChange(price), ...extras]),
      hint: `Почни з найбільшої купюри, яка не перевищує ${price}, а потім додавай менші.`,
    },
  };
}
