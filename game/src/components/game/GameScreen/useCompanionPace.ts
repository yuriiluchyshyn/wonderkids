import { useIdleRollback } from '../useIdleRollback';
import type { GameSession } from './types';

/**
 * Where the companion stands on the race track. Idle drift is real: every
 * whole step it slides back adds one task to the level, so the next answer
 * moves it one step on from where it stands instead of leaping back. It never
 * slides past the start, and never while the child is listening, reading or
 * resting (`paused`).
 *
 * The track is measured in the level's own tasks (`paced`); a task added by
 * idling is not a longer track but one step of it lost: the companion stands
 * at (solved − idle extras) of `paced`, and still arrives exactly at the end.
 */
export function useCompanionPace(session: GameSession, paused: boolean) {
  const { solvedCount, total, idleExtras, extendForIdle, task } = session;
  const paced = Math.max(1, total - idleExtras);
  const position = Math.max(0, (solvedCount - idleExtras) / paced);
  const { rollback, markActivity } = useIdleRollback(task?.id ?? 'none', {
    paused: paused || session.finished || session.justSolved || session.hintActive,
    step: 1 / paced,
    limit: position,
    onRetreat: () => (extendForIdle() ? 1 / paced : null),
  });
  // Finished: pinned at the goal, no roll-back on the celebration screen.
  const progress = session.finished ? 1 : Math.max(0, position - rollback);
  return { progress, markActivity };
}
