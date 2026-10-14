import { saidOf, type GameViewProps } from '@/core/game/kernel/types';
import type { TemplatePayload } from '@/core/game/templates/types';
import { ClueHint } from './ClueHint';
import { CountingTowers } from './CountingTowers';
import { ExplainHint } from './ExplainHint';
import { FractionBars } from './FractionBars';
import { GroupsHint } from './GroupsHint';
import styles from './TemplateHelper.module.css';

/** Does this task bring something to count, a picture of its clues, a worked explanation or a sum drawn on strips? (The shell opens the helper panel only then.) */
export function hasHelper(task: { payload: unknown }): boolean {
  const payload = task.payload as Partial<TemplatePayload> | null;
  return Boolean(payload?.counting || payload?.clue || payload?.explain || payload?.bars);
}

/** Does this task explain itself when the child has not answered for a long while? */
export function explainsOnIdle(task: { payload: unknown } | null): boolean {
  const payload = task?.payload as Partial<TemplatePayload> | null;
  return Boolean(payload?.explain || payload?.bars);
}

/**
 * Zero-Aggression scaffolding (PRD §5) for any template task that carries a
 * `counting` model (sensory tap-to-count cubes or rows of dots), a `clue`
 * picture of what the story told, a worked `explain`, or a sum of fractions
 * drawn on `bars`. Never says "wrong" — it is an invitation to count it out,
 * to look again, or to watch it worked out once.
 */
export function TemplateHelper({ task }: GameViewProps) {
  const { counting, clue, explain, bars } = task.payload as TemplatePayload;
  if (explain) {
    return (
      <div className={styles.helper}>
        <ExplainHint explain={explain} />
      </div>
    );
  }
  if (bars) {
    // The lesson reads itself out, so it needs the task's twin in the voice's language.
    const voiced = saidOf(task);
    return (
      <div className={styles.helper}>
        <FractionBars bars={bars} said={(voiced.payload as TemplatePayload).bars} lang={voiced.lang} />
      </div>
    );
  }
  if (clue) {
    return (
      <div className={styles.helper}>
        <ClueHint clue={clue} />
      </div>
    );
  }
  if (!counting) return null;
  return (
    <div className={styles.helper}>
      {counting.kind === 'groups' ? <GroupsHint rows={counting.rows} cols={counting.cols} /> : <CountingTowers count={counting.count} split={counting.split} />}
    </div>
  );
}
