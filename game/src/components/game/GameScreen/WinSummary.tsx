import { useT } from '@/core/translator';
import { motion } from 'framer-motion';
import type { GiftTier } from '@/core/child/progress/pathStops';
import { KEY } from '@/core/child/world/stations';
import { useWorld } from '@/core/child/world/useWorld';
import { finishDemo } from '@/core/app/demo';
import { useActiveTheme } from '@/core/theme/useActiveTheme';
import type { Treasure } from '@/core/theme/theme.types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import styles from './WinSummary.module.css';

const GIFT_META: Record<Exclude<GiftTier, null>, { emoji: string; size: string }> = {
  small: { emoji: '🎀', size: '3.6rem' },
  big: { emoji: '🎁', size: '4.4rem' },
  biggest: { emoji: '🏆', size: '5.4rem' },
};

interface WinSummaryProps {
  open: boolean;
  title: string;
  gift: GiftTier;
  earned: number;
  keysWon: number;
  reveal: { treasure: Treasure; isNew: boolean } | null;
  tasks: number;
  trial: boolean;
  /** There is a next step on the path; otherwise the level may be played again. */
  hasNext: boolean;
  onContinue: () => void;
  onPlayAgain: () => void;
  onExit: () => void;
}

/**
 * The win screen: the gift of the step (and who it brought into the child's
 * world) or the mascot, what was earned, the treasure found, and the way on —
 * the next level, or once the path is done, the same one again. The trial is
 * one level: what follows it is the way to an account.
 */
export function WinSummary({ open, title, gift, earned, keysWon, reveal, tasks, trial, hasNext, onContinue, onPlayAgain, onExit }: WinSummaryProps) {
  const t = useT();
  const theme = useActiveTheme();
  const { newestResident } = useWorld();
  return (
    <Modal open={open} dismissible={false} title={title} icon="🏆">
      <div className={styles.summary}>
        {gift ? (
          <motion.div
            className={styles.giftWrap}
            initial={{ scale: 0, rotate: -25 }}
            animate={{ scale: 1, rotate: [0, -10, 10, -6, 6, 0] }}
            transition={{ type: 'spring', stiffness: 240, damping: 11 }}
          >
            <span className="emoji" style={{ fontSize: GIFT_META[gift].size }} aria-hidden>
              {GIFT_META[gift].emoji}
            </span>
            <p className={styles.giftLabel}>{t(`game.gift.${gift}`)}</p>
            {/* The gift is a new resident of the child's world. */}
            {newestResident && (
              <p className={styles.residentLine}>
                {t('game.win.resident')}{' '}
                <span className="emoji" aria-hidden>
                  {newestResident.emoji}
                </span>{' '}
                <strong>{newestResident.name}</strong>
              </p>
            )}
          </motion.div>
        ) : (
          <div className={`${styles.summaryArt} emoji`}>{theme.mascot.emoji}</div>
        )}
        <p className={styles.summaryBig}>
          {t('game.win.earned', { n: earned, emoji: theme.artifact.emoji })}
          {keysWon > 0 && (
            <>
              {' '}
              +{keysWon} {KEY}
            </>
          )}
        </p>
        {reveal && (
          <p className={styles.treasureLine}>
            {reveal.isNew ? t('game.win.newTreasure') : t('game.win.treasure')}
            <span className="emoji" aria-hidden>
              {reveal.treasure.emoji}
            </span>{' '}
            {reveal.treasure.name}
          </p>
        )}
        <p className="muted">
          {t('game.tasksDone', { count: tasks })} {t('game.win.great')}
        </p>
        <div className={styles.summaryActions}>
          {trial ? (
            <Button size="lg" icon="▶️" block onClick={finishDemo}>
              {t('demo.next')}
            </Button>
          ) : hasNext ? (
            <Button size="lg" icon="▶️" block onClick={onContinue}>
              {t('game.win.next')}
            </Button>
          ) : (
            <Button size="lg" icon="🔁" block onClick={onPlayAgain}>
              {t('game.win.again')}
            </Button>
          )}
          {!trial && (
            <Button size="lg" variant="ghost" icon="🏠" block onClick={onExit}>
              {t('game.win.exit')}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
