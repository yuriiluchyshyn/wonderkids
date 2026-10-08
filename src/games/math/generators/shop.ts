import { Mechanics } from '@/core/game/kernel/mechanics';
import { countWord } from '@/core/lang/uk';
import { num, spoken, written } from '@/core/lang/numbers';
import { currencyOf } from '@/core/game/content/currency';
import type { TaskConfig, TaskInstance } from '@/core/game/kernel/types';
import type { TemplatePayload } from '@/core/game/templates/types';
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

/** The text of a task as it is printed and as the voice reads it. */
const texts = (text: string) => ({ prompt: written(text), speak: spoken(text) });

/** How many different coins and notes lie in front of the child. */
const WALLET_SIZE = 5;

/**
 * The coins and notes that make `amount` using each value at most once, or
 * null when that cannot be done (4 would need two 2s). The wallet never holds
 * two of the same, so only such prices are asked.
 */
function distinctChange(amount: number, values: readonly number[]): number[] | null {
  const out: number[] = [];
  let left = amount;
  for (const d of values) {
    if (left >= d) {
      out.push(d);
      left -= d;
    }
  }
  return left === 0 ? out : null;
}

/** A price in the step's range that distinct coins can pay exactly. */
function payablePrice(step: number, values: readonly number[]): number {
  const low = 3 + step * 2;
  const high = Math.min(95, 9 + step * 5);
  for (let i = 0; i < 40; i += 1) {
    const price = randInt(low, high);
    if (distinctChange(price, values)) return price;
  }
  return 7;
}

/**
 * «Магазин та кишенькові гроші»: pay for a toy with coins and notes (cash
 * tray), and on later steps pick the right change.
 */
export function generateShop(config: TaskConfig): TaskInstance<TemplatePayload> {
  const { step } = config;
  const toy = pick(TOYS);
  const money = currencyOf(config.currency);
  const price = payablePrice(step, money.values);
  // «10 гривень» on the screen, «десять гривень» for the voice.
  const sum = (n: number) => `${num(n, money.gender)} ${countWord(n, money.counted)}`;
  const reward = rewardForStep(step) + 1;

  if (step >= 7 && Math.random() < 0.5) {
    const paid = [10, 20, 50, 100].find((note) => note > price && money.values.includes(note)) ?? 100;
    const change = paid - price;
    return {
      id: uid('sc'),
      key: `change:${price}:${paid}`,
      ...texts(`${toy.name[0].toUpperCase()}${toy.name.slice(1)} коштує ${sum(price)}. Ти даєш ${sum(paid)}. Яка решта?`),
      reward,
      payload: {
        template: Mechanics.GridChoice,
        cols: 3,
        stimulus: { emoji: toy.emoji, glyphs: [String(paid), '−', String(price), '=', '?'] },
        options: buildNumberOptions(change, 6, 6).map((n) => ({ id: String(n), glyphs: [String(n), money.short], speak: spoken(sum(n)) })),
        correctId: String(change),
        hint: `Від ${paid} відніми ${price}. Можна дорахувати від ${price} до ${paid}.`,
      },
    };
  }

  // The exact coins are always there, plus other values to choose between —
  // every coin and note is different, so the child really has to add up.
  const exact = distinctChange(price, money.values) ?? [];
  const others = shuffle(money.values.filter((d) => !exact.includes(d)));
  // Mostly values near the price: a 100 next to a 7 is no temptation.
  const near = others.filter((d) => d <= Math.max(10, price * 2));
  const extras = [...near, ...others.filter((d) => !near.includes(d))].slice(0, Math.max(2, WALLET_SIZE - exact.length));
  return {
    id: uid('sh'),
    key: `pay:${toy.name}:${price}`,
    ...texts(`Купи іграшку: ${toy.name}. Ціна — ${sum(price)}. Поклади гроші на касу.`),
    reward,
    payload: {
      template: Mechanics.CashTray,
      item: { id: 'toy', emoji: toy.emoji },
      price,
      wallet: shuffle([...exact, ...extras]),
      currency: money.id,
      hint: `Почни з найбільших грошей, які не перевищують ${price}, а потім додавай менші.`,
    },
  };
}
