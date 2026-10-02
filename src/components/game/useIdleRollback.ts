import { useCallback, useEffect, useRef, useState } from 'react';
import { useGameStore, type CompanionSpeed } from '@/core/store/useGameStore';

/**
 * Idle intervals (PRD §4.1): after this much inactivity the companion starts
 * gently rolling back, nudging the child to re-engage. `perTick` is how much of
 * the track it slips every tick — never a penalty, just a soft reminder.
 */
const CONFIG: Record<Exclude<CompanionSpeed, 'off'>, { delayMs: number; perTick: number }> = {
  slow: { delayMs: 25_000, perTick: 0.008 },
  medium: { delayMs: 15_000, perTick: 0.016 },
  fast: { delayMs: 8_000, perTick: 0.03 },
};
const TICK_MS = 600;
/**
 * How far the companion must drift back (fraction of the track) before it
 * counts as one discrete "retreat" — the trigger that extends the task queue
 * in dynamic mode (Tech Spec FR-GAME-02). Smaller = more forgiving.
 */
const RETREAT_STEP = 0.22;

/**
 * Returns a `rollback` amount (0..1) to subtract from the companion's position
 * when the child is idle, and `markActivity` to reset it. Speed comes from the
 * configurable companion setting. When the idle drift accumulates past each
 * `RETREAT_STEP`, `onRetreat` fires once so the session can append a task.
 */
export function useIdleRollback(resetKey: string | number, onRetreat?: () => void) {
  const speed = useGameStore((s) => s.settings.companionSpeed);
  const lastActivity = useRef(Date.now());
  const [rollback, setRollback] = useState(0);
  // Number of RETREAT_STEP boundaries already reported since the last activity.
  const firedChunks = useRef(0);
  // Keep the latest callback without re-arming the interval each render.
  const onRetreatRef = useRef(onRetreat);
  onRetreatRef.current = onRetreat;

  const markActivity = useCallback(() => {
    lastActivity.current = Date.now();
    firedChunks.current = 0;
    setRollback(0);
  }, []);

  // Fresh task → fresh start.
  useEffect(() => {
    markActivity();
  }, [resetKey, markActivity]);

  useEffect(() => {
    if (speed === 'off') {
      setRollback(0);
      return;
    }
    const cfg = CONFIG[speed];
    const id = window.setInterval(() => {
      if (Date.now() - lastActivity.current >= cfg.delayMs) {
        setRollback((r) => {
          const next = Math.min(1, r + cfg.perTick);
          const chunks = Math.floor(next / RETREAT_STEP);
          if (chunks > firedChunks.current) {
            firedChunks.current = chunks;
            onRetreatRef.current?.();
          }
          return next;
        });
      }
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [speed]);

  return { rollback, markActivity };
}
