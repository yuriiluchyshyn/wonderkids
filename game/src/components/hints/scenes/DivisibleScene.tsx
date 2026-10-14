import { motion } from 'framer-motion';
import type { DivisibleScene as Scene } from '@/core/game/hints/types';
import { cn } from '@/core/utils/cn';
import { blinkProps, useHintFocus } from '../HintStage';
import styles from './DivisibleScene.module.css';

/** The most counters worth drawing: above this the groups are told, not laid out. */
const MOST_COUNTERS = 60;

/** Numbers as a child reads them: a real minus sign, not a hyphen. */
const show = (value: number) => String(value).replace('-', '−');

/** The sum of a number's digits: 174 → 12. */
export const digitSum = (n: number): number =>
  Math.abs(n)
    .toString()
    .split('')
    .reduce((sum, digit) => sum + Number(digit), 0);

/** What the rule looks at in this number: its last digit, or the sum of its digits. */
export function markOf(scene: Pick<Scene, 'how'>, n: number): number {
  return scene.how === 'digits' ? digitSum(n) : Math.abs(n) % 10;
}

/**
 * The holes a board fills the maze's script with, for the number `n` the
 * child stepped on: how many of `by` fit into it, what is left over, and
 * what the rule looks at — and which beats fit it: `off` (something is left
 * over), `parted` (some groups, and something over), `whole` (nothing over).
 */
export function divisibleHoles(scene: Pick<Scene, 'by' | 'how'>, n: number): Record<string, string | number> {
  const value = Math.abs(n);
  const left = value % scene.by;
  const times = Math.floor(value / scene.by);
  const yes = (fact: boolean) => (fact ? 1 : '');
  return { n: show(n), times, left, mark: markOf(scene, n), off: yes(left > 0), parted: yes(left > 0 && times > 0), whole: yes(left === 0) };
}

/** The number laid out in groups of `by`, whatever will not make a whole group standing apart. */
function Groups({ n, by }: { n: number; by: number }) {
  const value = Math.abs(n);
  const groups = Math.floor(value / by);
  const left = value % by;
  const all = blinkProps(useHintFocus('div:groups'));
  const rest = blinkProps(useHintFocus('div:left'));
  if (value > MOST_COUNTERS) {
    return (
      <p className={cn(styles.counted, all.className)} style={all.style}>
        {show(n)} = {groups} × {by}
        {left > 0 && <span className={rest.className} style={rest.style}> + {left}</span>}
      </p>
    );
  }
  return (
    <div className={styles.groups}>
      {Array.from({ length: groups }, (_, g) => (
        <motion.span
          key={g}
          className={cn(styles.group, all.className)}
          style={all.style}
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
        <motion.span
          className={cn(styles.group, styles.left, rest.className)}
          style={rest.style}
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

/** The rule drawn on the number itself: the digit it turns on, and what a multiple may have there. */
function Rule({ scene, n }: { scene: Scene; n: number }) {
  const { how, marks, by } = scene;
  const digits = Math.abs(n).toString().split('');
  const mark = blinkProps(useHintFocus('div:mark'));
  const list = blinkProps(useHintFocus('div:marks'));
  if (how === 'ending') {
    return (
      <div className={styles.rule}>
        <span className={styles.number} aria-hidden>
          {show(n).slice(0, -1)}
          <span className={cn(styles.last, mark.className)} style={mark.style}>
            {digits[digits.length - 1]}
          </span>
        </span>
        <span className={cn(styles.marks, list.className)} style={list.style} aria-hidden>
          {marks.map((m) => (
            <span key={m} className={cn(styles.mark, m === markOf(scene, n) && styles.markHit)}>
              {m}
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
          <span className={cn(styles.mark, digitSum(n) % by === 0 && styles.markHit, mark.className)} style={mark.style}>
            {digitSum(n)}
          </span>
        </span>
      </div>
    );
  }
  if (how === 'twice' || how === 'pair') {
    return (
      <div className={styles.rule}>
        <span className={styles.number} aria-hidden>
          {show(n)}
        </span>
        <span className={cn(styles.marks, list.className)} style={list.style} aria-hidden>
          {marks.map((m, i) => (
            <span key={i} className={styles.mark}>
              ÷{m}
            </span>
          ))}
        </span>
      </div>
    );
  }
  return null;
}

/**
 * Why a number is, or is not, a multiple — the number maze's picture, about
 * the very number the child stepped on (the hole `n`): the number laid out in
 * groups of the divisor with whatever is left over standing apart — which is
 * what a remainder is — and the rule for telling a multiple at a glance.
 */
export function DivisibleScene({ scene, holes }: { scene: Scene; holes?: Record<string, string | number> }) {
  // Nothing stepped on (shown for another reason): a multiple of the divisor, so nothing about the board is given away.
  const raw = holes?.n === undefined ? scene.by * 3 : Number(String(holes.n).replace('−', '-'));
  const n = Number.isFinite(raw) ? raw : scene.by * 3;
  return (
    <div className={styles.scene}>
      <Groups n={n} by={scene.by} />
      <Rule scene={scene} n={n} />
    </div>
  );
}
