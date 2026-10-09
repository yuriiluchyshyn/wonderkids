import { useState } from 'react';
import type { GameGroup } from '@/core/game/kernel/types';
import { useSayT, useVoiceSpeak } from '@/core/audio/useSpeech';
import { useShowText } from '@/core/app/ui/useUiPrefs';
import { useT } from '@/core/translator';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/core/utils/cn';
import styles from './StarFilter.module.css';

interface GroupFilterProps {
  groups: GameGroup[];
  /** The sets shown; none chosen — all of them. */
  value: string[];
  onChange: (value: string[]) => void;
}

/**
 * The filter of a galaxy whose games come in sets (the Language galaxy: one
 * per language). One chip shows what is chosen; tapping it opens a sheet where
 * the child ticks the sets they want — several at once. Unlike the star filter
 * this one HIDES the rest: a child who came for one language should not scroll
 * through the others. With nothing ticked every set is shown.
 */
export function GroupFilter({ groups, value, onChange }: GroupFilterProps) {
  const t = useT();
  const showText = useShowText();
  const say = useSayT('selections');
  const announce = useVoiceSpeak('selections');
  const [open, setOpen] = useState(false);

  const chosen = groups.filter((g) => value.includes(g.id));
  const toggle = (group: GameGroup) => {
    const on = !value.includes(group.id);
    if (on) announce(group.label);
    onChange(on ? [...value, group.id] : value.filter((id) => id !== group.id));
  };
  const showAll = () => {
    say('hub.filter.allGames');
    onChange([]);
  };

  return (
    <div className={styles.row} role="group" aria-label={t('hub.filter.games')}>
      <button type="button" className={cn(styles.chip, chosen.length > 0 && styles.active)} aria-haspopup="dialog" aria-label={t('hub.groups.label')} onClick={() => setOpen(true)}>
        <span className={cn(styles.flag, 'emoji')} aria-hidden>
          {chosen.length > 0 ? chosen.map((g) => g.icon).join(' ') : '🌍'}
        </span>
        {showText && <span className={styles.ages}>{chosen.length === 1 ? chosen[0].label : chosen.length === 0 ? t('common.all') : ''}</span>}
        <span aria-hidden>▾</span>
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={t('hub.groups.title')} icon="🌍">
        <div className={styles.sheet}>
          <label className={styles.option}>
            <input type="checkbox" className={styles.check} checked={chosen.length === 0} onChange={showAll} />
            <span className={cn(styles.flag, 'emoji')} aria-hidden>
              🌍
            </span>
            {t('hub.filter.allGames')}
          </label>
          {groups.map((group) => (
            <label key={group.id} className={styles.option}>
              <input type="checkbox" className={styles.check} checked={value.includes(group.id)} onChange={() => toggle(group)} />
              <span className={cn(styles.flag, 'emoji')} aria-hidden>
                {group.icon}
              </span>
              {group.label}
            </label>
          ))}
          <Button block icon="✅" onClick={() => setOpen(false)}>
            {t('common.done')}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
