import { useCallback, useEffect, useRef, useState } from 'react';
import { useGameStore, type CompanionSpeed } from '@/core/store/useGameStore';

/**
 * Idle intervals (PRD §4.1): after `delayMs` without an answer the companion
 * starts gently rolling back, nudging the child to re-engage. `perTick` is how
 * much of the track it slips every tick.
 */
const CONFIG: Record<Exclude<CompanionSpeed, 'off'>, { delayMs: number; perTick: number }> = {
  verySlow: { delayMs: 60_000, perTick: 0.003 },
  slow: { delayMs: 40_000, perTick: 0.005 },
  medium: { delayMs: 25_000, perTick: 0.008 },
  fast: { delayMs: 15_000, perTick: 0.016 },
};
const TICK_MS = 600;

interface IdleRollbackOptions {
  /** Nothing drifts while this is true (a fact is being read, a tip is up…). */
  paused: boolean;
  /** One task's worth of track (1 / tasks in the level). */
  step: number;
  /** How far back the companion can still go (it never passes the start). */
  limit: number;
  /**
   * The companion slid a whole step back: add a task to the level. Returns how
   * much of the slide the longer level now accounts for, or null when the
   * level cannot grow any more.
   */
  onRetreat: () => number | null;
}

/**
 * Returns `rollback` (0..1) to subtract from the companion's position while
 * the child is idle, and `markActivity` to stop the slide.
 *
 * A slide is real, not cosmetic: every full step the companion rolls back
 * becomes one more task in the level (`onRetreat`), so answering again moves it
 * forward by one step from where it stands — it never leaps back to where it
 * was. Only the unfinished part of a step is forgiven on the next answer.
 */
export function useIdleRollback(resetKey: string | number, options: IdleRollbackOptions) {
  const speed = useGameStore((s) => s.settings.companionSpeed);
  const lastActivity = useRef(Date.now());
  const [rollback, setRollback] = useState(0);
  const rollbackRef = useRef(0);
  // Distance slid since the last task was added (or since the last answer).
  const drift = useRef(0);
  // Keep the latest options without re-arming the interval each render.
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const markActivity = useCallback(() => {
    lastActivity.current = Date.now();
    drift.current = 0;
    rollbackRef.current = 0;
    setRollback(0);
  }, []);

  // Fresh task → fresh start.
  useEffect(() => {
    markActivity();
  }, [resetKey, markActivity]);

  useEffect(() => {
    if (speed === 'off') {
      markActivity();
      return;
    }
    const cfg = CONFIG[speed] ?? CONFIG.medium;
    const id = window.setInterval(() => {
      const { paused, step, limit, onRetreat } = optionsRef.current;
      if (paused) {
        // Time spent listening or reading is not idling.
        lastActivity.current = Date.now();
        return;
      }
      if (Date.now() - lastActivity.current < cfg.delayMs) return;

      let next = Math.min(Math.max(0, limit), rollbackRef.current + cfg.perTick);
      drift.current += Math.max(0, next - rollbackRef.current);
      // A hair under a step counts: the slide is summed in small float ticks
      // and may stop at the start line just short of the exact value.
      if (step > 0 && drift.current >= step * 0.98) {
        drift.current = 0;
        const absorbed = onRetreat();
        // The longer level already places the companion further back.
        next = absorbed === null ? Math.min(next, step) : Math.max(0, next - absorbed);
      }
      if (next !== rollbackRef.current) {
        rollbackRef.current = next;
        setRollback(next);
      }
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [speed, markActivity]);

  return { rollback, markActivity };
}
