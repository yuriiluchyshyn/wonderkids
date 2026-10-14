import { AnimatePresence, motion } from 'framer-motion';
import { written } from '@/core/language/marks';
import { cn } from '@/core/utils/cn';
import type { HintStage } from '@/components/hints/HintStage';
import styles from './BoardDock.module.css';

/**
 * The short fact a right answer brings, shown while it is said. Read part by
 * part (`payload.told`), the part being said stands out.
 */
export function OutroLine({ text, open, stage }: { text?: string; open: boolean; stage: HintStage }) {
  const parts = stage.play?.kind === 'told' ? stage.play.shown.beats : null;
  return (
    <AnimatePresence>
      {open && text && (
        <motion.p className={styles.outro} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          {parts
            ? parts.map((b, i) => (
                <span key={i} className={cn(stage.playing && i === stage.at && styles.outroNow)}>
                  {i > 0 ? ' ' : ''}
                  {written(b.text)}
                </span>
              ))
            : text}
        </motion.p>
      )}
    </AnimatePresence>
  );
}
