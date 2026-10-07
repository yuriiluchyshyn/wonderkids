import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useGameStore } from '@/core/child/store/useGameStore';
import { useActiveTheme } from '@/core/theme/useActiveTheme';
import { useSound } from '@/core/audio/useSound';
import { subSteps, pathKey } from '@/core/child/progress/path';
import { hasChest } from '@/core/child/progress/treasures';
import type { CatalogEntry } from './catalog';
import styles from './PathModal.module.css';

interface PathModalProps {
  entry: CatalogEntry | null;
  onClose: () => void;
  /** Start a session for this entry at the chosen step. */
  onPlay: (entry: CatalogEntry, step: number) => void;
}

type GiftTier = 'small' | 'big' | 'biggest' | null;

/** Which (if any) progression gift sits on a given step. */
function giftTierFor(step: number, total: number): GiftTier {
  if (step === total) return 'biggest';
  if (step % 10 === 0) return 'big';
  if (step % 5 === 0) return 'small';
  return null;
}

const GIFT_EMOJI: Record<Exclude<GiftTier, null>, string> = {
  small: '🎀',
  big: '🎁',
  biggest: '🏆',
};

/**
 * Duolingo-style learning path: difficulty steps winding bottom→top. Steps are
 * themed collectibles with a progression gift every 5th (small 🎀), 10th (big
 * 🎁) and at the very end (biggest 🏆). The mascot sits on the current frontier;
 * the child may tap any step up to it to replay (higher ones are locked). Family
 * goals are NOT shown here — they live in the shared basket (Vault).
 */
export function PathModal({ entry, onClose, onPlay }: PathModalProps) {
  const theme = useActiveTheme();
  const { play, chime } = useSound();
  const current = useGameStore((s) =>
    entry ? (s.progress[pathKey(entry.module.id, entry.sub.id)] ?? 1) : 1,
  );

  const [selected, setSelected] = useState(current);
  const currentRef = useRef<HTMLDivElement>(null);

  // Reset the selection to the frontier each time the path opens.
  useEffect(() => {
    if (entry) setSelected(current);
  }, [entry, current]);

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
            Твій шлях — тисни на пройдену сходинку, щоб повторити. {theme.chest.closed} ховають
            скарби!
          </p>

          <div className={styles.path}>
            {steps.map((n) => {
              const unlocked = n <= current;
              const isCurrent = n === current;
              const isSelected = n === selected;
              const offset = Math.sin(n * 0.6) * 32;
              const gift = giftTierFor(n, totalSteps);
              const chest = hasChest(n, totalSteps);
              const fruit = theme.pathIcons[n % theme.pathIcons.length];
              const content = isCurrent
                ? theme.mascot.emoji
                : gift
                  ? GIFT_EMOJI[gift]
                  : chest
                    ? theme.chest.closed
                    : fruit;

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
                      gift === 'biggest' ? styles.biggest : gift === 'big' ? styles.big : '',
                      chest && !isCurrent ? styles.chest : '',
                      isSelected ? styles.selected : '',
                    ].join(' ')}
                    disabled={!unlocked}
                    animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1.4 }}
                    whileTap={unlocked ? { scale: 0.9 } : undefined}
                    onClick={() => selectStep(n)}
                    aria-label={`Сходинка ${n}${isCurrent ? ' (поточна)' : chest ? ' (захований скарб)' : unlocked ? '' : ' (закрито)'}`}
                  >
                    <span className="emoji" aria-hidden>
                      {content}
                    </span>
                    {!isCurrent && <span className={styles.badge}>{n}</span>}
                  </motion.button>
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
