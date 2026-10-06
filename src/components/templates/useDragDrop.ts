import { useCallback, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { useSound } from '@/core/audio/useSound';

/** Pixels a pointer must travel before a press becomes a drag. */
const DRAG_THRESHOLD = 8;

interface DragState {
  id: string;
  dx: number;
  dy: number;
}

/**
 * Touch-native drag-and-drop shared by every drag template, with a tap
 * fallback for small hands: a child can either DRAG a card onto a target, or
 * TAP the card (it lifts) and then TAP the target — or, when there is a single
 * card, just TAP the target. While dragging, the target under the finger is
 * reported as `over` so the layout can highlight it.
 *
 * Targets are any element carrying `data-drop="<targetId>"` (works for HTML
 * and SVG). Feedback follows PRD v4.0 §3.3: SND_DRAG_START + a 10% lift on
 * pick-up; the caller plays SND_DROP_SLOT when the drop is accepted.
 */
export function useDragDrop(
  onDrop: (itemId: string, targetId: string) => void,
  disabled = false,
  /**
   * When there is only one thing to place, pass its id: tapping a target then
   * answers straight away — no need to pick the item up first.
   */
  soleItem?: string,
) {
  const { playCode } = useSound();
  const [drag, setDrag] = useState<DragState | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  /** The target currently under the dragged card (highlighted until release). */
  const [over, setOver] = useState<string | null>(null);
  const origin = useRef<{ x: number; y: number; moved: boolean } | null>(null);

  const targetAt = (x: number, y: number, el: HTMLElement): string | null => {
    // Look "through" the dragged card to what lies beneath the finger.
    const prev = el.style.pointerEvents;
    el.style.pointerEvents = 'none';
    const under = document.elementFromPoint(x, y);
    el.style.pointerEvents = prev;
    return under?.closest<HTMLElement | SVGElement>('[data-drop]')?.dataset.drop ?? null;
  };

  const bind = useCallback(
    (id: string) => ({
      onPointerDown: (e: PointerEvent<HTMLElement>) => {
        if (disabled) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        origin.current = { x: e.clientX, y: e.clientY, moved: false };
        setDrag({ id, dx: 0, dy: 0 });
      },
      onPointerMove: (e: PointerEvent<HTMLElement>) => {
        const o = origin.current;
        if (!o) return;
        const dx = e.clientX - o.x;
        const dy = e.clientY - o.y;
        if (!o.moved && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
          o.moved = true;
          playCode('SND_DRAG_START');
        }
        if (o.moved) {
          setDrag({ id, dx, dy });
          // Light up what the card is hovering over; nothing is accepted
          // until the finger lifts.
          setOver(targetAt(e.clientX, e.clientY, e.currentTarget));
        }
      },
      onPointerUp: (e: PointerEvent<HTMLElement>) => {
        const o = origin.current;
        origin.current = null;
        setDrag(null);
        setOver(null);
        if (!o) return;
        if (!o.moved) {
          // A tap: lift the card and wait for a tap on a target.
          playCode('SND_DRAG_START');
          setSelected((s) => (s === id ? null : id));
          return;
        }
        const target = targetAt(e.clientX, e.clientY, e.currentTarget);
        setSelected(null);
        if (target) onDrop(id, target);
      },
      onPointerCancel: () => {
        origin.current = null;
        setDrag(null);
        setOver(null);
      },
    }),
    [disabled, onDrop, playCode],
  );

  /** Props for a drop target so the tap-then-tap path works too. */
  const target = useCallback(
    (targetId: string) => ({
      'data-drop': targetId,
      onClick: () => {
        const id = selected ?? soleItem;
        if (disabled || !id) return;
        setSelected(null);
        onDrop(id, targetId);
      },
    }),
    [disabled, selected, soleItem, onDrop],
  );

  /** Inline style for a draggable: follows the finger, lifted 10% with a shadow. */
  const styleFor = useCallback(
    (id: string): CSSProperties => {
      const dragging = drag?.id === id && (drag.dx !== 0 || drag.dy !== 0);
      const lifted = dragging || selected === id;
      return {
        touchAction: 'none',
        transform: dragging
          ? `translate(${drag.dx}px, ${drag.dy}px) scale(1.1)`
          : lifted
            ? 'scale(1.1)'
            : undefined,
        zIndex: lifted ? 20 : undefined,
        boxShadow: lifted ? 'var(--shadow-lg)' : undefined,
        transition: dragging ? 'none' : 'transform 0.18s var(--ease-bounce)',
        cursor: disabled ? 'default' : 'grab',
      };
    },
    [drag, selected, disabled],
  );

  return { bind, target, styleFor, selected, over, dragging: drag?.id ?? null };
}
