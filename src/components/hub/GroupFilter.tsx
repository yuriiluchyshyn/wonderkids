import type { GameGroup } from '@/core/game/kernel/types';
import { useVoiceSpeak } from '@/core/audio/useSpeech';
import { useShowText } from '@/core/app/ui/useUiPrefs';
import { cn } from '@/core/utils/cn';
import styles from './StarFilter.module.css';

interface GroupFilterProps {
  groups: GameGroup[];
  value: string | null;
  onChange: (value: string | null) => void;
}

/**
 * Chips for a galaxy whose games come in sets (the Language galaxy: a flag per
 * language). Unlike the star filter this one HIDES the other sets — a child
 * who came for one language should not scroll through the rest.
 */
export function GroupFilter({ groups, value, onChange }: GroupFilterProps) {
  const showText = useShowText();
  const announce = useVoiceSpeak('selections');

  const pick = (next: GameGroup | null) => {
    announce(next ? next.label : 'Усі ігри');
    onChange(next?.id ?? null);
  };

  return (
    <div className={styles.row} role="group" aria-label="Фільтр ігор">
      <button type="button" className={cn(styles.chip, value === null && styles.active)} aria-pressed={value === null} onClick={() => pick(null)}>
        {showText ? 'Усі' : '🌍'}
      </button>
      {groups.map((group) => (
        <button
          key={group.id}
          type="button"
          className={cn(styles.chip, value === group.id && styles.active)}
          aria-pressed={value === group.id}
          aria-label={group.label}
          onClick={() => pick(value === group.id ? null : group)}
        >
          <span className={cn(styles.flag, 'emoji')} aria-hidden>
            {group.icon}
          </span>
          {showText && <span className={styles.ages}>{group.label}</span>}
        </button>
      ))}
    </div>
  );
}
