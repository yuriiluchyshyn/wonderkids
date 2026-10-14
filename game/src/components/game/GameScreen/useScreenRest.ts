import { useCallback, useEffect, useState } from 'react';
import { voice } from '@/core/audio/voice';
import { useGameStore } from '@/core/child/store/useGameStore';
import { useScreenTime } from '../useScreenTime';
import type { GameSession, Phase } from './types';

/**
 * Screen time (Tech Spec FR-TIME): the tank of play time, and the rest that
 * follows it. A level in progress is never interrupted — out of time takes
 * effect once the child has finished the level they are on and seen its
 * reward (`useRestAfterLevel`); but a NEW level never starts on an empty tank.
 */
export function useScreenRest({ phase, session, onPlayAgain }: { phase: Phase; session: GameSession; onPlayAgain: () => void }) {
  const startPlaySession = useGameStore((s) => s.startPlaySession);
  const screen = useScreenTime(phase === 'play');
  // `armed` = the tank ran dry (wait for a safe moment); `open` = the cutscene is showing.
  const [armed, setArmed] = useState(false);
  const [open, setOpen] = useState(false);

  const { endSession } = screen;
  const openRest = useCallback(() => {
    setOpen(true);
    // Ends the session locally and on the server (which starts the cooldown).
    endSession();
    voice.stop();
  }, [endSession]);

  const resume = useCallback(() => {
    setArmed(false);
    setOpen(false);
    startPlaySession();
    onPlayAgain();
  }, [startPlaySession, onPlayAgain]);

  const midLevel = phase === 'play' && !session.finished && session.solvedCount + session.index > 0;
  // The gauge is empty and the rest has not started yet. Read from the gauge itself, not from
  // "a session is running": the daily limit empties it too. Only once the server has confirmed it.
  const outOfTime = screen.synced && screen.fuelPct <= 0 && !screen.inCooldown;
  // True while the rest screen covers the game: nothing may speak or run under it.
  const blocked = open || (screen.inCooldown && !midLevel);

  useEffect(() => {
    if (blocked) voice.stop();
  }, [blocked]);

  // Arm the cutscene the moment the tank runs dry during play.
  useEffect(() => {
    if (phase === 'play' && outOfTime && !armed) setArmed(true);
  }, [outOfTime, phase, armed]);

  // …but a new level never starts on an empty tank: «Наступний рівень!», «Ще раз!» or coming
  // back would otherwise open a fresh level that is again "in progress", and play would go on for ever.
  useEffect(() => {
    if (outOfTime && !midLevel && !session.finished && !open) openRest();
  }, [outOfTime, midLevel, session.finished, open, openRest]);

  return { screen, blocked, armed, open, openRest, resume };
}

/** Once the level is over and its reward seen and heard, an armed rest begins. */
export function useRestAfterLevel(rest: ReturnType<typeof useScreenRest>, levelSeen: boolean) {
  const { armed, open, openRest } = rest;
  useEffect(() => {
    if (!armed || open || !levelSeen) return;
    const t = window.setTimeout(openRest, 3200);
    return () => window.clearTimeout(t);
  }, [armed, open, levelSeen, openRest]);
}
