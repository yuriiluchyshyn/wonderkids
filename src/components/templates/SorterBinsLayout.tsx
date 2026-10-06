import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useSound } from '@/core/audio/useSound';
import type { SorterBinsPayload } from '@/core/templates/types';
import { cn } from '@/core/utils/cn';
import { Bubble, CardFace, PULSE, SHAKE, SHAKE_TRANSITION, type LayoutProps } from './parts';
import { useDragDrop } from './useDragDrop';
import styles from './Templates.module.css';

/**
 * UI_SORTER_BINS — one object arrives on the conveyor; drag it (or tap it, then
 * a bin) into the right container. A wrong bin "says" a friendly line and
 * blows the object back; the helper makes the right bin glow.
 */
export function SorterBinsLayout({ payload, callbacks, hintActive }: LayoutProps<SorterBinsPayload>) {
  const { item, bins, correctBinId, wrongSay } = payload;
  const { playCode } = useSound();
  const [solved, setSolved] = useState(false);
  const [shake, setShake] = useState(false);
  const [say, setSay] = useState<string | null>(null);

  const onDrop = (_itemId: string, binId: string) => {
    if (solved) return;
    if (binId === correctBinId) {
      setSolved(true);
      setSay(null);
      playCode('SND_DROP_SLOT');
      callbacks.onSuccess();
      return;
    }
    setShake(true);
    setSay(wrongSay?.[binId] ?? 'Ой, сюди не підходить. Спробуй інше місце!');
    callbacks.onMistake();
  };
  const dnd = useDragDrop(onDrop, solved, item.id);

  return (
    <div className="stack">
      <div className={styles.conveyor}>
        <AnimatePresence>
          {!solved && (
            <motion.div
              className={styles.sortItemWrap}
              initial={{ x: -60, opacity: 0 }}
              animate={shake ? SHAKE : { x: 0, opacity: 1 }}
              exit={{ scale: 0, opacity: 0, y: 60 }}
              transition={shake ? SHAKE_TRANSITION : { type: 'spring', stiffness: 220, damping: 18 }}
              onAnimationComplete={() => setShake(false)}
            >
              <div
                className={cn(styles.sortItem, dnd.selected === item.id && styles.chipSelected)}
                style={dnd.styleFor(item.id)}
                {...dnd.bind(item.id)}
              >
                <CardFace card={item} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>{say && <Bubble>{say}</Bubble>}</AnimatePresence>
      </div>

      <div className={cn(styles.bins, bins.length > 3 && styles.bins4)}>
        {bins.map((bin) => (
          <motion.div
            key={bin.id}
            className={cn(
              styles.bin,
              solved && bin.id === correctBinId && styles.correct,
              hintActive && !solved && bin.id === correctBinId && styles.pulsing,
              dnd.over === bin.id && styles.dropOver,
            )}
            animate={solved && bin.id === correctBinId ? PULSE : { scale: 1 }}
            {...dnd.target(bin.id)}
          >
            <CardFace card={bin} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
