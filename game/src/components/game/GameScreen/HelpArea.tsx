import { useT } from '@/core/translator';
import { AnimatePresence, motion } from 'framer-motion';
import type { CSSProperties, ReactNode, RefObject } from 'react';
import { VoiceToggle } from '@/components/ui/VoiceToggle';
import styles from './BoardDock.module.css';

/**
 * The help under the board, when there is help to show: its label and the
 * hint voice's own switch, the help itself (`children`), and a way back up to
 * the answers for a child who scrolled down to it.
 */
export function HelpArea({ open, helperRef, attentionRef, onBack, children }: { open: boolean; helperRef: RefObject<HTMLDivElement>; attentionRef: RefObject<HTMLDivElement>; onBack: () => void; children: ReactNode }) {
  const t = useT();
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={helperRef}
          className={styles.help}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className={styles.hintBar}>
            <span className={styles.hintBarLabel}>{t('game.hint.label')}</span>
            <span className={styles.hintBarTools}>
              <button className={styles.jumpUp} aria-label={t('game.hint.back')} onClick={onBack}>
                <span className="loop-bob" style={{ '--loop': '1s', '--loop-y': '-4px' } as CSSProperties}>
                  ⬆️
                </span>
              </button>
              <VoiceToggle channel="hint" />
            </span>
          </div>
          {/* Nudged when the board is tapped while the help is being said: «look here». */}
          <div ref={attentionRef}>{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
