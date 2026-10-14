import { useLang, useT } from '@/core/translator';
import { motion } from 'framer-motion';
import { useState, type CSSProperties, type ReactNode } from 'react';
import type { GameViewProps } from '@/core/game/kernel/types';
import { cardSpeech, glyphSpeech, type Card, type Glyph, type TangramPiece, type TemplatePayload } from '@/core/game/templates/types';
import { blinkProps, useHintFocus } from '@/components/hints/HintStage';
import { useShowText } from '@/core/app/ui/useUiPrefs';
import { cn } from '@/core/utils/cn';
import { LandmarkArt, hasLandmarkArt } from './LandmarkArt';
import { ClockFace } from './ClockFace';
import { ColorSwatch } from './ColorSwatch';
import { PieFood } from './PieFood';
import { PlanetArt, hasPlanetArt } from './PlanetArt';
import { PieceShape } from './TangramLayout';
import { SpeakButton } from './SpeakButton';
import { useCuesHidden } from './CueContext';
import styles from './Templates.module.css';

/** Props every template layout receives. */
export type LayoutProps<P extends TemplatePayload> = GameViewProps<P> & { payload: P };

/** UI Shake 300ms (PRD v4.0 §3.3 SND_ERROR). */
export const SHAKE = { x: [0, -9, 9, -6, 6, 0] };
export const SHAKE_TRANSITION = { duration: 0.3 };
/** Pulse on an accepted drop (§3.3 SND_DROP_SLOT). */
export const PULSE = { scale: [1, 1.14, 1] };

/** How the unknown is written in a math line and drawn in a word problem's picture row. */
export const ASK_GLYPH = '?';
export const ASK_EMOJI = '❓';

/** One piece of a math line. On the task's own line it blinks while a hint names it (`glyph:<i>`). */
function GlyphPiece({ g, at, answer, hints }: { g: Glyph; at: number; answer?: string; hints: boolean }) {
  const named = useHintFocus(`glyph:${at}`);
  const lit = blinkProps(hints ? named : null);
  if (typeof g === 'string') {
    // The unknown of the line: the right answer lands here (`data-ask`).
    return (
      <span aria-hidden data-ask={g === ASK_GLYPH ? '' : undefined} className={cn(g === ASK_GLYPH && answer && styles.askFilled, lit.className)} style={lit.style}>
        {g === ASK_GLYPH && answer ? answer : g}
      </span>
    );
  }
  if ('text' in g) {
    return (
      <span className={cn(g.tone === 'a' ? styles.toneA : styles.toneB, lit.className)} style={lit.style} aria-hidden>
        {g.text}
      </span>
    );
  }
  return (
    <span className={cn(styles.frac, lit.className)} style={lit.style} aria-hidden>
      <span>{g.n}</span>
      <span className={styles.fracBar} />
      <span>{g.d}</span>
    </span>
  );
}

/**
 * A math line: numbers/operators as text, fractions stacked vertically. The
 * task's own line (`hints`) lights the pieces a hint's beat names; the lines
 * on answer cards never do.
 */
export function Glyphs({ glyphs, className, answer, hints = false }: { glyphs: Glyph[]; className?: string; answer?: string; hints?: boolean }) {
  const lang = useLang();
  return (
    <span className={cn(styles.glyphs, className)} aria-label={glyphs.map((g) => glyphSpeech(g, lang)).join(' ')}>
      {glyphs.map((g, i) => (
        <GlyphPiece key={i} g={g} at={i} answer={answer} hints={hints} />
      ))}
    </span>
  );
}

/** A figure's piece on the task's own picture; it blinks while a beat names it (`piece:<id>`). */
function FigurePiece({ piece }: { piece: TangramPiece & { id?: string } }) {
  const lit = blinkProps(useHintFocus(piece.id ? `piece:${piece.id}` : undefined));
  return (
    <g transform={`translate(${piece.x} ${piece.y}) rotate(${piece.rotate ?? 0})`}>
      <PieceShape piece={piece} fill={piece.color} className={lit.className} style={lit.style} />
    </g>
  );
}

/** Characters a math line may have before it is drawn smaller («4 + 6 + 3 + 4 = ?» still fits). */
const LONG_LINE = 13;

/** How many characters a math line has, about (a fraction counts as its wider half). */
function glyphsLength(glyphs: Glyph[]): number {
  return glyphs.reduce((sum, g) => sum + (typeof g === 'string' ? g.length : 'text' in g ? g.text.length : Math.max(String(g.n).length, String(g.d).length)), 0);
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
  // An association picture that has faded (`core/game/cues`): the name alone is left.
  const pictured = !(useCuesHidden() && card.cue && card.label);
  // Text is the only face of some cards — never hide it then.
  const label = card.label && (showText || !card.emoji || !pictured) ? card.label : null;
  return (
    <span className={styles.face}>
      {pictured && card.image && <Picture src={card.image} emoji={card.emoji} />}
      {card.planet && hasPlanetArt(card.planet) && (
        <span className={styles.faceEmoji}>
          <PlanetArt id={card.planet} />
        </span>
      )}
      {pictured && card.emoji && !card.image && !card.planet && (
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
      {card.swatch && <ColorSwatch swatch={card.swatch} />}
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
  answer,
}: {
  payload: TemplatePayload;
  onSpeak: () => void;
  children?: ReactNode;
  /** The solved answer, shown in place of the task's «?» (see `data-ask`). */
  answer?: string;
}) {
  const t = useT();
  const s = payload.stimulus;
  if (!s && !children) return null;
  return (
    <motion.button
      type="button"
      className={styles.stimulus}
      onClick={onSpeak}
      aria-label={t('tpl.repeat')}
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
      {s?.clock && <ClockFace time={s.clock} className={styles.stimulusClock} hints />}
      {s?.swatch && <ColorSwatch swatch={s.swatch} size="splash" />}
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
            <FigurePiece key={piece.id} piece={piece} />
          ))}
        </svg>
      )}
      {s?.scene && (
        <span className={styles.scene} aria-hidden>
          {s.scene.map((chip, i) => (
            <span key={i} className={styles.sceneChip} data-ask={chip.emoji === ASK_EMOJI ? '' : undefined}>
              {chip.emoji === ASK_EMOJI && answer ? (
                <span className={cn(styles.sceneEmoji, styles.askFilled)}>{answer}</span>
              ) : (
                <span className={cn(styles.sceneEmoji, 'emoji')}>{chip.emoji}</span>
              )}
              {chip.label && <span className={styles.sceneLabel}>{chip.label}</span>}
            </span>
          ))}
        </span>
      )}
      {s?.glyphs && <Glyphs glyphs={s.glyphs} className={cn(styles.stimulusGlyphs, glyphsLength(s.glyphs) > LONG_LINE && styles.stimulusGlyphsLong)} answer={answer} hints />}
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
