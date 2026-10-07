import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { useActiveTheme } from '@/core/theme/useActiveTheme';
import { useShowText } from '@/core/app/ui/useUiPrefs';
import { useVoiceSpeak } from '@/core/audio/useSpeech';
import { useGameStore } from '@/core/child/store/useGameStore';
import { subSteps, pathKey } from '@/core/child/progress/path';
import { difficultyRange, gameStatus, isFreePlay } from '@/core/game/kernel/gameConfig';
import { DIFFICULTY_AGES } from '@/core/game/kernel/types';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { cn } from '@/core/utils/cn';
import type { CatalogEntry } from './catalog';
import styles from './TaskCard.module.css';

interface TaskCardProps {
  entry: CatalogEntry;
  /** Opens the learning-path map for this card. */
  onStart: (entry: CatalogEntry) => void;
  /** Outside the chosen star filter: quieter, but still fully playable. */
  dimmed?: boolean;
}

/** Catalog card: subject icon, path progress, and a button to open the path. */
/** «1 завдання», «3 завдання», «100 завдань». */
function plural(n: number): string {
  const tens = n % 100;
  const ones = n % 10;
  if (tens >= 11 && tens <= 14) return 'завдань';
  if (ones === 1) return 'завдання';
  if (ones >= 2 && ones <= 4) return 'завдання';
  return 'завдань';
}

// forwardRef: AnimatePresence (popLayout) measures the card as it leaves.
export const TaskCard = forwardRef<HTMLElement, TaskCardProps>(function TaskCard({ entry, onStart, dimmed = false }, ref) {
  const theme = useActiveTheme();
  const showText = useShowText();
  const announce = useVoiceSpeak('selections');
  const { module, sub } = entry;

  const totalSteps = subSteps(sub);
  // Clamped: a saved step may exceed a path that was shortened in a release.
  const step = Math.min(useGameStore((s) => s.progress[pathKey(module.id, sub.id)] ?? 1), totalSteps);

  // Publication status comes from the game's publish date (PRD v4.0 §1.2).
  const status = gameStatus(sub);
  const locked = status === 'soon';
  // Free play: no ladder to show — the card opens straight into the game.
  const free = isFreePlay(sub);
  const taskCount = free ? (module.taskCount?.(sub.id) ?? 0) : 0;
  const [minStars, maxStars] = difficultyRange(sub);
  const ages =
    minStars === maxStars
      ? DIFFICULTY_AGES[minStars]
      : `${DIFFICULTY_AGES[minStars].split('–')[0]}–${DIFFICULTY_AGES[maxStars].split('–')[1]}`;

  const start = () => {
    if (locked) {
      announce(`${sub.label}. Ця гра з’явиться скоро`);
      return;
    }
    announce(sub.label);
    onStart(entry);
  };

  return (
    <motion.article
      ref={ref}
      className={cn(styles.card, !showText && styles.compact, locked && styles.locked, dimmed && styles.dimmed)}
      aria-disabled={locked}
      layout
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
    >
      {status === 'new' && (
        <span className={styles.badgeNew} aria-label="Нова гра">
          ✨ Нове
        </span>
      )}
      {locked && <span className={styles.badgeSoon}>Скоро</span>}

      <div className={styles.top}>
        <motion.span
          className={`${styles.icon} emoji`}
          aria-hidden
          animate={{ rotate: [0, -5, 5, 0], y: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 3.4, ease: 'easeInOut' }}
        >
          {sub.icon}
        </motion.span>
        {showText && (
          <div className={styles.titleBlock}>
            <h3 className={styles.title}>{sub.label}</h3>
            <p className={styles.blurb}>{sub.blurb}</p>
          </div>
        )}
      </div>

      {/* Difficulty marking: 1–3 stars ↔ age band (PRD v4.0 §1.2). */}
      <div
        className={styles.stars}
        role="img"
        aria-label={`Складність: ${minStars === maxStars ? minStars : `від ${minStars} до ${maxStars}`} з 3 зірочок, ${ages}`}
      >
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={cn(styles.star, n <= minStars && styles.starOn, n > minStars && n <= maxStars && styles.starHalf)}
            aria-hidden
          >
            ★
          </span>
        ))}
        {showText && <span className={styles.ages}>{ages}</span>}
      </div>

      {free ? (
        <p className={styles.freeNote}>
          <span className="emoji" aria-hidden>
            ♾️
          </span>
          {showText && (taskCount > 0 ? ` ${taskCount} ${plural(taskCount)} · грай скільки хочеш` : ' Грай скільки хочеш')}
          {!showText && taskCount > 0 && ` ${taskCount}`}
        </p>
      ) : (
      <div className={styles.pathRow}>
        <span className={`${styles.pathMascot} emoji`} aria-hidden>
          {theme.mascot.emoji}
        </span>
        <div className={styles.pathBar}>
          <ProgressBar
            value={step / totalSteps}
            label={showText ? `Сходинка ${step} / ${totalSteps}` : undefined}
          />
        </div>
      </div>
      )}

      {locked ? (
        <Button icon="🔒" variant="ghost" block onClick={start} ariaLabel={`${sub.label}: скоро`}>
          {showText ? 'Скоро' : ''}
        </Button>
      ) : (
        <Button
          icon={free ? '▶️' : '🗺️'}
          block
          onClick={start}
          ariaLabel={free ? `Грати: ${sub.label}` : `Відкрити шлях: ${sub.label}`}
        >
          {showText ? (free ? 'Грати' : 'Мій шлях') : ''}
        </Button>
      )}
    </motion.article>
  );
});
