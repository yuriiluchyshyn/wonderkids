import { useEffect, useState } from 'react';
import { useGameStore, type ScreenTimeState, type TimeControl } from '@/core/child/store/useGameStore';

/**
 * Pure screen-time maths shared by the in-game fuel engine and the always-on
 * time header (Tech Spec v2.1 FR-TIME). Translates the parent-set limits +
 * persisted session bookkeeping into a 0..100 "fuel" level — there is never a
 * visible countdown clock (AC-2).
 *
 *   Fuel(%) = 100 × (1 − t_active / sessionDuration)
 *
 * The daily cap drains the same gauge, so whichever limit is closer wins. The
 * session start is persisted, so a page reload cannot top up the tank or dodge
 * a cooldown.
 */
export interface ScreenTimeComputed {
  /** Remaining fuel, 0..100. */
  fuelPct: number;
  /** True while the rest cooldown is still counting down. */
  inCooldown: boolean;
  /** Seconds left until play can resume. */
  cooldownRemainingSec: number;
  /** A live play session is currently running. */
  sessionActive: boolean;
}

export function computeScreenTime(
  timeControl: TimeControl,
  screenTime: ScreenTimeState,
  now: number,
): ScreenTimeComputed {
  const sessionMs = Math.max(1, timeControl.sessionDurationMinutes) * 60_000;
  const start = screenTime.sessionStartedAt;
  // Only the live running segment advances; `sessionElapsedMs` is time banked
  // from earlier segments. Together they are the real active play time — never
  // wall-clock time while the browser merely sits open.
  const runningMs = start ? Math.max(0, now - start) : 0;
  const sessionUsedMs = Math.max(0, screenTime.sessionElapsedMs ?? 0) + runningMs;
  const sessionUsedMin = sessionUsedMs / 60_000;

  // Session fuel from active play time only.
  const sessionFuel = Math.max(0, 1 - sessionUsedMs / sessionMs);

  // Daily cap, expressed on the same gauge: if less than one session's worth of
  // daily time remains, the tank starts partly empty.
  const dailyUsed = screenTime.minutesUsedToday + sessionUsedMin;
  const dailyRemainingMin = Math.max(0, timeControl.maxDailyMinutes - dailyUsed);
  const dailyFuel =
    timeControl.maxDailyMinutes > 0
      ? Math.max(0, Math.min(1, dailyRemainingMin / Math.max(1, timeControl.sessionDurationMinutes)))
      : 1;

  const fuel = Math.min(sessionFuel, dailyFuel);
  const fuelPct = Math.round(fuel * 100);

  const cooldownUntil = screenTime.cooldownUntil;
  const inCooldown = cooldownUntil != null && now < cooldownUntil;
  const cooldownRemainingSec = inCooldown ? Math.ceil((cooldownUntil - now) / 1000) : 0;

  // A session is "live" if a segment is running or time is already banked.
  const sessionActive = start != null || sessionUsedMs > 0;

  return { fuelPct, inCooldown, cooldownRemainingSec, sessionActive };
}

const TICK_MS = 1000;

/**
 * Read-only live view of the active child's play-time budget. Unlike
 * `useScreenTime`, this never starts a session — it just reflects the current
 * fuel so an always-visible header / drawer can show the themed timeline
 * everywhere, even outside the game.
 */
export function useTimeBudget(): ScreenTimeComputed {
  const timeControl = useGameStore((s) => s.settings.timeControl);
  const screenTime = useGameStore((s) => s.screenTime);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  return computeScreenTime(timeControl, screenTime, now);
}
