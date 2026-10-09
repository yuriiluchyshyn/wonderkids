import { useRef, type PointerEvent as ReactPointerEvent } from 'react';

interface Gestures {
  /** One finger moved by this many pixels. */
  onDrag: (dx: number, dy: number) => void;
  /** Two fingers spread (`factor` > 1) or closed around a point of the element. */
  onPinch: (factor: number, x: number, y: number) => void;
  /** A finger touched down — e.g. to stop a glide in progress. */
  onStart?: () => void;
}

/**
 * One finger drags, two fingers pinch. Spread the returned handlers on the
 * element; `wasDrag()` tells a button inside it that the touch which just
 * ended moved things and must not also press it.
 */
export function useGestures({ onDrag, onPinch, onStart }: Gestures) {
  const fingers = useRef(new Map<number, { x: number; y: number }>());
  const moved = useRef(false);
  const span = useRef(0);

  const distance = () => {
    const [a, b] = [...fingers.current.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };

  const onPointerDown = (e: ReactPointerEvent) => {
    if (fingers.current.size === 0) moved.current = false;
    fingers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (fingers.current.size === 2) span.current = distance();
    onStart?.();
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    const finger = fingers.current.get(e.pointerId);
    if (!finger) return;
    const dx = e.clientX - finger.x;
    const dy = e.clientY - finger.y;
    if (fingers.current.size === 1) {
      if (!moved.current && Math.hypot(dx, dy) < 6) return;
      moved.current = true;
      finger.x = e.clientX;
      finger.y = e.clientY;
      onDrag(dx, dy);
      return;
    }
    finger.x = e.clientX;
    finger.y = e.clientY;
    if (fingers.current.size !== 2) return;
    moved.current = true;
    const now = distance();
    if (span.current > 0 && now > 0) {
      const [a, b] = [...fingers.current.values()];
      const box = e.currentTarget.getBoundingClientRect();
      onPinch(now / span.current, (a.x + b.x) / 2 - box.left, (a.y + b.y) / 2 - box.top);
    }
    span.current = now;
  };

  const onPointerUp = (e: ReactPointerEvent) => {
    fingers.current.delete(e.pointerId);
    // The click of this touch comes right after: let it still see `moved`.
    if (fingers.current.size === 0) window.setTimeout(() => fingers.current.size === 0 && (moved.current = false), 0);
  };

  return {
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp, onPointerLeave: onPointerUp },
    wasDrag: () => moved.current,
  };
}
