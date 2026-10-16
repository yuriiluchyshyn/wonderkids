import { useState } from 'react';
import { api, ApiError } from '@/core/account/api/client';
import { useAuthStore } from '@/core/account/auth/useAuthStore';
import { selectPersistable, useGameStore } from '@/core/child/store/useGameStore';
import { useT } from '@/core/translator';
import { Dialog } from './Dialog';
import styles from './Paywall.module.css';

const AVATAR: Record<string, string> = { girl: '👧', boy: '👦' };

/**
 * Which children stay. The parent ticks those to delete; «Підтвердити» is
 * enabled only when exactly `keep` are left (one, on the free plan). Their
 * profiles and everything of theirs are deleted for good, at once. Used when the
 * parent moves to the Basic plan, and when there are more children than the
 * plan has room for (then the children's accounts are paused until this is done).
 */
export function TrimChildrenDialog({ keep, downgrade, onClose, onDone }: {
  /** How many children may be left. */
  keep: number;
  /** The parent is moving to the free plan (said in the text). */
  downgrade?: boolean;
  onClose: () => void;
  onDone: () => void;
}) {
  const t = useT();
  const token = useAuthStore((s) => s.token);
  const profiles = useGameStore((s) => s.children);
  const removeChild = useGameStore((s) => s.removeChild);
  const [gone, setGone] = useState<Set<string>>(() => new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const left = profiles.length - gone.size;
  const target = Math.min(keep, profiles.length);
  const ready = left === target;

  const toggle = (id: string) =>
    setGone((was) => {
      const next = new Set(was);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  const approve = async () => {
    if (!token || !ready) return;
    setBusy(true);
    setError(null);
    try {
      for (const id of gone) removeChild(id);
      await api.putState(token, selectPersistable(useGameStore.getState()));
      onDone();
    } catch (err) {
      setError((err instanceof ApiError && err.text) || t('billing.checkout.error'));
      setBusy(false);
    }
  };

  return (
    <Dialog title={t('billing.trim.title')} locked={busy} onClose={onClose}>
      <p className={styles.dialogText}>{downgrade ? t('billing.trim.downgrade', { kids: t('billing.kids', { count: keep }) }) : t('billing.trim.over', { kids: t('billing.kids', { count: keep }) })}</p>
      <div className={styles.pickList}>
        {profiles.map((c) => {
          const marked = gone.has(c.id);
          return (
            <label key={c.id} className={marked ? `${styles.pickItem} ${styles.pickItemOn}` : styles.pickItem}>
              <input type="checkbox" checked={marked} disabled={busy} onChange={() => toggle(c.id)} aria-label={t('billing.trim.mark', { name: c.profile.name })} />
              <span className="emoji" aria-hidden>
                {AVATAR[c.profile.gender] ?? AVATAR.girl}
              </span>
              <span>
                <b>{c.profile.name}</b>
                {c.profile.nickname && <small> @{c.profile.nickname}</small>}
              </span>
              <small style={{ marginLeft: 'auto' }}>{marked ? t('billing.trim.willGo') : t('billing.trim.stays')}</small>
            </label>
          );
        })}
      </div>
      <p className={ready ? styles.dialogText : styles.warn}>{t('billing.trim.left', { left, keep: target })}</p>
      {gone.size > 0 && <p className={styles.warn}>{t('billing.trim.warn')}</p>}
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.dialogActions}>
        <button type="button" className={styles.secondary} disabled={busy} onClick={onClose}>
          {t('billing.dialog.cancel')}
        </button>
        <button type="button" className={styles.danger} disabled={!ready || busy} onClick={() => void approve()}>
          {busy ? t('billing.add.paying') : t('billing.trim.approve')}
        </button>
      </div>
    </Dialog>
  );
}
