import { fill } from '@/core/language/fill';
import type { DivisibleRule, HintBeat } from '@/core/game/hints/types';

/**
 * The number maze's help, beat by beat, put together the same way in every
 * language: how many of the divisor fit into the number the child stepped on
 * and what is left over, why that number is not one of the rule's, and the
 * rule itself.
 *
 * It is a board's script: the beats keep their `{holes}` — `{n}` the number
 * stepped on, `{times}`, `{left}`, `{mark}` (the thing the rule looks at) —
 * and say only what fits the number (`if: 'short'` when something is left
 * over). The board fills them (`components/hints/scenes/DivisibleScene`'s
 * `divisibleHoles`), because the number is not known when the task is made.
 *
 * A language brings only words (`maze.rule.*` of its `games/math.json`); the
 * branching lives here.
 */
export interface DivisibleJson {
  /** «На {k} діляться числа, що закінчуються на {marks}.» */
  ending: string;
  /** «На {k} ділиться число, у якого сума цифр ділиться на {k}.» */
  digits: string;
  /** Halving, by how many halvings it takes: `2` for 4, `3` for 8. */
  twice: Record<string, string>;
  /** «На {k} діляться числа, які діляться і на {a}, і на {b}.» */
  pair: string;
  /** No rule worth learning (7): count it out — «{k}, {k2}, {k3}…». */
  count: string;
  /** «{n} — це {times} по {k}, і ще {left} залишається.» */
  left: string;
  /** «{n} — це рівно {times} по {k}.» */
  exact: string;
  /** Why this number is not a multiple, for a rule that looks at a digit — or at all of them. */
  whyEnding: string;
  whyDigits: string;
  /** What stands before the last of a list of digits: « або ». */
  or: string;
}

/** A list of digits as it is read: «0, 2, 4, 6 або 8». */
function listed(marks: number[], or: string): string {
  const all = marks.join(', ');
  return marks.length > 1 ? all.replace(/, ([^,]+)$/, `${or}$1`) : all;
}

export function divisibleBeats(J: DivisibleJson, k: number, how: DivisibleRule, marks: number[]): HintBeat[] {
  const list = listed(marks, J.or);
  const rule =
    how === 'ending'
      ? fill(J.ending, { k, marks: list })
      : how === 'digits'
        ? fill(J.digits, { k })
        : how === 'twice'
          ? fill(J.twice[String(marks.length)] ?? J.twice['2'], { k })
          : how === 'pair'
            ? fill(J.pair, { k, a: marks[0], b: marks[1] })
            : fill(J.count, { k, k2: k * 2, k3: k * 3 });
  // What the rule turns on lights while the rule is said: the endings allowed, the sum of the digits, the numbers to try.
  const ruleFocus = how === 'digits' ? ['div:mark'] : how === 'count' ? ['div:groups'] : ['div:marks'];
  const why = how === 'ending' ? J.whyEnding : how === 'digits' ? J.whyDigits : undefined;
  return [
    // The groups first, and then what will not make one: that is what a remainder is.
    // (A number smaller than `k` makes no group at all — «1 — це 0 по 2» says nothing; it goes straight to why.)
    { text: fill(J.left, { k }), focus: ['div:groups', 'div:left'], if: 'parted' },
    { text: fill(J.exact, { k }), focus: ['div:groups'], if: 'whole' },
    ...(why ? [{ text: fill(why, { k, marks: list }), focus: ['div:mark'], if: 'off' }] : []),
    { text: rule, focus: ruleFocus },
  ];
}
