import { useCallback, useEffect, useRef, useState } from 'react';
import { api, type SessionView } from '@/core/api/client';
import { useAuthStore } from '@/core/auth/useAuthStore';
import { useGameStore } from '@/core/store/useGameStore';
import { computeScreenTime } from '@/core/time/screenTime';

/**
 * Non-aggressive screen-time engine (Tech Spec v2.1 FR-TIME, PRD v4.0 §2.2).
 *
 * The SERVER owns the play-time budget: entering a game calls
 * `POST /api/v1/session/start`, a heartbeat `PUT /api/v1/session/heartbeat`
 * goes out every 30 s while the child plays, and leaving sends a final "pause"
 * beat. Clearing storage, reloading or logging in elsewhere therefore cannot
 * refill the tank. The store keeps a local mirror purely to animate the themed
 * "fuel" gauge between beats — there is never a visible countdown (AC-2).
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
  /** Tell the server the session is over (after the bedtime hand-off). */
  endSession: () => void;
}

const TICK_MS = 1000;
const HEARTBEAT_MS = 30_000;

export function useScreenTime(active: boolean): ScreenTimeStatus {
  const timeControl = useGameStore((s) => s.settings.timeControl);
  const screenTime = useGameStore((s) => s.screenTime);
  const startPlaySession = useGameStore((s) => s.startPlaySession);
  const pausePlaySession = useGameStore((s) => s.pausePlaySession);
  const enterCooldown = useGameStore((s) => s.enterCooldown);
  const childId = useGameStore((s) => s.activeChildId);
  const token = useAuthStore((s) => s.token);

  const [now, setNow] = useState(() => Date.now());
  // Whether a play segment is currently open (visible tab, inside a game).
  const runningRef = useRef(false);

  const apply = useCallback(
    (view: SessionView) => {
      if (!childId) return;
      useGameStore.getState().applyServerScreenTime(childId, view, runningRef.current);
    },
    [childId],
  );

  // Count time ONLY while the child is actively in a game and the tab is
  // visible. A network hiccup never blocks play: the local clock keeps the
  // gauge honest until the next beat gets through.
  useEffect(() => {
    if (!active || !token || !childId) return;
    let alive = true;
    const guarded = (view: SessionView) => {
      if (alive) apply(view);
    };

    const resume = () => {
      runningRef.current = true;
      startPlaySession();
      api.sessionStart(token, childId).then(guarded).catch(() => {});
    };
    const pause = (keepalive = false) => {
      if (!runningRef.current) return;
      runningRef.current = false;
      pausePlaySession();
      api.sessionHeartbeat(token, childId, 'pause', keepalive).then(guarded).catch(() => {});
    };

    if (!document.hidden) resume();
    const beat = window.setInterval(() => {
      if (runningRef.current) api.sessionHeartbeat(token, childId).then(guarded).catch(() => {});
    }, HEARTBEAT_MS);

    const onVisibility = () => (document.hidden ? pause() : resume());
    const onPageHide = () => pause(true);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onPageHide);
    return () => {
      window.clearInterval(beat);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onPageHide);
      pause();
      alive = false;
    };
  }, [active, token, childId, apply, startPlaySession, pausePlaySession]);

  const endSession = useCallback(() => {
    runningRef.current = false;
    enterCooldown();
    if (token && childId) api.sessionHeartbeat(token, childId, 'depleted').then(apply).catch(() => {});
  }, [token, childId, enterCooldown, apply]);

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

  return { fuelPct, depleted, inCooldown, cooldownRemainingSec, ready: !inCooldown, endSession };
}
