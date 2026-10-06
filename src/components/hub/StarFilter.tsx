import { DIFFICULTY_AGES, type Difficulty } from '@/core/kernel/types';
import { useVoiceSpeak } from '@/core/audio/useSpeech';
import { useShowText } from '@/core/ui/useUiPrefs';
import { cn } from '@/core/utils/cn';
import styles from './StarFilter.module.css';

interface StarFilterProps {
  value: Difficulty | null;
  onChange: (value: Difficulty | null) => void;
}

const LEVELS: Difficulty[] = [1, 2, 3];

/**
 * Difficulty filter above the planets: pick 1, 2 or 3 stars to see only the
 * games that suit that level (a game spanning several levels shows in each).
 */
export function StarFilter({ value, onChange }: StarFilterProps) {
  const showText = useShowText();
  const announce = useVoiceSpeak('selections');

  const pick = (next: Difficulty | null) => {
    announce(next ? `Складність: ${next} з трьох зірочок, ${DIFFICULTY_AGES[next]}` : 'Усі ігри');
    onChange(next);
  };

  return (
    <div className={styles.row} role="group" aria-label="Фільтр за складністю">
      <button
        type="button"
        className={cn(styles.chip, value === null && styles.active)}
        aria-pressed={value === null}
        onClick={() => pick(null)}
      >
        {showText ? 'Усі' : '✨'}
      </button>
      {LEVELS.map((level) => (
        <button
          key={level}
          type="button"
          className={cn(styles.chip, value === level && styles.active)}
          aria-pressed={value === level}
          aria-label={`${level} з 3 зірочок, ${DIFFICULTY_AGES[level]}`}
          onClick={() => pick(value === level ? null : level)}
        >
          <span className={styles.stars} aria-hidden>
            {'★'.repeat(level)}
          </span>
          {showText && <span className={styles.ages}>{DIFFICULTY_AGES[level]}</span>}
        </button>
      ))}
    </div>
  );
}
