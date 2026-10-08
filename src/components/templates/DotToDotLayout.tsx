import { motion } from 'framer-motion';
import { useRef, useState, type PointerEvent } from 'react';
import { useSound } from '@/core/audio/useSound';
import type { DotToDotPayload } from '@/core/game/templates/types';
import { cn } from '@/core/utils/cn';
import { SHAKE, SHAKE_TRANSITION, Stimulus, type LayoutProps } from './parts';
import styles from './Templates.module.css';

/** How close (in canvas units) a finger must come to a star to touch it. */
const REACH = 6;
/** Sizes of a star of the sky that is not part of the figure, and of a labelled one. */
const DECOY_R = 1.25;
const STAR_R = 2.1;

/**
 * Dot-to-dot — the child "draws" a constellation.
 *  - By labels: tap the stars in the order of their labels (numbers, letters,
 *    counting by twos or tens); each right star is joined to the one before.
 *    Helper: the next star pulses.
 *  - «Знайди сузір’я» (`payload.find`): no labels, and the figure is lost
 *    among other stars — only a little bigger than they are. The child finds
 *    its stars and joins them with a finger, sliding from one to the next or
 *    tapping them in any order; a line appears between two neighbours of the
 *    figure once both are found. Helper: the stars still to find pulse.
 * The finished line reveals what the constellation is.
 */
export function DotToDotLayout({ payload, callbacks, hintActive }: LayoutProps<DotToDotPayload>) {
  const { stars, figure, find } = payload;
  const { chime } = useSound();
  const [joined, setJoined] = useState(0);
  const [found, setFound] = useState<ReadonlySet<number>>(() => new Set());
  const [miss, setMiss] = useState<number | null>(null);
  const [shake, setShake] = useState(false);
  const svg = useRef<SVGSVGElement>(null);
  const pressed = useRef(false);

  const done = find ? found.size === stars.length : joined === stars.length;

  const tap = (index: number) => {
    if (done || index < joined) return;
    if (index !== joined) {
      setShake(true);
      callbacks.onMistake();
      return;
    }
    chime(joined);
    setJoined(joined + 1);
    if (joined + 1 === stars.length) callbacks.onSuccess();
  };

  // ---- «Знайди сузір’я»: touch the stars, sliding or tapping ----
  const nearest = (points: readonly { x: number; y: number }[], e: PointerEvent): number => {
    const box = svg.current?.getBoundingClientRect();
    if (!box) return -1;
    const x = ((e.clientX - box.left) / box.width) * 100;
    const y = ((e.clientY - box.top) / box.height) * 100;
    let best = -1;
    let bestGap = REACH;
    points.forEach((p, i) => {
      const gap = Math.hypot(p.x - x, p.y - y);
      if (gap < bestGap) {
        best = i;
        bestGap = gap;
      }
    });
    return best;
  };
  const light = (index: number) => {
    if (found.has(index)) return;
    const next = new Set(found).add(index);
    chime(found.size);
    setFound(next);
    if (next.size === stars.length) callbacks.onSuccess();
  };
  const touch = (e: PointerEvent, pressedNow: boolean) => {
    if (!find || done) return;
    const star = nearest(stars, e);
    if (star >= 0) {
      light(star);
      return;
    }
    // A star that is not of the figure counts only when it is tapped — a
    // finger sliding from one star to the next may pass over others.
    if (!pressedNow) return;
    const decoy = nearest(find.decoys, e);
    if (decoy < 0) return;
    setMiss(decoy);
    setShake(true);
    callbacks.onMistake();
  };

  const line = stars
    .slice(0, joined)
    .map((s) => `${s.x},${s.y}`)
    .join(' ');

  return (
    <div className="stack">
      <Stimulus payload={payload} onSpeak={callbacks.speakPrompt} />
      <motion.div
        className={styles.sky}
        animate={shake ? SHAKE : { x: 0 }}
        transition={SHAKE_TRANSITION}
        onAnimationComplete={() => {
          setShake(false);
          setMiss(null);
        }}
      >
        <svg
          ref={svg}
          viewBox="0 0 100 100"
          className={cn(styles.skySvg, find && styles.skyFind)}
          role="group"
          aria-label="Зоряне небо"
          onPointerDown={(e) => {
            pressed.current = true;
            touch(e, true);
          }}
          onPointerMove={(e) => pressed.current && touch(e, false)}
          onPointerUp={() => (pressed.current = false)}
          onPointerLeave={() => (pressed.current = false)}
          onPointerCancel={() => (pressed.current = false)}
        >
          {done && (
            <text x="50" y="56" className={cn(styles.skyFigure, 'emoji')} textAnchor="middle" dominantBaseline="middle" aria-hidden>
              {figure.emoji}
            </text>
          )}
          {find ? (
            <>
              {find.decoys.map((d, i) => (
                <circle key={`d${i}`} cx={d.x} cy={d.y} r={DECOY_R} className={cn(styles.skyDecoy, miss === i && styles.skyMiss)} />
              ))}
              {/* A line between two neighbours of the figure, once both are found. */}
              {stars.slice(1).map((s, i) =>
                found.has(i) && found.has(i + 1) ? <line key={`l${i}`} x1={stars[i].x} y1={stars[i].y} x2={s.x} y2={s.y} className={cn(styles.skyLine, done && styles.skyLineDone)} /> : null,
              )}
              {stars.map((star, i) => (
                <circle
                  key={i}
                  cx={star.x}
                  cy={star.y}
                  r={DECOY_R * find.ratio}
                  className={cn(styles.skyDot, found.has(i) && styles.skyDotOn, hintActive && !found.has(i) && styles.skyDotNext)}
                />
              ))}
            </>
          ) : (
            <>
              <polyline points={line} className={cn(styles.skyLine, done && styles.skyLineDone)} />
              {stars.map((star, i) => {
                const on = i < joined;
                const next = hintActive && i === joined;
                return (
                  <g key={i} className={styles.skyStar} onClick={() => tap(i)} role="button" aria-label={`Зірка ${star.label}`}>
                    {/* A generous invisible target for small fingers. */}
                    <circle cx={star.x} cy={star.y} r="7" fill="transparent" />
                    <circle cx={star.x} cy={star.y} r={on ? 2.6 : STAR_R} className={cn(styles.skyDot, on && styles.skyDotOn, next && styles.skyDotNext)} />
                    <text x={star.x} y={star.y < 14 ? star.y + 8.5 : star.y - 4.5} textAnchor="middle" className={cn(styles.skyLabel, on && styles.skyLabelOn)}>
                      {star.label}
                    </text>
                  </g>
                );
              })}
            </>
          )}
        </svg>
      </motion.div>
      {done && (
        <p className={styles.counter} aria-live="polite">
          <span className="emoji" aria-hidden>
            {figure.emoji}
          </span>{' '}
          {figure.name}
        </p>
      )}
    </div>
  );
}
