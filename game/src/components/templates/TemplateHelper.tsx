import type { GameViewProps } from '@/core/game/kernel/types';
import type { TemplatePayload } from '@/core/game/templates/types';
import { ClueHint } from './ClueHint';
import { CountingTowers } from './CountingTowers';
import { GroupsHint } from './GroupsHint';
import styles from './TemplateHelper.module.css';

/** Does this task bring something to count or a picture of its clues? (The shell opens the helper panel only then.) */
export function hasHelper(task: { payload: unknown }): boolean {
  const payload = task.payload as Partial<TemplatePayload> | null;
  return Boolean(payload?.counting || payload?.clue);
}

/**
 * Zero-Aggression scaffolding (PRD §5) for any template task that carries a
 * `counting` model (sensory tap-to-count cubes or rows of dots) or a `clue`
 * picture of what the story told. Never says "wrong" — it is an invitation to
 * count it out or to look again.
 */
export function TemplateHelper({ task }: GameViewProps) {
  const { counting, clue } = task.payload as TemplatePayload;
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
