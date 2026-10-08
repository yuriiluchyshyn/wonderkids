import { motion } from 'framer-motion';
import { useMemo, useState, type CSSProperties } from 'react';
import { useSound } from '@/core/audio/useSound';
import type { LetterGridPayload } from '@/core/game/templates/types';
import { isLetterPlace, withSwap } from '@/core/game/templates/validate';
import { shuffle } from '@/core/utils/random';
import { cn } from '@/core/utils/cn';
import { PULSE, SHAKE, SHAKE_TRANSITION, type LayoutProps } from './parts';
import { useDragDrop } from './useDragDrop';
import styles from './Templates.module.css';

/** From this many letters on the tray uses smaller tiles, so table and tray fit one screen. */
const DENSE_TRAY = 13;

/**
 * Letter table — a run of the alphabet in rows. With gaps: drag each letter
 * from the tray into its empty cell (or tap the letter, then the cell); a
 * wrong drop sends it gently back. With two letters swapped: tap one of them.
 * Helper: the place of the next letter pulses and every empty cell shows a
 * pale copy of its letter; in "find the mistake" the two swapped cells pulse.
 */
export function LetterGridLayout({ payload, callbacks, hintActive }: LayoutProps<LetterGridPayload>) {
  const { cols, cells, gaps, swapped } = payload;
  const { playCode } = useSound();
  const order = cells.map((c) => c.id);
  const tray = useMemo(() => shuffle(gaps.map((i) => cells[i])), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [placed, setPlaced] = useState<number[]>([]);
  const [shake, setShake] = useState<string | null>(null);
  const [pulse, setPulse] = useState<number | null>(null);
  const [found, setFound] = useState(false);

  const done = swapped ? found : placed.length === gaps.length;
  const waiting = tray.filter((card) => !placed.includes(order.indexOf(card.id)));
  const hintCell = hintActive && waiting[0] ? order.indexOf(waiting[0].id) : null;
  const ghosts = payload.ghosts || hintActive;

  const onDrop = (itemId: string, target: string) => {
    const index = Number(target);
    if (done || placed.includes(index)) return;
    if (!isLetterPlace(order, itemId, index)) {
      setShake(itemId);
      callbacks.onMistake();
      return;
    }
    const next = [...placed, index];
    setPlaced(next);
    setPulse(index);
    playCode('SND_DROP_SLOT');
    if (next.length === gaps.length) callbacks.onSuccess();
  };

  const dnd = useDragDrop(onDrop, done, waiting.length === 1 ? waiting[0].id : undefined);

  // "Find the mistake": once found, the two letters go back to their places.
  const shown = withSwap(cells, found ? undefined : swapped);
  const tapSwapped = (index: number) => {
    if (!swapped || found) return;
    if (!swapped.includes(index)) {
      setShake(shown[index].id);
      callbacks.onMistake();
      return;
    }
    setFound(true);
    callbacks.onSuccess();
  };

  return (
    <div className="stack">
      <div className={styles.letterGrid} style={{ '--cols': cols } as CSSProperties}>
        {shown.map((card, index) => {
          if (swapped) {
            const here = swapped.includes(index);
            return (
              <motion.button
                key={index}
                type="button"
                className={cn(styles.letterCell, styles.letterTap, here && found && styles.letterPlaced, here && hintActive && !found && styles.pulsing)}
                animate={shake === card.id ? SHAKE : here && found ? PULSE : { x: 0, scale: 1 }}
                transition={SHAKE_TRANSITION}
                onAnimationComplete={() => shake === card.id && setShake(null)}
                onClick={() => tapSwapped(index)}
                aria-label={card.speak ?? card.label}
              >
                {card.label}
              </motion.button>
            );
          }
          const gap = gaps.includes(index);
          const filled = placed.includes(index);
          if (!gap || filled) {
            return (
              <motion.span
                key={index}
                className={cn(styles.letterCell, filled && styles.letterPlaced)}
                animate={pulse === index ? PULSE : { scale: 1 }}
                onAnimationComplete={() => pulse === index && setPulse(null)}
              >
                {card.label}
              </motion.span>
            );
          }
          return (
            <span
              key={index}
              className={cn(styles.letterCell, styles.letterGap, hintCell === index && styles.pulsing, dnd.over === String(index) && styles.dropOver)}
              {...dnd.target(String(index))}
            >
              {ghosts && <span className={styles.letterGhost}>{card.label}</span>}
            </span>
          );
        })}
      </div>

      {!swapped && (
        <div className={cn(styles.letterTray, tray.length >= DENSE_TRAY && styles.letterTrayDense)}>
          {waiting.map((card) => (
            <motion.div
              key={card.id}
              className={styles.chip}
              animate={shake === card.id ? SHAKE : { x: 0 }}
              transition={SHAKE_TRANSITION}
              onAnimationComplete={() => shake === card.id && setShake(null)}
            >
              <div className={cn(styles.letterChip, dnd.selected === card.id && styles.chipSelected)} style={dnd.styleFor(card.id)} {...dnd.bind(card.id)}>
                {card.label}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
