import { useEffect, useState } from 'react';
import { useGameStore } from '@/core/store/useGameStore';

/**
 * Non-aggressive screen-time engine (Tech Spec v2.1 FR-TIME). Translates the
 * parent-set limits + persisted session bookkeeping into a themed "fuel" level
 * the child sees — there is never a visible countdown clock (AC-2).
 *
 *   Fuel(%) = 100 × (1 − t_active / sessionDuration)
 *
 * The daily cap drains the same gauge, so whichever limit is closer wins. The
 * session start is persisted, so a page reload cannot top up the tank or dodge
 * a cooldown.
 */
export interface ScreenTimeStatus {
  /** Remaining session fuel, 0..100, recomputed every second. */
  fuelPct: number;
  /** True the moment the tank hits empty (session or daily limit reached). */
  depleted: boolean;
  /** True while the rest cooldown is still counting down. */
  inCooldown: boolean;
  /** Seconds left until the transport can be refuelled (play resumes). */
  cooldownRemainingSec: number;
  /** Convenience: play is allowed right now (not resting). */
  ready: boolean;
}

const TICK_MS = 1000;

export function useScreenTime(active: boolean): ScreenTimeStatus {
  const timeControl = useGameStore((s) => s.settings.timeControl);
  const screenTime = useGameStore((s) => s.screenTime);
  const startPlaySession = useGameStore((s) => s.startPlaySession);

  const [now, setNow] = useState(() => Date.now());

  // Begin (or resume) the session as soon as play starts — no-op during a
  // cooldown or when a session is already running.
  useEffect(() => {
    if (active) startPlaySession();
  }, [active, startPlaySession]);

  // Re-evaluate fuel / cooldown once a second.
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  const sessionMs = Math.max(1, timeControl.sessionDurationMinutes) * 60_000;
  const start = screenTime.sessionStartedAt;
  const elapsedMs = start ? Math.max(0, now - start) : 0;
  const elapsedMin = elapsedMs / 60_000;

  // Session fuel from elapsed active time.
  const sessionFuel = start ? Math.max(0, 1 - elapsedMs / sessionMs) : 1;

  // Daily cap, expressed on the same gauge: if less than one session's worth of
  // daily time remains, the tank starts partly empty.
  const dailyUsed = screenTime.minutesUsedToday + elapsedMin;
  const dailyRemainingMin = Math.max(0, timeControl.maxDailyMinutes - dailyUsed);
  const dailyFuel =
    timeControl.maxDailyMinutes > 0
      ? Math.max(0, Math.min(1, dailyRemainingMin / Math.max(1, timeControl.sessionDurationMinutes)))
      : 1;

  const fuel = Math.min(sessionFuel, dailyFuel);
  const fuelPct = Math.round(fuel * 100);

  const cooldownUntil = screenTime.cooldownUntil;
  const inCooldown = cooldownUntil != null && now < cooldownUntil;
  const cooldownRemainingSec = inCooldown ? Math.ceil((cooldownUntil! - now) / 1000) : 0;

  // Only "depleted" while actively playing a live session that just ran dry.
  const depleted = active && !inCooldown && start != null && fuelPct <= 0;

  return { fuelPct, depleted, inCooldown, cooldownRemainingSec, ready: !inCooldown };
}
