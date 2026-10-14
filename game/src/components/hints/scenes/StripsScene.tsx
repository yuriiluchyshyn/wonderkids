import { motion } from 'framer-motion';
import { useMemo } from 'react';
import type { FractionValue } from '@/core/game/templates/types';
import type { StripsScene as Scene } from '@/core/game/hints/types';
import { cn } from '@/core/utils/cn';
import styles from './StripsScene.module.css';

/** What a strip shows: parts coloured for the first fraction, for the second, taken away, or empty. */
type Part = 'a' | 'b' | 'gone' | 'empty';

interface Strip {
  /** The fraction written at the left of the first strip of a row of them. */
  label?: FractionValue;
  parts: Part[];
  /** The strip is being cut finer: its parts grow into place. */
  recut?: boolean;
}

/** `count` parts coloured, and as many strips as that takes: 7 parts of 6 is a strip and one more part. */
const filled = (d: number, count: number, as: Part): Part[] => Array.from({ length: Math.max(d, count) }, (_, i) => (i < count ? as : 'empty'));

/** One fraction laid out: a strip of `d` parts, and a second strip under it when the coloured parts do not fit on one. */
function laid(label: FractionValue, parts: Part[], d: number, recut?: boolean): Strip[] {
  const rows = Math.max(1, Math.ceil(parts.length / d));
  const all: Part[] = [...parts, ...Array.from({ length: rows * d - parts.length }, (): Part => 'empty')];
  return Array.from({ length: rows }, (_, row) => ({
    ...(row === 0 ? { label } : {}),
    parts: all.slice(row * d, (row + 1) * d),
    ...(recut ? { recut } : {}),
  }));
}

/** The strips of every stage the scene can show, by the name a beat `show`s it with. */
function stagesOf(scene: Scene): Record<string, Strip[]> {
  const { op, a, b, same, total, reduced } = scene;
  const [one, two] = same ? [same.a, same.b] : [a, b];
  const d = total.d;
  // Adding lays the second's parts beside the first's — past the end of the strip and onto
  // another one, when together they are more than a whole; taking away puts out as many of
  // the first's as the second asks for.
  const together: Part[] =
    op === '+'
      ? Array.from({ length: Math.max(d, one.n + two.n) }, (_, i): Part => (i < one.n ? 'a' : i < one.n + two.n ? 'b' : 'empty'))
      : Array.from({ length: d }, (_, i): Part => (i < total.n ? 'a' : i < one.n ? 'gone' : 'empty'));
  return {
    first: laid(a, filled(a.d, a.n, 'a'), a.d),
    second: [...laid(a, filled(a.d, a.n, 'a'), a.d), ...laid(b, filled(b.d, b.n, 'b'), b.d)],
    ...(same ? { cut: [...laid(one, filled(d, one.n, 'a'), d, true), ...laid(two, filled(d, two.n, 'b'), d, true)] } : {}),
    total: laid(total, together, d),
    ...(reduced ? { reduced: laid(reduced, filled(reduced.d, reduced.n, 'a'), reduced.d) } : {}),
  };
}

/** The stages a scene can show, in the order its beats show them — what a generator writes its beats for. */
export const STRIP_STAGES = ['first', 'second', 'cut', 'total', 'reduced'] as const;

function Frac({ value }: { value: FractionValue }) {
  return (
    <span className={styles.frac} aria-hidden>
      <span>{value.n}</span>
      <span className={styles.fracBar} />
      <span>{value.d}</span>
    </span>
  );
}

function StripRow({ row }: { row: Strip }) {
  return (
    <div className={styles.row}>
      {row.label ? <Frac value={row.label} /> : <span className={styles.frac} aria-hidden />}
      <div className={cn(styles.strip, row.parts.length > 12 && styles.fine)}>
        {row.parts.map((part, i) => (
          <motion.span
            key={`${row.parts.length}-${i}`}
            className={cn(styles.part, styles[part])}
            // A part that has just been cut, or just coloured in, grows into its place.
            initial={row.recut ? { scaleX: 0.2, opacity: 0 } : part === 'empty' ? false : { scale: 0.4, opacity: 0 }}
            animate={{ scaleX: 1, scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.6) }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Adding and taking away fractions on strips of one length — a strip cut into
 * as many parts as the bottom number says, as many coloured as the top one.
 * It shows the stage the beat being said names (`show`), and changes only when
 * the voice moves on to the next beat.
 */
export function StripsScene({ scene, show, round }: { scene: Scene; show?: string; round: number }) {
  const stages = useMemo(() => stagesOf(scene), [scene]);
  const strips = stages[show ?? 'first'] ?? stages.first;
  return (
    <div className={styles.strips}>
      {strips.map((row, i) => (
        <StripRow key={`${round}-${show}-${i}`} row={row} />
      ))}
    </div>
  );
}
