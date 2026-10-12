import type { Explain } from '@/core/game/templates/types';
import { ClockFace } from './ClockFace';
import styles from './ExplainHint.module.css';

/**
 * A worked explanation of the answer (`payload.explain`): the clock it is
 * about, and line by line how to read it — each line marked in the colour of
 * what it speaks of (the short black hand, the long red one, the time of day),
 * the last one the answer itself.
 */
export function ExplainHint({ explain }: { explain: Explain }) {
  return (
    <div className={styles.explain}>
      {explain.clock && <ClockFace time={explain.clock} className={styles.clock} />}
      <ol className={styles.lines}>
        {explain.lines.map((line, i) => (
          <li key={i} className={styles.line} data-tone={line.tone}>
            <span className={styles.mark} aria-hidden />
            <span>{line.text}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
