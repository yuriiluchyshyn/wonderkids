import { motion } from 'framer-motion';
import type { CompareScene as Scene } from '@/core/game/hints/types';
import { written } from '@/core/language/marks';
import { cn } from '@/core/utils/cn';
import { blinkProps, useHintFocus } from '../HintStage';
import styles from './CompareScene.module.css';

/** How tall the bigger amount's bar is; the other is drawn to the same scale. */
const TALLEST = 120;
const SHORTEST = 10;

/** One side: its bar — as tall as what it is worth — and how it is written under it. */
function Side({ side, max, tone, focus }: { side: Scene['left']; max: number; tone: 'a' | 'b'; focus: string }) {
  const lit = blinkProps(useHintFocus(focus));
  const height = Math.max(SHORTEST, Math.round((side.value / max) * TALLEST));
  return (
    <div className={cn(styles.side, lit.className)} style={lit.style}>
      <div className={styles.well} style={{ height: TALLEST }}>
        <motion.span
          className={cn(styles.bar, tone === 'a' ? styles.barA : styles.barB)}
          initial={{ height: 0 }}
          animate={{ height }}
          transition={{ type: 'spring', stiffness: 120, damping: 16 }}
        />
      </div>
      <span className={styles.text}>{written(side.text)}</span>
      {side.worth && <span className={styles.worth}>= {written(side.worth)}</span>}
    </div>
  );
}

/**
 * The sign drawn as a beak: its two strokes meet at the point that faces the
 * smaller amount, and open — wide — towards the bigger one. For «=» two
 * equal strokes.
 */
function Sign({ sign }: { sign: Scene['sign'] }) {
  const lit = blinkProps(useHintFocus('cmp:sign'));
  const path = sign === 'gt' ? 'M 12 12 L 52 50 L 12 88' : sign === 'lt' ? 'M 52 12 L 12 50 L 52 88' : 'M 10 38 L 54 38 M 10 62 L 54 62';
  return (
    <svg viewBox="0 0 64 100" className={cn(styles.sign, lit.className)} style={lit.style} aria-hidden>
      <motion.path
        d={path}
        className={styles.signStroke}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
    </svg>
  );
}

/**
 * «Більше, менше, дорівнює» as a picture: the two amounts as bars — the taller
 * one is the bigger — and, once the beat that brings it is said (`show:
 * 'sign'`), the sign between them, opening its wide side to the taller bar.
 */
export function CompareScene({ scene, seen }: { scene: Scene; seen: Set<string> }) {
  const max = Math.max(scene.left.value, scene.right.value, 1);
  return (
    <div className={styles.compare}>
      <Side side={scene.left} max={max} tone="a" focus="cmp:left" />
      <div className={styles.between}>{seen.has('sign') ? <Sign sign={scene.sign} /> : <span className={styles.ask}>?</span>}</div>
      <Side side={scene.right} max={max} tone="b" focus="cmp:right" />
    </div>
  );
}
