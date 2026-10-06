import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import type { GameViewProps } from '@/core/kernel/types';
import { cardSpeech, glyphSpeech, type Card, type Glyph, type TemplatePayload } from '@/core/templates/types';
import { useShowText } from '@/core/ui/useUiPrefs';
import { cn } from '@/core/utils/cn';
import { SpeakButton } from './SpeakButton';
import styles from './Templates.module.css';

/** Props every template layout receives. */
export type LayoutProps<P extends TemplatePayload> = GameViewProps<P> & { payload: P };

/** UI Shake 300ms (PRD v4.0 §3.3 SND_ERROR). */
export const SHAKE = { x: [0, -9, 9, -6, 6, 0] };
export const SHAKE_TRANSITION = { duration: 0.3 };
/** Pulse on an accepted drop (§3.3 SND_DROP_SLOT). */
export const PULSE = { scale: [1, 1.14, 1] };

/** A math line: numbers/operators as text, fractions stacked vertically. */
export function Glyphs({ glyphs, className }: { glyphs: Glyph[]; className?: string }) {
  return (
    <span className={cn(styles.glyphs, className)} aria-label={glyphs.map(glyphSpeech).join(' ')}>
      {glyphs.map((g, i) =>
        typeof g === 'string' ? (
          <span key={i} aria-hidden>
            {g}
          </span>
        ) : (
          <span key={i} className={styles.frac} aria-hidden>
            <span>{g.n}</span>
            <span className={styles.fracBar} />
            <span>{g.d}</span>
          </span>
        ),
      )}
    </span>
  );
}

/** The face of a card: pictogram, then math or a label with its speaker. */
export function CardFace({ card, speaker = true }: { card: Card; speaker?: boolean }) {
  const showText = useShowText();
  // Text is the only face of some cards — never hide it then.
  const label = card.label && (showText || !card.emoji) ? card.label : null;
  return (
    <span className={styles.face}>
      {card.emoji && (
        <span className={cn(styles.faceEmoji, 'emoji')} aria-hidden>
          {card.emoji}
        </span>
      )}
      {card.glyphs && <Glyphs glyphs={card.glyphs} />}
      {card.shape && (
        <span
          className={styles.shapeGrid}
          style={{ gridTemplateColumns: `repeat(${card.shape.cols}, 1fr)` }}
          aria-hidden
        >
          {Array.from({ length: card.shape.cols * card.shape.rows }, (_, i) => (
            <span key={i} className={cn(styles.shapeCell, card.shape?.cells.includes(i) && styles.shapeCellOn)} />
          ))}
        </span>
      )}
      {label && <span className={styles.faceLabel}>{label}</span>}
      {speaker && (card.label || card.speak) && <SpeakButton text={cardSpeech(card)} className={styles.faceSpeak} />}
    </span>
  );
}

/** Picture / math line above the answers; tapping it replays the prompt. */
export function Stimulus({
  payload,
  onSpeak,
  children,
}: {
  payload: TemplatePayload;
  onSpeak: () => void;
  children?: ReactNode;
}) {
  const s = payload.stimulus;
  if (!s && !children) return null;
  return (
    <motion.button
      type="button"
      className={styles.stimulus}
      onClick={onSpeak}
      aria-label="Повторити завдання"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    >
      {s?.emoji && (
        <span className={cn(styles.stimulusEmoji, 'emoji')} aria-hidden>
          {s.emoji}
        </span>
      )}
      {s?.glyphs && <Glyphs glyphs={s.glyphs} className={styles.stimulusGlyphs} />}
      {s?.caption && <span className={styles.stimulusCaption}>{s.caption}</span>}
      {children}
    </motion.button>
  );
}

/** A friendly speech bubble for in-game nudges (never the word "wrong"). */
export function Bubble({ children }: { children: ReactNode }) {
  return (
    <motion.div
      className={styles.bubble}
      initial={{ opacity: 0, y: 6, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0 }}
    >
      {children}
    </motion.div>
  );
}
