import { motion } from 'framer-motion';
import { useGameStore } from '@/core/store/useGameStore';
import { useActiveTheme } from '@/core/theme/useActiveTheme';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { DreamBuild } from './DreamBuild';
import styles from './TreasureVault.module.css';

/** The child's motivation hub: artifact piggy bank, milestone goals, dream build. */
export function TreasureVault() {
  const artifacts = useGameStore((s) => s.artifacts);
  const milestones = useGameStore((s) => s.milestones);
  const progress = useGameStore((s) => s.progress);
  const theme = useActiveTheme();

  // Highest step reached across every learning path.
  const maxStep = Math.max(1, ...Object.values(progress), 0);

  return (
    <div className="stack">
      <motion.div
        className={styles.piggy}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
      >
        <motion.span
          className={`${styles.bigArt} emoji`}
          aria-hidden
          animate={{ rotate: [0, -8, 8, 0], y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          {theme.artifact.emoji}
        </motion.span>
        <div>
          <div className={styles.count}>{artifacts}</div>
          <div className="muted">{theme.artifact.name} зібрано</div>
        </div>
      </motion.div>

      <div className={styles.goalCard}>
        <h3 className={styles.goalTitle}>
          <span className="emoji" aria-hidden>
            🎯
          </span>{' '}
          Сімейні цілі
        </h3>
        <div className="stack">
          {milestones.map((m) => {
            const reached = maxStep >= m.step;
            return (
              <div key={m.id} className={styles.milestone}>
                <span className={`${styles.mIcon} emoji`} aria-hidden>
                  {reached ? '🎉' : '🎁'}
                </span>
                <div className={styles.mBody}>
                  <div className={styles.mReward}>{m.reward}</div>
                  <ProgressBar
                    value={maxStep / m.step}
                    label={reached ? 'Досягнуто!' : `Сходинка ${maxStep} / ${m.step}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <DreamBuild />
    </div>
  );
}
