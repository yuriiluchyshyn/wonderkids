import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useGameStore } from '@/core/store/useGameStore';
import { useActiveTheme } from '@/core/theme/useActiveTheme';
import { useSound } from '@/core/audio/useSound';
import { subSteps, pathKey } from '@/core/progress/path';
import type { CatalogEntry } from './catalog';
import styles from './PathModal.module.css';

interface PathModalProps {
  entry: CatalogEntry | null;
  onClose: () => void;
  /** Start a session for this entry at the chosen step. */
  onPlay: (entry: CatalogEntry, step: number) => void;
}

/**
 * Duolingo-style learning path: 50 difficulty steps winding bottom→top. Steps
 * are themed collectibles (apple, pear…) with a number every fifth step. The
 * mascot sits on the current frontier; the child may tap any step up to the
 * frontier to replay it (higher ones are locked). Parent milestones show 🎁.
 */
export function PathModal({ entry, onClose, onPlay }: PathModalProps) {
  const theme = useActiveTheme();
  const { play, chime } = useSound();
  const milestones = useGameStore((s) => s.milestones);
  const current = useGameStore((s) =>
    entry ? (s.progress[pathKey(entry.module.id, entry.sub.id)] ?? 1) : 1,
  );

  const [selected, setSelected] = useState(current);
  const currentRef = useRef<HTMLDivElement>(null);

  // Reset the selection to the frontier each time the path opens.
  useEffect(() => {
    if (entry) setSelected(current);
  }, [entry, current]);

  const milestoneByStep = useMemo(() => {
    const map = new Map<number, string>();
    milestones.forEach((m) => map.set(m.step, m.reward));
    return map;
  }, [milestones]);

  // Hardest at top → easiest (1) at bottom, so the child climbs. Length is
  // per-adventure.
  const totalSteps = entry ? subSteps(entry.sub) : 0;
  const steps = useMemo(
    () => Array.from({ length: totalSteps }, (_, i) => totalSteps - i),
    [totalSteps],
  );

  useEffect(() => {
    if (!entry) return;
    const t = window.setTimeout(() => {
      currentRef.current?.scrollIntoView({ behavior: 'auto', block: 'center' });
    }, 60);
    return () => window.clearTimeout(t);
  }, [entry]);

  const selectStep = (n: number) => {
    if (n > current) return; // locked — can't jump ahead
    play('tap');
    chime(n % 6);
    setSelected(n);
  };

  return (
    <Modal open={entry !== null} onClose={onClose} title={entry ? entry.sub.label : ''} icon={entry?.sub.icon}>
      {entry && (
        <>
          <p className={styles.caption}>
            Твій шлях — тисни на будь-яку пройдену сходинку, щоб повторити 😊
          </p>

          <div className={styles.path}>
            {steps.map((n) => {
              const unlocked = n <= current;
              const isCurrent = n === current;
              const isSelected = n === selected;
              const reward = milestoneByStep.get(n);
              const offset = Math.sin(n * 0.6) * 32;
              const fruit = theme.pathIcons[n % theme.pathIcons.length];
              const showNumber = n % 5 === 0;

              const content = isCurrent ? theme.mascot.emoji : showNumber ? n : fruit;

              return (
                <div
                  key={n}
                  className={styles.nodeRow}
                  style={{ transform: `translateX(${offset}px)` }}
                  ref={isCurrent ? currentRef : undefined}
                >
                  <motion.button
                    className={[
                      styles.node,
                      isCurrent ? styles.current : unlocked ? styles.done : styles.locked,
                      isSelected ? styles.selected : '',
                    ].join(' ')}
                    disabled={!unlocked}
                    animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1.4 }}
                    whileTap={unlocked ? { scale: 0.9 } : undefined}
                    onClick={() => selectStep(n)}
                    aria-label={`Сходинка ${n}${isCurrent ? ' (поточна)' : unlocked ? '' : ' (закрито)'}`}
                  >
                    <span className="emoji" aria-hidden>
                      {content}
                    </span>
                    {!showNumber && !isCurrent && <span className={styles.badge}>{n}</span>}
                  </motion.button>

                  {reward && (
                    <span className={`${styles.reward} ${!unlocked ? styles.rewardLocked : ''}`}>
                      🎁 {reward}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <Button size="lg" icon="▶️" block onClick={() => onPlay(entry, selected)}>
            Грати
          </Button>
        </>
      )}
    </Modal>
  );
}
