import { createContext, useContext, useEffect } from 'react';

/**
 * A board opened something the child reads (a lesson): nothing may drift
 * meanwhile. The game shell provides the setter and pauses the idle roll-back
 * and the idle explanation while it is set. Without a shell it does nothing.
 */
const PauseContext = createContext<(paused: boolean) => void>(() => {});

export const PauseProvider = PauseContext.Provider;

/** Holds the game still while `paused` is true (and lets go on unmount). */
export function usePauseWhile(paused: boolean): void {
  const setPaused = useContext(PauseContext);
  useEffect(() => {
    if (!paused) return;
    setPaused(true);
    return () => setPaused(false);
  }, [paused, setPaused]);
}
