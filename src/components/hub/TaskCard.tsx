import { motion } from 'framer-motion';
import { useActiveTheme } from '@/core/theme/useActiveTheme';
import { useShowText } from '@/core/ui/useUiPrefs';
import { useVoiceSpeak } from '@/core/audio/useSpeech';
import { useGameStore } from '@/core/store/useGameStore';
import { subSteps, pathKey } from '@/core/progress/path';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { cn } from '@/core/utils/cn';
import type { CatalogEntry } from './catalog';
import styles from './TaskCard.module.css';

interface TaskCardProps {
  entry: CatalogEntry;
  /** Opens the learning-path map for this card. */
  onStart: (entry: CatalogEntry) => void;
}

/** Catalog card: subject icon, path progress, and a button to open the path. */
export function TaskCard({ entry, onStart }: TaskCardProps) {
  const theme = useActiveTheme();
  const showText = useShowText();
  const announce = useVoiceSpeak('selections');
  const { module, sub } = entry;

  const step = useGameStore((s) => s.progress[pathKey(module.id, sub.id)] ?? 1);
  const totalSteps = subSteps(sub);

  const start = () => {
    announce(sub.label);
    onStart(entry);
  };

  return (
    <motion.article
      className={cn(styles.card, !showText && styles.compact)}
      layout
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
    >
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

      <Button icon="🗺️" block onClick={start} ariaLabel={`Відкрити шлях: ${sub.label}`}>
        {showText ? 'Мій шлях' : ''}
      </Button>
    </motion.article>
  );
}
