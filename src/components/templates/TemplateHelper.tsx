import type { GameViewProps } from '@/core/game/kernel/types';
import type { TemplatePayload } from '@/core/game/templates/types';
import { CountingTowers } from './CountingTowers';
import { GroupsHint } from './GroupsHint';
import styles from './TemplateHelper.module.css';

/** Does this task bring something to count? (The shell opens the helper panel only then.) */
export function hasHelper(task: { payload: unknown }): boolean {
  return Boolean((task.payload as Partial<TemplatePayload> | null)?.counting);
}

/**
 * Zero-Aggression scaffolding (PRD §5) for any template task that carries a
 * `counting` model: sensory tap-to-count cubes or rows of dots. Never says
 * "wrong" — it is an invitation to count it out.
 */
export function TemplateHelper({ task }: GameViewProps) {
  const counting = (task.payload as TemplatePayload).counting;
  if (!counting) return null;
  return (
    <div className={styles.helper}>
      {counting.kind === 'groups' ? <GroupsHint rows={counting.rows} cols={counting.cols} /> : <CountingTowers count={counting.count} split={counting.split} />}
    </div>
  );
}
