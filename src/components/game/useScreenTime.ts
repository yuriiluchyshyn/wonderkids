import { useEffect, useState } from 'react';
import { useGameStore } from '@/core/store/useGameStore';
import { computeScreenTime } from '@/core/time/screenTime';

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
  const pausePlaySession = useGameStore((s) => s.pausePlaySession);

  const [now, setNow] = useState(() => Date.now());

  // Count time ONLY while the child is actively in a game and the tab is
  // visible. Resume on entering play / returning to the tab; pause (banking the
  // elapsed segment) when the tab is backgrounded or the game screen is left —
  // so an open-but-idle browser never burns play time.
  useEffect(() => {
    if (!active) return;
    if (!document.hidden) startPlaySession();
    const onVisibility = () => {
      if (document.hidden) pausePlaySession();
      else startPlaySession();
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', pausePlaySession);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', pausePlaySession);
      pausePlaySession();
    };
  }, [active, startPlaySession, pausePlaySession]);

  // Re-evaluate fuel / cooldown once a second.
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  const { fuelPct, inCooldown, cooldownRemainingSec, sessionActive } = computeScreenTime(
    timeControl,
    screenTime,
    now,
  );

  // Only "depleted" while actively playing a live session that just ran dry.
  const depleted = active && !inCooldown && sessionActive && fuelPct <= 0;

  return { fuelPct, depleted, inCooldown, cooldownRemainingSec, ready: !inCooldown };
}
