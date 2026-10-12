import { motion } from 'framer-motion';
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { useT } from '@/core/translator';
import { useSound } from '@/core/audio/useSound';
import type { WordSearchPayload } from '@/core/game/templates/types';
import { lineCells, wordOnLine } from '@/core/game/templates/validate';
import { cn } from '@/core/utils/cn';
import { SHAKE, SHAKE_TRANSITION, type LayoutProps } from './parts';
import { SpeakButton } from './SpeakButton';
import styles from './WordSearch.module.css';

/** How many marker colours the found words take turns with. */
const HUES = 6;

/**
 * Word search — a square table of letters with words hidden in it. The child
 * draws a finger from the first letter of a word to its last (or taps the two
 * ends one after the other); a found word stays marked in a colour of its own
 * and its picture below is ticked. A line that spells nothing shakes the table
 * gently. Helper: the first letter of every word still hidden pulses.
 */
export function WordSearchLayout({ payload, callbacks, hintActive }: LayoutProps<WordSearchPayload>) {
  const t = useT();
  const { cols, letters, words, lang } = payload;
  const { playCode } = useSound();
  const [found, setFound] = useState<string[]>([]);
  // The line being drawn: where the finger went down and where it is now.
  const [anchor, setAnchor] = useState<number | null>(null);
  const [end, setEnd] = useState<number | null>(null);
  // A tapped first letter waiting for the tap on the last one.
  const [pending, setPending] = useState<number | null>(null);
  const [shake, setShake] = useState(false);
  const dragging = useRef(false);
  const done = found.length === words.length;

  useEffect(() => {
    if (done) callbacks.onSuccess();
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  const line = anchor !== null && end !== null ? lineCells(cols, anchor, end) : null;
  const drawn = new Set(line ?? (pending !== null ? [pending] : []));
  const colourOf = new Map<number, number>();
  found.forEach((id, i) => words.find((w) => w.id === id)?.cells.forEach((c) => colourOf.set(c, i % HUES)));
  const starts = hintActive ? new Set(words.filter((w) => !found.includes(w.id)).map((w) => w.cells[0])) : new Set<number>();

  const judge = (from: number, to: number) => {
    const cells = lineCells(cols, from, to);
    if (!cells || cells.length < 2) return;
    const id = wordOnLine(letters, cells, words, found);
    if (id) {
      playCode('SND_DROP_SLOT');
      setFound((f) => [...f, id]);
      return;
    }
    setShake(true);
    callbacks.onMistake();
  };

  const cellAt = (x: number, y: number): number | null => {
    const el = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-cell]');
    return el ? Number(el.dataset.cell) : null;
  };

  const down = (e: PointerEvent<HTMLDivElement>) => {
    if (done) return;
    const cell = cellAt(e.clientX, e.clientY);
    if (cell === null) return;
    if (pending !== null && pending !== cell) {
      // The second tap of a tap-tap line.
      setPending(null);
      judge(pending, cell);
      return;
    }
    e.currentTarget.setPointerCapture?.(e.pointerId);
    dragging.current = true;
    setAnchor(cell);
    setEnd(cell);
  };
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const cell = cellAt(e.clientX, e.clientY);
    if (cell !== null && cell !== end) setEnd(cell);
  };
  const up = () => {
    if (!dragging.current) return;
    dragging.current = false;
    const [from, to] = [anchor, end];
    setAnchor(null);
    setEnd(null);
    if (from === null || to === null) return;
    if (from === to) {
      // A tap: this is the first letter; the next tap ends the line.
      setPending(pending === from ? null : from);
      return;
    }
    setPending(null);
    judge(from, to);
  };

  return (
    <div className="stack">
      <motion.div
        className={styles.table}
        style={{ '--cols': cols } as CSSProperties}
        animate={shake ? SHAKE : { x: 0 }}
        transition={SHAKE_TRANSITION}
        onAnimationComplete={() => setShake(false)}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        role="grid"
        aria-label={t('tpl.wordTable')}
      >
        {letters.map((letter, i) => {
          const hue = colourOf.get(i);
          return (
            <span
              key={i}
              data-cell={i}
              className={cn(styles.cell, drawn.has(i) && styles.drawn, hue !== undefined && styles.found, starts.has(i) && styles.start)}
              style={hue !== undefined ? ({ '--hue': hue } as CSSProperties) : undefined}
              role="gridcell"
            >
              {letter}
            </span>
          );
        })}
      </motion.div>
      <ul className={styles.words}>
        {words.map((w) => {
          const got = found.includes(w.id);
          return (
            <li
              key={w.id}
              className={cn(styles.word, got && styles.wordFound)}
              style={got ? ({ '--hue': found.indexOf(w.id) % HUES } as CSSProperties) : undefined}
            >
              <span className="emoji" aria-hidden>
                {w.emoji}
              </span>
              {w.shown || got ? (
                <span className={styles.wordText}>{w.word}</span>
              ) : (
                // Not written: as many blanks as it has letters.
                <span className={styles.blanks} aria-label={t('tpl.letters', { count: w.word.length })}>
                  {'_'.repeat(w.word.length)}
                </span>
              )}
              {got && <span aria-hidden>✓</span>}
              <SpeakButton text={w.word.toLocaleLowerCase(lang)} lang={lang} className={styles.wordSpeak} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
