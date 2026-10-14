import type { KeyboardEvent, PointerEvent, ReactNode, SyntheticEvent } from 'react';

/**
 * The board, held still while a help is being said: there is nothing to guess
 * at yet. A tap on it then is caught before any answer sees it (in the capture
 * phase — every board starts its actions from a press or a click), and handed
 * to `onHeldTap` instead.
 */
export function HeldBoard({ held, onHeldTap, children }: { held: boolean; onHeldTap: () => void; children: ReactNode }) {
  const stop = (e: SyntheticEvent) => {
    if (!held) return;
    e.preventDefault();
    e.stopPropagation();
  };
  return (
    <div
      aria-busy={held}
      onPointerDownCapture={(e: PointerEvent) => {
        if (!held) return;
        stop(e);
        onHeldTap();
      }}
      onClickCapture={stop}
      onKeyDownCapture={(e: KeyboardEvent) => {
        if (!held || (e.key !== 'Enter' && e.key !== ' ')) return;
        stop(e);
        onHeldTap();
      }}
    >
      {children}
    </div>
  );
}
