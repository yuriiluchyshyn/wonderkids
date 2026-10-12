import { createContext, useContext } from 'react';

/**
 * Whether the association pictures of the task on screen are hidden
 * (`core/game/cues`). The game shell provides it; `CardFace` reads it. So no
 * layout needs to pass it on: a card marked `cue` hides its picture wherever
 * it is drawn.
 */
const CuesHiddenContext = createContext(false);

export const CuesHiddenProvider = CuesHiddenContext.Provider;

export function useCuesHidden(): boolean {
  return useContext(CuesHiddenContext);
}
