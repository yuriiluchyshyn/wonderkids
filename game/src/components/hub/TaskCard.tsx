import { useLang, useT } from '@/core/translator';
import { useSayT } from '@/core/audio/useSpeech';
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
// forwardRef: AnimatePresence (popLayout) measures the card as it leaves.
export const TaskCard = forwardRef<HTMLElement, TaskCardProps>(function TaskCard({ entry, onStart, dimmed = false }, ref) {
  const t = useT();
  const say = useSayT('selections', useLang());
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
    t('ages.range', { from: DIFFICULTY_AGES[minStars][0], to: DIFFICULTY_AGES[maxStars][1] });

  const start = () => {
    if (locked) {
      say('hub.card.comingSoon', { name: sub.label });
      return;
    }
    announce(sub.label);
    onStart(entry);
  };

  return (
    <motion.article
      ref={ref}
      data-game={`${entry.module.id}:${sub.id}`}
      className={cn(styles.card, !showText && styles.compact, locked && styles.locked, dimmed && styles.dimmed)}
      aria-disabled={locked}
      layout
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      // The entrance may spring; a card changing places (the star filter
      // re-sorts the grid) glides instead — a spring made it leap up the page.
      transition={{ type: 'spring', stiffness: 260, damping: 22, layout: { duration: 0.6, ease: [0.3, 0, 0.2, 1] } }}
    >
      {status === 'new' && (
        <span className={styles.badgeNew} aria-label={t('hub.card.newLabel')}>
          {t('hub.card.new')}
        </span>
      )}
      {locked && <span className={styles.badgeSoon}>{t('common.soon')}</span>}

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
        aria-label={minStars === maxStars ? t('hub.card.difficulty', { stars: minStars, ages }) : t('hub.card.difficultyRange', { from: minStars, to: maxStars, ages })}
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
          {showText && ` ${taskCount > 0 ? t('hub.card.freeCount', { count: taskCount }) : t('hub.card.free')}`}
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
            label={showText ? t('hub.card.step', { step, total: totalSteps }) : undefined}
          />
        </div>
      </div>
      )}

      {locked ? (
        <Button icon="🔒" variant="ghost" block onClick={start} ariaLabel={t('hub.card.soonLabel', { name: sub.label })}>
          {showText ? t('common.soon') : ''}
        </Button>
      ) : (
        <Button
          icon={free ? '▶️' : '🗺️'}
          block
          onClick={start}
          ariaLabel={free ? t('hub.card.playLabel', { name: sub.label }) : t('hub.card.pathLabel', { name: sub.label })}
        >
          {showText ? (free ? t('common.play') : t('hub.card.myPath')) : ''}
        </Button>
      )}
    </motion.article>
  );
});
