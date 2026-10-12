import { useT } from '@/core/translator';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { SpeechLang } from '@/core/audio/SpeechEngine';
import { voice } from '@/core/audio/voice';
import { TIP_PREFIX, useGameStore } from '@/core/child/store/useGameStore';
import { saidOf, type TaskCallbacks, type TaskInstance } from '@/core/game/kernel/types';
import type { Lesson, LessonStep, TemplatePayload } from '@/core/game/templates/types';
import { cn } from '@/core/utils/cn';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { usePauseWhile } from './PauseContext';
import styles from './RuleLesson.module.css';

/** How long each row of the worked example stays before the next one comes. */
const ROW_MS = 2200;
/** The lesson opens a moment after the task, once the board has appeared. */
const OPEN_DELAY_MS = 600;
/** After a trap: the shake of the wrong card plays first. */
const AGAIN_DELAY_MS = 450;
/** Step badges: «1️⃣ 2️⃣ 3️⃣…». */
const BADGES = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣'];

const tipOf = (lesson: Lesson) => `lesson.${lesson.id}`;

/** One row of the example: its tokens, the part worked out next, the result just made. */
function LessonRow({ step, index, fresh, last }: { step: LessonStep; index: number; fresh?: number; last: boolean }) {
  const [from, to] = step.focus ?? [-1, -1];
  const hug = step.focus && step.tokens[from] === '(';
  return (
    <motion.li className={styles.row} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <span className={styles.badge} aria-hidden>
        {last ? '✅' : BADGES[index] ?? '▶️'}
      </span>
      <span className={styles.line}>
        {step.tokens.map((t, i) => {
          const inFocus = i >= from && i <= to;
          return (
            <motion.span
              key={`${i}-${t}`}
              className={cn(
                styles.token,
                (t === '(' || t === ')') && styles.bracket,
                inFocus && styles.focus,
                inFocus && i === from && styles.focusStart,
                inFocus && i === to && styles.focusEnd,
                inFocus && hug && styles.hug,
                last && styles.answer,
              )}
              // The number just worked out pops into its place.
              initial={i === fresh ? { scale: 0.3, opacity: 0 } : false}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 16, delay: 0.15 }}
            >
              {t}
            </motion.span>
          );
        })}
        {!last && <span className={styles.token}>=</span>}
        {!last && <span className={cn(styles.token, styles.ask)}>?</span>}
      </span>
      {step.note && <span className={styles.note}>{step.note}</span>}
    </motion.li>
  );
}

/** The worked example, row after row; `shown` rows are out. */
function Example({ steps, shown }: { steps: LessonStep[]; shown: number }) {
  return (
    <ol className={styles.rows}>
      {steps.slice(0, shown).map((step, i) => (
        <LessonRow key={i} step={step} index={i} last={i === steps.length - 1} fresh={i > 0 ? steps[i - 1].focus?.[0] : undefined} />
      ))}
    </ol>
  );
}

interface RuleLessonProps {
  lesson: Lesson;
  /** The same lesson in the voice's language (the task's twin), for what is said. */
  said: Lesson;
  lang?: SpeechLang;
  /** `again`: the child tapped a trap. The lesson starts with where to begin in this task. */
  mode: 'first' | 'again';
  onClose: () => void;
}

/**
 * The animated lesson of a rule (order of operations, brackets): the rule in
 * words and a worked example that appears row by row. On each row the part
 * done next is lit; its result pops into the next row. A brackets lesson then
 * shows the same numbers without brackets, for the other answer. Everything
 * is read out. The child replays it or closes it with «Зрозуміло!».
 */
export function RuleLesson({ lesson, said, lang, mode, onClose }: RuleLessonProps) {
  const t = useT();
  const contrast = lesson.contrast ?? [];
  const total = lesson.steps.length + contrast.length;
  const [shown, setShown] = useState(1);
  const [round, setRound] = useState(0);

  // The rows come out one by one: a CSS-free timer, so nothing loops for ever.
  useEffect(() => {
    if (shown >= total) return;
    const id = window.setTimeout(() => setShown((n) => n + 1), ROW_MS);
    return () => window.clearTimeout(id);
  }, [shown, total, round]);

  // Read out once per showing: where to start (after a trap), the rule, the steps.
  // (Closing cuts it off: the Modal stops the voice, and the task is read out after.)
  useEffect(() => {
    const words = [mode === 'again' ? said.again : '', said.text, ...said.steps.map((s) => s.note ?? ''), said.contrastText ?? ''].filter(Boolean).join(' ');
    voice.say(words, 'hint', lang);
  }, [round, mode, said, lang]);

  const replay = () => {
    setShown(1);
    setRound((r) => r + 1);
  };

  return (
    <Modal open onClose={onClose} title={lesson.title} icon={lesson.id === 'brackets' ? '🤗' : '💡'}>
      <div className={styles.lesson}>
        {mode === 'again' && <p className={styles.again}>{lesson.again}</p>}
        <p className={styles.text}>{lesson.text}</p>
        <Example key={round} steps={lesson.steps} shown={Math.min(shown, lesson.steps.length)} />
        {contrast.length > 0 && shown > lesson.steps.length && (
          <motion.div className={styles.contrast} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {lesson.contrastText && <p className={styles.contrastCaption}>{lesson.contrastText}</p>}
            <Example key={`c${round}`} steps={contrast} shown={shown - lesson.steps.length} />
          </motion.div>
        )}
        <div className={styles.actions}>
          <Button variant="ghost" icon="🔁" onClick={replay}>
            {t('tpl.lessonReplay')}
          </Button>
          <Button size="lg" icon="👍" onClick={onClose}>
            {t('tpl.lessonOk')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/**
 * A board's side of a lesson: opens it the first time this child meets the rule,
 * and again when a trap is tapped (`onTrap`). While it is open the game holds
 * still, and when it closes the task is read out again.
 */
export function useRuleLesson(task: TaskInstance, callbacks: TaskCallbacks) {
  const lesson = (task.payload as TemplatePayload).lesson;
  const said = (saidOf(task).payload as TemplatePayload).lesson ?? lesson;
  const seen = useGameStore((s) => (lesson ? s.treasures.includes(`${TIP_PREFIX}${tipOf(lesson)}`) : true));
  const markTipSeen = useGameStore((s) => s.markTipSeen);
  const [mode, setMode] = useState<'first' | 'again' | null>(null);
  const timer = useRef<number>();
  usePauseWhile(mode !== null);

  // First meeting with the rule: the lesson comes before the child answers.
  useEffect(() => {
    if (!lesson || seen) return;
    timer.current = window.setTimeout(() => setMode('first'), OPEN_DELAY_MS);
    return () => window.clearTimeout(timer.current);
    // Once per task: closing marks it seen, which must not reopen it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.id]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  /** A wrong answer was tapped: if it is what skipping the rule gives, explain again. */
  const onTrap = useCallback(
    (optionId: string) => {
      if (!lesson?.traps.includes(optionId)) return;
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setMode('again'), AGAIN_DELAY_MS);
    },
    [lesson],
  );

  const close = () => {
    if (lesson) markTipSeen(tipOf(lesson));
    setMode(null);
    voice.stop();
    callbacks.speakPrompt();
  };

  const element =
    lesson && said && mode ? <RuleLesson lesson={lesson} said={said} lang={saidOf(task).lang} mode={mode} onClose={close} /> : null;
  return { element, onTrap };
}
