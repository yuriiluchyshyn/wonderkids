import { useT, useVoiceLang } from '@/core/translator';
import { DIFFICULTY_AGES, type Difficulty } from '@/core/game/kernel/types';
import { useSayT } from '@/core/audio/useSpeech';
import { useShowText } from '@/core/app/ui/useUiPrefs';
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
  const t = useT();
  const showText = useShowText();
  const say = useSayT('selections');
  // The ages are said in the voice's language, like the phrase they stand in.
  const sayT = useT(useVoiceLang());
  const ages = (level: Difficulty) => t('ages.range', { from: DIFFICULTY_AGES[level][0], to: DIFFICULTY_AGES[level][1] });

  const pick = (next: Difficulty | null) => {
    if (next) say('hub.filter.starsSay', { count: next, ages: sayT('ages.said', { from: DIFFICULTY_AGES[next][0], to: DIFFICULTY_AGES[next][1] }) });
    else say('hub.filter.allGames');
    onChange(next);
  };

  return (
    <div className={styles.row} role="group" aria-label={t('hub.filter.stars')}>
      <button
        type="button"
        className={cn(styles.chip, value === null && styles.active)}
        aria-pressed={value === null}
        onClick={() => pick(null)}
      >
        {showText ? t('common.all') : '✨'}
      </button>
      {LEVELS.map((level) => (
        <button
          key={level}
          type="button"
          className={cn(styles.chip, value === level && styles.active)}
          aria-pressed={value === level}
          aria-label={t('hub.filter.starsLabel', { stars: level, ages: ages(level) })}
          onClick={() => pick(value === level ? null : level)}
        >
          <span className={styles.stars} aria-hidden>
            {'★'.repeat(level)}
          </span>
          {showText && <span className={styles.ages}>{ages(level)}</span>}
        </button>
      ))}
    </div>
  );
}
