import type { GameViewProps } from '@/core/kernel/types';
import { CountingTowers } from '../components/CountingTowers';
import { GroupsHint } from '../components/GroupsHint';
import { PieFood } from '../components/PieFood';
import type { MathPayload } from '../math.types';
import styles from './Helper.module.css';

/** Chooses the most helpful sensory model for the current task. */
function renderHelper(payload: MathPayload) {
  if (payload.kind === 'fraction') {
    return <PieFood food={payload.food} denom={payload.denom} filled={payload.filled} />;
  }
  // Multiplication: show the array/groups model (bounded, phone-friendly)
  // instead of counting all the way to a potentially large product.
  if (payload.op === '×') {
    return <GroupsHint rows={payload.a} cols={payload.b} />;
  }
  return <CountingTowers count={payload.answer} />;
}

/**
 * Zero-Aggression scaffolding (PRD §5). For arithmetic it offers sensory
 * tap-to-count towers; for fractions it enlarges the plate so the slices are
 * easy to count. Never says "wrong" — it's an invitation to explore.
 */
export function MathVisualHelper({ task }: GameViewProps) {
  const payload = task.payload as MathPayload;

  return <div className={styles.helper}>{renderHelper(payload)}</div>;
}
