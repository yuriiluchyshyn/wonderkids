import { useState } from 'react';
import { childrenIncluded, type Catalog } from '@pulsar/plans';
import { api, ApiError, billingApi, type PlanState } from '@/core/account/api/client';
import { useAuthStore } from '@/core/account/auth/useAuthStore';
import { selectPersistable, useGameStore } from '@/core/child/store/useGameStore';
import { useT } from '@/core/translator';
import { Dialog } from './Dialog';
import styles from './Paywall.module.css';

const AVATAR: Record<string, string> = { girl: '👧', boy: '👦' };

type Stage = 'pick' | 'working' | 'done';

/**
 * Removing a child from the plan. Where the plan has a place that no profile
 * fills, only that place is given up (Stripe counts the unused days into the
 * next invoice). Where every place has a profile in it, the parent is asked WHICH
 * child to remove: that profile and everything of it is deleted for good, and —
 * if the plan has more places than its package includes — its place goes too.
 */
export function RemoveChildDialog({ plan, catalog, onClose, onDone }: {
  /** The plan as the server has it now. */
  plan: NonNullable<PlanState['plan']>;
  catalog: Catalog | null;
  onClose: () => void;
  onDone: (state: PlanState) => void;
}) {
  const t = useT();
  const token = useAuthStore((s) => s.token);
  const profiles = useGameStore((s) => s.children);
  const removeChild = useGameStore((s) => s.removeChild);

  const places = plan.children ?? profiles.length;
  const included = catalog ? childrenIncluded(catalog) : 1;
  const canShrink = places > included;
  const hasFreePlace = profiles.length < places;

  const [chosen, setChosen] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>('pick');
  const [error, setError] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<'place' | 'child'>('place');

  const words = (err: unknown) => (err instanceof ApiError && err.text) || t('billing.checkout.error');
  const kids = (count: number) => t('billing.kids', { count });

  const giveUpPlace = async () => {
    if (!token) return;
    onDone(await billingApi.change(token, { children: places - 1 }));
  };

  const run = async () => {
    if (!token) return;
    setStage('working');
    setError(null);
    const child = profiles.find((c) => c.id === chosen);
    let deleted = false;
    try {
      if (!hasFreePlace && child) {
        // The profile goes first (the server will not let a place go while a profile is in it).
        removeChild(child.id);
        await api.putState(token, selectPersistable(useGameStore.getState()));
        deleted = true;
      }
      if (canShrink) await giveUpPlace();
      setOutcome(deleted ? 'child' : 'place');
      setStage('done');
    } catch (err) {
      // If the profile is already gone the parent is told so: only the place of the plan is left to give up.
      setError(deleted ? `${t('billing.remove.profileGone')} ${words(err)}` : words(err));
      setStage('pick');
    }
  };

  if (stage === 'working') {
    return (
      <Dialog title={t('billing.remove.title')} locked onClose={onClose}>
        <p className={styles.dialogText}>{t('billing.remove.working')}</p>
      </Dialog>
    );
  }

  if (stage === 'done') {
    return (
      <Dialog title={t('billing.remove.doneTitle')} onClose={onClose}>
        <p className={styles.dialogText}>{outcome === 'child' ? t('billing.remove.doneChild') : t('billing.remove.donePlace')}</p>
        <div className={styles.dialogActions}>
          <button type="button" className={styles.primary} onClick={onClose}>
            {t('billing.add.close')}
          </button>
        </div>
      </Dialog>
    );
  }

  // Nothing to take away: the package's own places stay, and no profile is in the way.
  if (hasFreePlace && !canShrink) {
    return (
      <Dialog title={t('billing.remove.title')} onClose={onClose}>
        <p className={styles.dialogText}>{t('billing.remove.nothing', { included: kids(included) })}</p>
        <div className={styles.dialogActions}>
          <button type="button" className={styles.primary} onClick={onClose}>
            {t('billing.add.close')}
          </button>
        </div>
      </Dialog>
    );
  }

  // A place no profile fills: only the place goes.
  if (hasFreePlace) {
    return (
      <Dialog title={t('billing.remove.title')} onClose={onClose}>
        <p className={styles.dialogText}>{t('billing.remove.freePlace', { places: kids(places), profiles: profiles.length, after: kids(places - 1) })}</p>
        <p className={styles.dialogText}>{t('billing.remove.credit')}</p>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.dialogActions}>
          <button type="button" className={styles.secondary} onClick={onClose}>
            {t('billing.dialog.cancel')}
          </button>
          <button type="button" className={styles.primary} onClick={() => void run()}>
            {t('billing.remove.givePlace')}
          </button>
        </div>
      </Dialog>
    );
  }

  // Every place has a child in it: which one goes?
  const child = profiles.find((c) => c.id === chosen);
  return (
    <Dialog title={t('billing.remove.title')} onClose={onClose}>
      <p className={styles.dialogText}>{t('billing.remove.choose')}</p>
      <div className={styles.pickList} role="radiogroup" aria-label={t('billing.remove.choose')}>
        {profiles.map((c) => (
          <button key={c.id} type="button" role="radio" aria-checked={chosen === c.id} className={chosen === c.id ? `${styles.pickItem} ${styles.pickItemOn}` : styles.pickItem} onClick={() => setChosen(c.id)}>
            <span className="emoji" aria-hidden>
              {AVATAR[c.profile.gender] ?? AVATAR.girl}
            </span>
            <span>
              <b>{c.profile.name}</b>
              {c.profile.nickname && <small> @{c.profile.nickname}</small>}
            </span>
          </button>
        ))}
      </div>
      {child && <p className={styles.warn}>{t('billing.remove.warn', { name: child.profile.name })}</p>}
      {child && canShrink && <p className={styles.dialogText}>{t('billing.remove.credit')}</p>}
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.dialogActions}>
        <button type="button" className={styles.secondary} onClick={onClose}>
          {t('billing.dialog.cancel')}
        </button>
        <button type="button" className={styles.danger} disabled={!child} onClick={() => void run()}>
          {child ? t('billing.remove.confirm', { name: child.profile.name }) : t('billing.remove.confirmNone')}
        </button>
      </div>
    </Dialog>
  );
}
