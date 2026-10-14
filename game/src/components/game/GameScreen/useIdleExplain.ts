import { useEffect } from 'react';
import { helpOnIdle } from '@/core/game/hints/script';
import type { GameSession } from './types';

/** How long a task whose help may come on its own (`payload.help.after.idle`) waits for an answer before it does. */
const EXPLAIN_IDLE_MS = 20_000;

/**
 * A task that can explain itself (the clock) does so when the child stays
 * silent on it for a long while: a child who does not know how to read it
 * should not have to guess wrong twice to be shown.
 */
export function useIdleExplain(session: GameSession, paused: boolean) {
  const { explainForIdle } = session;
  const idleExplains = helpOnIdle(session.task?.payload);
  const off = paused || session.finished || session.justSolved || session.hintActive;
  useEffect(() => {
    if (!idleExplains || off) return;
    const timer = window.setTimeout(explainForIdle, EXPLAIN_IDLE_MS);
    return () => window.clearTimeout(timer);
  }, [session.index, idleExplains, off, explainForIdle]);
}
