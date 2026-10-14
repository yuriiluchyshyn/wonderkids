import { motion } from 'framer-motion';
import { useMemo } from 'react';
import type { Divisible } from '@/core/game/templates/types';
import { fill } from '@/core/language/fill';
import { cn } from '@/core/utils/cn';
import styles from './DivisibleHint.module.css';

/** The most counters worth drawing: above this the groups are told, not laid out. */
const MOST_COUNTERS = 60;

/** Numbers as a child reads them: a real minus sign, not a hyphen. */
const show = (value: number) => String(value).replace('-', '−');

/** The sum of a number's digits: 174 → 12. */
const digitSum = (n: number): number =>
  Math.abs(n)
    .toString()
    .split('')
    .reduce((sum, digit) => sum + Number(digit), 0);

/** What the rule looks at in this number: its last digit, or the sum of its digits. */
function markOf(divisible: Divisible, n: number): number {
  return divisible.how === 'digits' ? digitSum(n) : Math.abs(n) % 10;
}

/**
 * The number laid out in groups of `by`, with whatever will not make a whole
 * group standing apart. This is what a remainder is: the groups fill up, and
 * then there are some left over with nowhere to go.
 */
function Groups({ n, by }: { n: number; by: number }) {
  const value = Math.abs(n);
  const groups = Math.floor(value / by);
  const left = value % by;
  if (value > MOST_COUNTERS) return null;
  return (
    <div className={styles.groups}>
      {Array.from({ length: groups }, (_, g) => (
        <motion.span
          key={g}
          className={styles.group}
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25, delay: Math.min(g * 0.12, 1.2) }}
        >
          {Array.from({ length: by }, (_, i) => (
            <span key={i} className={styles.dot} />
          ))}
        </motion.span>
      ))}
      {left > 0 && (
        // What is left over: it never fills a group, so it is drawn apart and it keeps moving.
        <motion.span
          className={cn(styles.group, styles.left, 'loop-bob')}
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25, delay: Math.min(groups * 0.12 + 0.2, 1.4) }}
        >
          {Array.from({ length: left }, (_, i) => (
            <span key={i} className={cn(styles.dot, styles.loose)} />
          ))}
        </motion.span>
      )}
    </div>
  );
}

/**
 * The rule drawn on the number itself: the digit it turns on, lit, and the
 * digits a multiple is allowed to end in beside it. For a rule about the sum
 * of the digits, the digits are shown adding up.
 */
function Rule({ divisible, n }: { divisible: Divisible; n: number }) {
  const { how, marks, by } = divisible;
  const digits = Math.abs(n).toString().split('');
  if (how === 'ending') {
    return (
      <div className={styles.rule}>
        <span className={styles.number} aria-hidden>
          {show(n).slice(0, -1)}
          <motion.span className={styles.last} animate={{ scale: [1, 1.18, 1] }} transition={{ duration: 0.6, repeat: 2 }}>
            {digits[digits.length - 1]}
          </motion.span>
        </span>
        <span className={styles.marks} aria-hidden>
          {marks.map((mark) => (
            <span key={mark} className={cn(styles.mark, mark === markOf(divisible, n) && styles.markHit)}>
              {mark}
            </span>
          ))}
        </span>
      </div>
    );
  }
  if (how === 'digits') {
    return (
      <div className={styles.rule}>
        <span className={styles.number} aria-hidden>
          {digits.map((digit, i) => (
            <span key={i}>
              <span className={styles.last}>{digit}</span>
              {i < digits.length - 1 && <span className={styles.plus}>+</span>}
            </span>
          ))}
        </span>
        <span className={styles.marks} aria-hidden>
          <span className={styles.plus}>=</span>
          <motion.span
            className={cn(styles.mark, digitSum(n) % by === 0 && styles.markHit)}
            animate={{ scale: [0.6, 1.15, 1] }}
            transition={{ duration: 0.5 }}
          >
            {digitSum(n)}
          </motion.span>
        </span>
      </div>
    );
  }
  if (how === 'twice' || how === 'pair') {
    // Halving, or two smaller rules at once: the numbers to try, in order.
    return (
      <div className={styles.rule}>
        <span className={styles.number} aria-hidden>
          {show(n)}
        </span>
        <span className={styles.marks} aria-hidden>
          {marks.map((mark, i) => (
            <motion.span
              key={i}
              className={styles.mark}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 * i }}
            >
              ÷{mark}
            </motion.span>
          ))}
        </span>
      </div>
    );
  }
  return null;
}

/**
 * Why a number is, or is not, a multiple — the lesson of the number maze
 * (`payload.divisible`), drawn about the very number the child stepped on.
 *
 * Two things, in this order: what a remainder is, laid out as groups of the
 * divisor with whatever is left over standing apart; and then the rule for
 * telling a multiple of THIS number at a glance — only the rule that the
 * child's own mistake calls for, never the whole list of them.
 *
 * With no wrong step yet (the helper came for other reasons) it shows the rule
 * on a number that does divide, so nothing is given away about the board.
 */
export function DivisibleHint({ divisible, tried }: { divisible: Divisible; tried: number | null }) {
  const { by, words } = divisible;
  // Nothing stepped on yet: a multiple of the divisor, so the picture teaches without pointing at a tile.
  const n = tried ?? by * 3;
  const value = Math.abs(n);
  const times = Math.floor(value / by);
  const left = value % by;
  const lines = useMemo(() => {
    const holes = { n: show(n), times, left, mark: markOf(divisible, n) };
    return [fill(left === 0 ? words.exact : words.left, holes), ...(left === 0 ? [] : [fill(words.why, holes)]), words.rule];
  }, [divisible, n, times, left, words]);

  return (
    <div className={styles.hint}>
      <Groups n={n} by={by} />
      <p className={styles.said}>{lines[0]}</p>
      <Rule divisible={divisible} n={n} />
      {lines.slice(1).map((line, i) => (
        <motion.p key={i} className={cn(styles.said, i === lines.length - 2 && styles.ruleText)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 + i * 0.25 }}>
          {line}
        </motion.p>
      ))}
    </div>
  );
}

/** Everything the lesson says about this number, in order — what the voice reads out. */
export function divisibleSpeech(divisible: Divisible, tried: number | null): string {
  const n = tried ?? divisible.by * 3;
  const value = Math.abs(n);
  const left = value % divisible.by;
  const holes = { n: show(n), times: Math.floor(value / divisible.by), left, mark: markOf(divisible, n) };
  const { words } = divisible;
  return [fill(left === 0 ? words.exact : words.left, holes), ...(left === 0 ? [] : [fill(words.why, holes)]), words.rule].join(' ');
}
