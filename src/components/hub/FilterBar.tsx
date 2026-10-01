import { ALL_META } from '@/core/kernel/types';
import { moduleRegistry } from '@/core/kernel/ModuleRegistry';
import { Chip } from '@/components/ui/Chip';
import { VoiceToggle } from '@/components/ui/VoiceToggle';
import { useShowText } from '@/core/ui/useUiPrefs';
import { useVoiceSpeak } from '@/core/audio/useSpeech';
import type { CatalogFilters } from './catalog';
import styles from './FilterBar.module.css';

interface FilterBarProps {
  filters: CatalogFilters;
  onChange: (next: CatalogFilters) => void;
}

/**
 * Subject picker (PRD §3). Age and difficulty are gone from here — difficulty is
 * now the per-subject learning path. Icon-first and wrapping; each tap can be
 * read aloud for non-readers. Only shown when there's more than one subject.
 */
export function FilterBar({ filters, onChange }: FilterBarProps) {
  const subjects = moduleRegistry.getAll();
  const showText = useShowText();
  const announce = useVoiceSpeak('selections');

  if (subjects.length <= 1) return null;

  return (
    <div className={styles.group}>
      <div className={styles.headRow}>
        {showText && <span className={styles.head}>📚 Предмети</span>}
        <VoiceToggle channel="selections" />
      </div>
      <div className={styles.chips}>
        <Chip
          icon={ALL_META.icon}
          label={ALL_META.subjectLabel}
          showLabel={showText}
          active={filters.subjectId === 'all'}
          onClick={() => {
            onChange({ ...filters, subjectId: 'all' });
            announce('Усі предмети');
          }}
        />
        {subjects.map((m) => (
          <Chip
            key={m.id}
            icon={m.icon}
            label={m.title}
            showLabel={showText}
            active={filters.subjectId === m.id}
            onClick={() => {
              onChange({ ...filters, subjectId: m.id });
              announce(`Предмет ${m.title}`);
            }}
          />
        ))}
      </div>
    </div>
  );
}
