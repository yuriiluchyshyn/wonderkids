import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSound } from '@/core/audio/useSound';
import type { DragMatchPayload } from '@/core/templates/types';
import { isMatchComplete } from '@/core/templates/validate';
import { cn } from '@/core/utils/cn';
import { CardFace, PULSE, SHAKE, SHAKE_TRANSITION, Stimulus, type LayoutProps } from './parts';
import { useDragDrop } from './useDragDrop';
import styles from './Templates.module.css';

/**
 * UI_DRAG_MATCH — drag each item from the top tray onto its slot below (or tap
 * the item, then the slot). A wrong drop sends the card gently back; the
 * helper makes the right slot for the next card pulse.
 */
export function DragMatchLayout({ payload, callbacks, hintActive }: LayoutProps<DragMatchPayload>) {
  const { items, slots, pairs } = payload;
  const { playCode } = useSound();
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [shake, setShake] = useState<string | null>(null);
  const [pulse, setPulse] = useState<string | null>(null);

  const done = isMatchComplete(pairs, placed);
  const waiting = items.filter((item) => !placed[item.id]);
  const hintSlot = hintActive && waiting[0] ? pairs[waiting[0].id] : null;

  const onDrop = (itemId: string, slotId: string) => {
    if (done || placed[itemId]) return;
    if (pairs[itemId] !== slotId) {
      setShake(itemId);
      callbacks.onMistake();
      return;
    }
    const next = { ...placed, [itemId]: slotId };
    setPlaced(next);
    setPulse(slotId);
    playCode('SND_DROP_SLOT');
    if (isMatchComplete(pairs, next)) callbacks.onSuccess();
  };

  const dnd = useDragDrop(onDrop, done);

  return (
    <div className="stack">
      <Stimulus payload={payload} onSpeak={callbacks.speakPrompt} />

      <div className={styles.tray}>
        {waiting.map((item) => (
          <motion.div
            key={item.id}
            className={cn(styles.chip, dnd.selected === item.id && styles.chipSelected)}
            animate={shake === item.id ? SHAKE : { x: 0 }}
            transition={SHAKE_TRANSITION}
            onAnimationComplete={() => shake === item.id && setShake(null)}
          >
            <div className={styles.chipInner} style={dnd.styleFor(item.id)} {...dnd.bind(item.id)}>
              <CardFace card={item} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className={styles.slots}>
        {slots.map((slot) => {
          const here = items.filter((item) => placed[item.id] === slot.id);
          return (
            <motion.div
              key={slot.id}
              className={cn(
                styles.slot,
                here.length > 0 && styles.slotFilled,
                hintSlot === slot.id && styles.pulsing,
                dnd.over === slot.id && styles.dropOver,
              )}
              animate={pulse === slot.id ? PULSE : { scale: 1 }}
              onAnimationComplete={() => pulse === slot.id && setPulse(null)}
              {...dnd.target(slot.id)}
            >
              <CardFace card={slot} />
              {here.length > 0 && (
                <div className={styles.slotPlaced}>
                  {here.map((item) => (
                    <span key={item.id} className={styles.placedMini}>
                      <CardFace card={item} speaker={false} />
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
