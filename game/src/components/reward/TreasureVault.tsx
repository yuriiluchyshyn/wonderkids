import { useT } from '@/core/translator';
import { useBalance } from '@/core/child/world/useBalance';
import { motion } from 'framer-motion';
import type { CSSProperties } from 'react';
import { useGameStore } from '@/core/child/store/useGameStore';
import { useActiveTheme } from '@/core/theme/useActiveTheme';
import { ProgressBar } from '@/components/ui/ProgressBar';
import styles from './TreasureVault.module.css';

/** The child's motivation hub: artifact piggy bank, milestone goals, dream build. */
export function TreasureVault() {
  const t = useT();
  // What is in the purse now (earned − spent on the planet).
  const artifacts = useBalance();
  const milestones = useGameStore((s) => s.milestones);
  const theme = useActiveTheme();

  return (
    <div className="stack">
      <motion.div
        className={styles.piggy}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
      >
        <span
          className={`${styles.bigArt} emoji loop-sway`}
          style={{ '--loop-y': '-6px', '--loop-rot': '8deg' } as CSSProperties}
          aria-hidden
        >
          {theme.artifact.emoji}
        </span>
        <div>
          <div className={styles.count}>{artifacts}</div>
          <div className="muted">{t('vault.inVault', { name: theme.artifact.name })}</div>
        </div>
      </motion.div>

      <div className={styles.goalCard}>
        <h3 className={styles.goalTitle}>
          <span className="emoji" aria-hidden>
            🎯
          </span>{' '}
          {t('vault.goals')}
        </h3>
        <p className={styles.goalHint}>
          {t('vault.hint', { name: theme.artifact.name })}
        </p>
        <div className="stack">
          {milestones.map((m) => {
            const reached = artifacts >= m.amount;
            return (
              <div key={m.id} className={styles.milestone}>
                <span className={`${styles.mIcon} emoji`} aria-hidden>
                  {reached ? '🎉' : theme.artifact.emoji}
                </span>
                <div className={styles.mBody}>
                  <div className={styles.mReward}>{m.reward}</div>
                  <ProgressBar
                    value={artifacts / m.amount}
                    label={reached ? t('goal.reached') : `${artifacts} / ${m.amount}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
