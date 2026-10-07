import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSound } from '@/core/audio/useSound';
import type { DotToDotPayload } from '@/core/templates/types';
import { cn } from '@/core/utils/cn';
import { SHAKE, SHAKE_TRANSITION, Stimulus, type LayoutProps } from './parts';
import styles from './Templates.module.css';

/**
 * Dot-to-dot — the child "draws" a constellation by tapping its stars in the
 * order of their labels (numbers, letters, counting by twos or tens). Each
 * right star is joined to the one before; the finished line reveals what the
 * constellation is. Helper: the next star pulses.
 */
export function DotToDotLayout({ payload, callbacks, hintActive }: LayoutProps<DotToDotPayload>) {
  const { stars, figure } = payload;
  const { chime } = useSound();
  const [joined, setJoined] = useState(0);
  const [shake, setShake] = useState(false);

  const done = joined === stars.length;

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

  const line = stars
    .slice(0, joined)
    .map((s) => `${s.x},${s.y}`)
    .join(' ');

  return (
    <div className="stack">
      <Stimulus payload={payload} onSpeak={callbacks.speakPrompt} />
      <motion.div className={styles.sky} animate={shake ? SHAKE : { x: 0 }} transition={SHAKE_TRANSITION} onAnimationComplete={() => setShake(false)}>
        <svg viewBox="0 0 100 100" className={styles.skySvg} role="group" aria-label="Зоряне небо">
          {done && (
            <text x="50" y="56" className={cn(styles.skyFigure, 'emoji')} textAnchor="middle" dominantBaseline="middle" aria-hidden>
              {figure.emoji}
            </text>
          )}
          <polyline points={line} className={cn(styles.skyLine, done && styles.skyLineDone)} />
          {stars.map((star, i) => {
            const on = i < joined;
            const next = hintActive && i === joined;
            return (
              <g key={i} className={styles.skyStar} onClick={() => tap(i)} role="button" aria-label={`Зірка ${star.label}`}>
                {/* A generous invisible target for small fingers. */}
                <circle cx={star.x} cy={star.y} r="7" fill="transparent" />
                <circle cx={star.x} cy={star.y} r={on ? 2.6 : 2.1} className={cn(styles.skyDot, on && styles.skyDotOn, next && styles.skyDotNext)} />
                <text x={star.x} y={star.y < 14 ? star.y + 8.5 : star.y - 4.5} textAnchor="middle" className={cn(styles.skyLabel, on && styles.skyLabelOn)}>
                  {star.label}
                </text>
              </g>
            );
          })}
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
