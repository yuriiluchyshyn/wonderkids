import { useT } from '@/core/i18n';
import { useEffect, useState } from 'react';
import type { Milestone } from '@/core/child/store/useGameStore';
import styles from './Parent.module.css';

interface GoalRowProps {
  goal: Milestone;
  /** The theme's artifact emoji (💎, ⚙️…). */
  artifact: string;
  onChange: (patch: Partial<Milestone>) => void;
  onRemove: () => void;
}

/**
 * One family goal in the parent cabinet. The reward — what the goal IS — gets
 * the full width on top; the price and the delete button sit on a second row,
 * so on a phone the text is never squeezed into a sliver.
 *
 * The amount is edited as free text and only committed when the field loses
 * focus: the parent can clear it and type a new number (a controlled numeric
 * field would snap an empty value back to 1), and the list is not re-sorted
 * under their fingers while they type.
 */
export function GoalRow({ goal, artifact, onChange, onRemove }: GoalRowProps) {
  const t = useT();
  const [amount, setAmount] = useState(String(goal.amount));

  // Follow outside changes (another goal re-sorted, values loaded from the server).
  useEffect(() => setAmount(String(goal.amount)), [goal.amount]);

  const commit = () => {
    const value = Math.round(Number(amount));
    if (Number.isFinite(value) && value >= 1) onChange({ amount: value });
    else setAmount(String(goal.amount)); // empty or nonsense → keep what it was
  };

  return (
    <div className={styles.goal}>
      <label className={styles.goalReward}>
        <span className={styles.stepLabel}>{t('parent.goals.reward')}</span>
        <input
          className={styles.textInput}
          value={goal.reward}
          placeholder={t('parent.goals.rewardPlaceholder')}
          onChange={(e) => onChange({ reward: e.target.value })}
        />
      </label>
      <label className={styles.goalAmount}>
        <span className={styles.stepLabel}>{t('parent.goals.amount', { artifact })}</span>
        <input
          className={styles.textInput}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/\D/g, '').slice(0, 6))}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur();
          }}
          aria-label={t('parent.goals.amountLabel', { reward: goal.reward || t('parent.goals.unnamed') })}
        />
      </label>
      <button type="button" className={styles.removeBtn} onClick={onRemove} aria-label={t('parent.goals.removeLabel', { reward: goal.reward || t('parent.goals.unnamed') })}>
        🗑️
      </button>
    </div>
  );
}
