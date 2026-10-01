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
 * Returns a `rollback` amount (0..1) to subtract from the companion's position
 * when the child is idle, and `markActivity` to reset it. Speed comes from the
 * configurable companion setting.
 */
export function useIdleRollback(resetKey: string | number) {
  const speed = useGameStore((s) => s.settings.companionSpeed);
  const lastActivity = useRef(Date.now());
  const [rollback, setRollback] = useState(0);

  const markActivity = useCallback(() => {
    lastActivity.current = Date.now();
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
        setRollback((r) => Math.min(1, r + cfg.perTick));
      }
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [speed]);

  return { rollback, markActivity };
}
