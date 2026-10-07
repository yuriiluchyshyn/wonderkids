import { motion } from 'framer-motion';
import { useState, type CSSProperties, type ReactNode } from 'react';
import type { GameViewProps } from '@/core/game/kernel/types';
import { cardSpeech, glyphSpeech, type Card, type Glyph, type TemplatePayload } from '@/core/game/templates/types';
import { useShowText } from '@/core/app/ui/useUiPrefs';
import { cn } from '@/core/utils/cn';
import { LandmarkArt, hasLandmarkArt } from './LandmarkArt';
import { ClockFace } from './ClockFace';
import { PieFood } from './PieFood';
import { PieceShape } from './TangramLayout';
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
        ) : 'text' in g ? (
          <span key={i} className={g.tone === 'a' ? styles.toneA : styles.toneB} aria-hidden>
            {g.text}
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

/** A real picture (a portrait); the pictogram takes over if the file does not load. */
function Picture({ src, emoji, className }: { src: string; emoji?: string; className?: string }) {
  const [broken, setBroken] = useState(false);
  if (broken) {
    return emoji ? (
      <span className={cn(styles.faceEmoji, 'emoji')} aria-hidden>
        {emoji}
      </span>
    ) : null;
  }
  return <img className={cn(styles.picture, className)} src={src} alt="" loading="lazy" decoding="async" draggable={false} onError={() => setBroken(true)} />;
}

/** The face of a card: pictogram, then math or a label with its speaker. */
export function CardFace({ card, speaker = true }: { card: Card; speaker?: boolean }) {
  const showText = useShowText();
  // Text is the only face of some cards — never hide it then.
  const label = card.label && (showText || !card.emoji) ? card.label : null;
  return (
    <span className={styles.face}>
      {card.image && <Picture src={card.image} emoji={card.emoji} />}
      {card.emoji && !card.image && (
        <span
          className={cn(styles.faceEmoji, 'emoji', card.silhouette && styles.silhouette)}
          style={card.silhouette && card.blur ? ({ '--shadow-blur': `${card.blur}px` } as CSSProperties) : undefined}
          aria-hidden
        >
          {card.emoji}
        </span>
      )}
      {card.glyphs && <Glyphs glyphs={card.glyphs} />}
      {card.clock && <ClockFace time={card.clock} className={styles.faceClock} />}
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
      {speaker && (card.label || card.speak) && <SpeakButton text={cardSpeech(card)} className={styles.faceSpeak} lang={card.lang} />}
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
      {s?.image ? (
        <Picture src={s.image} emoji={s.emoji} className={styles.pictureBig} />
      ) : s?.art && hasLandmarkArt(s.art) ? (
        <LandmarkArt id={s.art} label={s.caption} />
      ) : (
        s?.emoji && (
          <span className={cn(styles.stimulusEmoji, 'emoji')} aria-hidden>
            {s.emoji}
          </span>
        )
      )}
      {s?.pie && <PieFood {...s.pie} />}
      {s?.clock && <ClockFace time={s.clock} className={styles.stimulusClock} />}
      {s?.shape && (
        <span
          className={cn(styles.shapeGrid, styles.stimulusShape)}
          style={{ gridTemplateColumns: `repeat(${s.shape.cols}, 1fr)` }}
          aria-hidden
        >
          {Array.from({ length: s.shape.cols * s.shape.rows }, (_, i) => (
            <span key={i} className={cn(styles.shapeCell, s.shape?.cells.includes(i) && styles.shapeCellOn)} />
          ))}
        </span>
      )}
      {s?.pieces && (
        <svg viewBox="0 0 100 100" className={styles.stimulusFigure} aria-hidden>
          {s.pieces.map((piece) => (
            <g key={piece.id} transform={`translate(${piece.x} ${piece.y}) rotate(${piece.rotate ?? 0})`}>
              <PieceShape piece={piece} fill={piece.color} />
            </g>
          ))}
        </svg>
      )}
      {s?.scene && (
        <span className={styles.scene} aria-hidden>
          {s.scene.map((chip, i) => (
            <span key={i} className={styles.sceneChip}>
              <span className={cn(styles.sceneEmoji, 'emoji')}>{chip.emoji}</span>
              {chip.label && <span className={styles.sceneLabel}>{chip.label}</span>}
            </span>
          ))}
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
