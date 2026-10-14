import { useT } from '@/core/translator';
import type { CSSProperties } from 'react';
import { useBalance } from '@/core/child/world/useBalance';
import { useActiveTheme } from '@/core/theme/useActiveTheme';
import { cn } from '@/core/utils/cn';
import { Companion } from '../Companion';
import type { GameSession, Phase } from './types';
import styles from './GameHeader.module.css';

/**
 * The top of the game: the way home, the game's name, the purse — and in play
 * the race track with one segment per task right beneath it. A task added
 * while idling adds a segment, and all of them narrow to fit.
 */
export function GameHeader({ phase, icon, label, session, progress, onExit }: { phase: Phase; icon: string; label: string; session: GameSession; progress: number; onExit: () => void }) {
  const t = useT();
  const theme = useActiveTheme();
  // What is in the purse now (earned − spent on the planet).
  const artifacts = useBalance();
  const playing = phase === 'play';
  return (
    <div className={cn(styles.header, playing && styles.headerPlay)}>
      <button className={styles.back} onClick={onExit} aria-label={t('game.back')} data-tip="home">
        🏠
      </button>
      <div className={styles.headerMain}>
        <div className={styles.title} style={{ '--chars': label.length + 3 } as CSSProperties}>
          {icon} {label}
        </div>
        {playing && (
          <div className={styles.track}>
            <Companion progress={progress} />
          </div>
        )}
        {playing && (
          <div
            className={styles.dots}
            data-tip="dots"
            role="img"
            aria-label={t('game.progress', { n: Math.min(session.solvedCount + 1, session.total), total: session.total })}
          >
            {Array.from({ length: session.total }, (_, i) => (
              <span key={i} className={cn(styles.dot, i < session.solvedCount && styles.dotDone, i >= session.baseTotal && styles.dotExtra)} aria-hidden />
            ))}
          </div>
        )}
      </div>
      {playing && (
        <div className={styles.hud}>
          <div className={styles.hudArtifacts}>
            <span className="emoji" aria-hidden>
              {theme.artifact.emoji}
            </span>{' '}
            {artifacts}
          </div>
        </div>
      )}
    </div>
  );
}
