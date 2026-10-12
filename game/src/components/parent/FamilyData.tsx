import { CONTACT_EMAIL } from '@pulsar/platform';
import { useState } from 'react';
import { api } from '@/core/account/api/client';
import { useAuthStore } from '@/core/account/auth/useAuthStore';
import { useT } from '@/core/translator';
import { Button } from '@/components/ui/Button';
import { LegalLinks } from '@/components/legal/LegalLinks';
import styles from './Parent.module.css';

/** The file a parent takes away: everything the server keeps for the account, as it would hand it to the game. */
const EXPORT_NAME = 'pulsar-kids-data.json';

function saveAsFile(name: string, content: unknown): void {
  const url = URL.createObjectURL(new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/**
 * «Your family's data» in the parents' area — what the privacy policy on the
 * site promises a parent can do without writing a letter: take a copy of
 * everything kept for the account (GDPR art. 15 and 20) and delete the
 * account with every child's profile and progress (art. 17). Deleting asks
 * once more first: there is no way back.
 */
export function FamilyData() {
  const t = useT();
  const token = useAuthStore((s) => s.token);
  const email = useAuthStore((s) => s.user?.email) ?? '';
  const logout = useAuthStore((s) => s.logout);
  const [copy, setCopy] = useState<'idle' | 'busy' | 'failed'>('idle');
  const [removal, setRemoval] = useState<'idle' | 'asked' | 'busy' | 'failed'>('idle');

  if (!token) return null;

  const download = async () => {
    if (copy === 'busy') return;
    setCopy('busy');
    try {
      // Asked of the server, not taken from the screen: unsaved edits are not what is kept.
      const { state } = await api.getState<unknown>(token);
      saveAsFile(EXPORT_NAME, { exportedAt: new Date().toISOString(), account: { email }, data: state });
      setCopy('idle');
    } catch {
      setCopy('failed');
    }
  };

  const remove = async () => {
    setRemoval('busy');
    try {
      await api.deleteAccount(token);
      // Nothing is left to be signed in to: the device is wiped like after a sign-out.
      logout();
    } catch {
      setRemoval('failed');
    }
  };

  const asked = removal !== 'idle';

  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>{t('parent.data.title')}</h3>
      <p className={styles.hint}>{copy === 'failed' ? t('parent.data.exportFailed') : t('parent.data.hint')}</p>
      <Button block variant="ghost" icon="📥" onClick={download} disabled={copy === 'busy'}>
        {copy === 'busy' ? t('parent.data.exporting') : t('parent.data.export')}
      </Button>

      {asked ? (
        <div role="alert" style={{ marginTop: 12 }}>
          <p className={styles.hint} style={{ marginTop: 0 }}>
            {removal === 'failed' ? t('parent.data.deleteFailed', { contact: CONTACT_EMAIL }) : t('parent.data.confirm', { email })}
          </p>
          <Button block icon="↩️" onClick={() => setRemoval('idle')} disabled={removal === 'busy'}>
            {t('parent.data.confirmNo')}
          </Button>
          <div style={{ marginTop: 8 }}>
            <Button block variant="ghost" icon="🗑️" onClick={remove} disabled={removal === 'busy'}>
              {removal === 'busy' ? t('parent.data.deleting') : t('parent.data.confirmYes')}
            </Button>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 8 }}>
          <Button block variant="ghost" icon="🗑️" onClick={() => setRemoval('asked')}>
            {t('parent.data.delete')}
          </Button>
        </div>
      )}

      <LegalLinks />
    </section>
  );
}
