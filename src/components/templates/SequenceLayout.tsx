import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSound } from '@/core/audio/useSound';
import type { SequencePayload } from '@/core/game/templates/types';
import { correctPositions, isSequenceCorrect } from '@/core/game/templates/validate';
import { cn } from '@/core/utils/cn';
import { Button } from '@/components/ui/Button';
import { CardFace, SHAKE, SHAKE_TRANSITION, Stimulus, type LayoutProps } from './parts';
import { useDragDrop } from './useDragDrop';
import styles from './Templates.module.css';

/**
 * UI_CHRONO_SEQUENCE — arrange the cards in order by dragging one onto another
 * (or tapping two) to swap them, then confirm.
 * Helper: the cards already in the right place light up green, and a task that
 * brings a `guide` shows the whole row its cards belong to — there too the
 * ones the child has already put right are lit.
 */
export function SequenceLayout({ payload, callbacks, hintActive }: LayoutProps<SequencePayload>) {
  const { cards, initial, orientation } = payload;
  const { playCode } = useSound();
  const correct = cards.map((c) => c.id);
  const [order, setOrder] = useState<string[]>(initial);
  const [solved, setSolved] = useState(false);
  const [shake, setShake] = useState(false);

  const swap = (a: string, b: string) => {
    if (solved || a === b) return;
    playCode('SND_DROP_SLOT');
    setOrder((o) => o.map((id) => (id === a ? b : id === b ? a : id)));
  };
  const dnd = useDragDrop(swap, solved);

  const check = () => {
    if (solved) return;
    if (isSequenceCorrect(correct, order)) {
      setSolved(true);
      callbacks.onSuccess();
    } else {
      setShake(true);
      callbacks.onMistake();
    }
  };

  const right = correctPositions(correct, order);

  return (
    <div className="stack">
      <Stimulus payload={payload} onSpeak={callbacks.speakPrompt} />
      <motion.div
        className={cn(styles.sequence, orientation === 'vertical' && styles.sequenceVertical)}
        animate={shake ? SHAKE : { x: 0 }}
        transition={SHAKE_TRANSITION}
        onAnimationComplete={() => setShake(false)}
      >
        {order.map((id, i) => {
          const card = cards[correct.indexOf(id)];
          // Once solved, the line is painted from "ancient" amber to "future" blue.
          const rank = correct.indexOf(id) / Math.max(1, cards.length - 1);
          const tint = solved ? `hsl(${35 + rank * 185} 85% 88%)` : undefined;
          return (
            <div key={id} className={cn(styles.seqCell, dnd.over === id && styles.seqOver)} {...dnd.target(id)}>
              <span className={styles.seqIndex} aria-hidden>
                {i + 1}
              </span>
              {/* The ends of the line are labelled, so "in order" is unambiguous. */}
              {i === 0 && <span className={styles.seqEnd}>{payload.ends?.[0] ?? 'найдавніше'}</span>}
              {i === order.length - 1 && <span className={styles.seqEnd}>{payload.ends?.[1] ?? 'найновіше'}</span>}
              <div
                className={cn(
                  styles.seqCard,
                  dnd.selected === id && styles.chipSelected,
                  (solved || hintActive) && right[i] && styles.seqRight,
                  tint && styles.seqTinted,
                )}
                style={{ ...dnd.styleFor(id), background: tint }}
                {...dnd.bind(id)}
              >
                <CardFace card={card} />
              </div>
            </div>
          );
        })}
      </motion.div>
      {/* The whole row these cards belong to — the help for a child who is stuck. */}
      {hintActive && !solved && payload.guide && (
        <div className={styles.seqGuide} aria-label="Підказка: уся послідовність по порядку">
          {payload.guide.map((item, i) => (
            <span key={item.id} className={cn(styles.seqGuideItem, order.includes(item.id) && styles.seqGuideOurs, right[order.indexOf(item.id)] && styles.seqGuideRight)}>
              {i > 0 && (
                <span className={styles.seqGuideArrow} aria-hidden>
                  ›
                </span>
              )}
              <span className={styles.seqGuideFace}>
                <CardFace card={{ ...item, label: undefined }} speaker={false} />
              </span>
              <small>{item.label}</small>
            </span>
          ))}
        </div>
      )}
      <Button size="lg" icon="✅" block onClick={check} ariaLabel="Перевірити порядок">
        Готово!
      </Button>
    </div>
  );
}
