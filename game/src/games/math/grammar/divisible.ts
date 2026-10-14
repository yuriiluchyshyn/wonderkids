import { fill } from '@/core/language/fill';
import type { Divisible, DivisibleRule } from '@/core/game/templates/types';

/**
 * The divisibility lesson of the number maze, put together the same way in
 * every language: the rule for the number being practised, and the lines
 * about the number the child has just stepped on.
 *
 * Those last lines keep their `{holes}` — `{n}` the number stepped on,
 * `{times}` how many of the divisor fit into it, `{left}` what is left over,
 * `{mark}` the thing the rule looks at (the last digit, the sum of the
 * digits). They are filled where the lesson is drawn
 * (`components/templates/DivisibleHint`), because the number is not known
 * when the task is made.
 *
 * A language brings only words (`maze.rule.*` of its `games/math.json`); the
 * branching lives here, so a fourth language is a fourth set of sentences
 * and no code.
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
  /** «У {n} вміщається {times} по {k}, і {left} залишається.» */
  left: string;
  /** «У {n} вміщається рівно {times} по {k} — нічого не залишається.» */
  exact: string;
  /** Why this number is not a multiple: one line per kind of rule. */
  whyEnding: string;
  whyDigits: string;
  whyOther: string;
  /** What stands before the last of a list of digits: « або ». */
  or: string;
}

/** A list of digits as it is read: «0, 2, 4, 6 або 8». */
function listed(marks: number[], or: string): string {
  const all = marks.join(', ');
  return marks.length > 1 ? all.replace(/, ([^,]+)$/, `${or}$1`) : all;
}

export function divisibleWords(J: DivisibleJson, k: number, how: DivisibleRule, marks: number[]): Divisible['words'] {
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
  const why = how === 'ending' ? fill(J.whyEnding, { k, marks: list }) : how === 'digits' ? fill(J.whyDigits, { k }) : fill(J.whyOther, { k });
  // `{n}`, `{times}`, `{left}` and `{mark}` are left standing: they are the child's own step.
  return { rule, left: fill(J.left, { k }), exact: fill(J.exact, { k }), why };
}
