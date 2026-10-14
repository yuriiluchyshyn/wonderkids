import { useT } from '@/core/translator';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import type { SpeechLang } from '@/core/audio/SpeechEngine';
import { voice } from '@/core/audio/voice';
import type { FractionBars as Bars, FractionValue } from '@/core/game/templates/types';
import { cn } from '@/core/utils/cn';
import { Button } from '@/components/ui/Button';
import styles from './FractionBars.module.css';

/** How long a stage stays before the next one comes. */
const STAGE_MS = 3400;

/** What a strip shows: parts coloured for the first fraction, for the second, taken away, or empty. */
type Part = 'a' | 'b' | 'gone' | 'empty';

interface Strip {
  /** The fraction written at the left of the first strip of a row of them. */
  label?: FractionValue;
  parts: Part[];
  /** The strip is being cut finer: its old part boundaries fade and new ones come. */
  recut?: boolean;
}

/** `count` parts coloured, and as many strips as that takes: 7 parts of 6 is a strip and one more part. */
const filled = (d: number, count: number, as: Part): Part[] => Array.from({ length: Math.max(d, count) }, (_, i) => (i < count ? as : 'empty'));

/**
 * One fraction laid out: a strip of `d` parts, and a second strip under it
 * when the coloured parts do not fit on one — which is exactly what 7/6 is.
 * The fraction is written beside the first strip only.
 */
function laid(label: FractionValue, parts: Part[], d: number, recut?: boolean): Strip[] {
  const rows = Math.max(1, Math.ceil(parts.length / d));
  const all: Part[] = [...parts, ...Array.from({ length: rows * d - parts.length }, (): Part => 'empty')];
  return Array.from({ length: rows }, (_, row) => ({
    ...(row === 0 ? { label } : {}),
    parts: all.slice(row * d, (row + 1) * d),
    ...(recut ? { recut } : {}),
  }));
}

/**
 * One stage of the lesson: the strips as they stand, and the line that goes
 * with them. Built here rather than in the task, so a generator stays data.
 */
function stagesOf(bars: Bars): { strips: Strip[]; text: string }[] {
  const { op, a, b, same, total, reduced, words } = bars;
  const [one, two] = same ? [same.a, same.b] : [a, b];
  const d = total.d;
  const out: { strips: Strip[]; text: string }[] = [];

  // 1. The first fraction, on the strip the task writes it on.
  out.push({ strips: laid(a, filled(a.d, a.n, 'a'), a.d), text: words.first });

  // 2. The second beside it — still cut its own way.
  out.push({
    strips: [...laid(a, filled(a.d, a.n, 'a'), a.d), ...laid(b, filled(b.d, b.n, 'b'), b.d)],
    text: words.second,
  });

  // 3. Strips cut differently cannot be put together: both are re-cut into the same parts.
  if (same && words.cut) {
    out.push({
      strips: [...laid(one, filled(d, one.n, 'a'), d, true), ...laid(two, filled(d, two.n, 'b'), d, true)],
      text: words.cut,
    });
  }

  // 4. The two strips as one. Adding lays the second's parts beside the first's — past the
  //    end of the strip and onto another one, when together they are more than a whole;
  //    taking away puts out as many of the first's as the second asks for.
  const together: Part[] =
    op === '+'
      ? Array.from({ length: Math.max(d, one.n + two.n) }, (_, i): Part => (i < one.n ? 'a' : i < one.n + two.n ? 'b' : 'empty'))
      : Array.from({ length: d }, (_, i): Part => (i < total.n ? 'a' : i < one.n ? 'gone' : 'empty'));
  out.push({ strips: laid(total, together, d), text: words.total });

  // 5. The same strip, written more simply.
  if (reduced && words.reduced) {
    out.push({ strips: laid(reduced, filled(reduced.d, reduced.n, 'a'), reduced.d), text: words.reduced });
  }
  return out;
}

/** A fraction as it is written in the lesson: the top number over the bottom one. */
function Frac({ value }: { value: FractionValue }) {
  return (
    <span className={styles.frac} aria-hidden>
      <span>{value.n}</span>
      <span className={styles.fracBar} />
      <span>{value.d}</span>
    </span>
  );
}

/** One strip: the fraction it stands for, and its parts. A strip that carries on from the one above has no fraction of its own. */
function StripRow({ row }: { row: Strip }) {
  return (
    <div className={styles.row}>
      {row.label ? <Frac value={row.label} /> : <span className={styles.frac} aria-hidden />}
      <div className={cn(styles.strip, row.parts.length > 12 && styles.fine)}>
        {row.parts.map((part, i) => (
          <motion.span
            key={`${row.parts.length}-${i}`}
            className={cn(styles.part, styles[part])}
            // A part that has just been cut, or has just been coloured in, grows into its place.
            initial={row.recut ? { scaleX: 0.2, opacity: 0 } : part === 'empty' ? false : { scale: 0.4, opacity: 0 }}
            animate={{ scaleX: 1, scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.6) }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Adding and taking away fractions, shown on strips of one length: a strip cut
 * into as many parts as the bottom number says, with as many of them coloured
 * as the top one. The stages come out one after another — the first fraction,
 * the second, both re-cut into the same parts when they were cut differently,
 * and the two of them as one strip. The last stage says what a child is meant
 * to carry away: the bottom number does not move, because the parts are the
 * same size; only the coloured ones are counted together.
 *
 * It is the task's `payload.bars`, shown in the helper panel once the child
 * needs it — after mistakes, or after a long while with no answer.
 */
export function FractionBars({ bars, said, lang }: { bars: Bars; said?: Bars; lang?: SpeechLang }) {
  const t = useT();
  const stages = useMemo(() => stagesOf(bars), [bars]);
  // The same stages in the voice's language, which is not always the task's.
  const spoken = useMemo(() => stagesOf(said ?? bars), [said, bars]);
  const [shown, setShown] = useState(0);
  const [round, setRound] = useState(0);

  // One stage at a time, and then it stands still: nothing here loops for ever.
  useEffect(() => {
    if (shown >= stages.length - 1) return;
    const id = window.setTimeout(() => setShown((n) => n + 1), STAGE_MS);
    return () => window.clearTimeout(id);
  }, [shown, stages.length, round]);

  // Each stage is read out as it comes — the picture and the words say the same thing at the same moment.
  useEffect(() => {
    const line = spoken[Math.min(shown, spoken.length - 1)]?.text;
    if (line) voice.say(line, 'hint', lang);
  }, [shown, round, spoken, lang]);

  const stage = stages[Math.min(shown, stages.length - 1)];
  return (
    <div className={styles.bars}>
      <div className={styles.strips}>
        {stage.strips.map((row, i) => (
          <StripRow key={`${round}-${shown}-${i}`} row={row} />
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.p key={`${round}-${shown}`} className={styles.text} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          {stage.text}
        </motion.p>
      </AnimatePresence>
      {shown >= stages.length - 1 && stages.length > 1 && (
        <Button
          variant="ghost"
          icon="🔁"
          onClick={() => {
            setShown(0);
            setRound((r) => r + 1);
          }}
        >
          {t('tpl.lessonReplay')}
        </Button>
      )}
    </div>
  );
}


