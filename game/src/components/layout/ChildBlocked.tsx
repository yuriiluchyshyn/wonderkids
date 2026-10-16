import { useAuthStore } from '@/core/account/auth/useAuthStore';
import { useT } from '@/core/translator';
import { Button } from '@/components/ui/Button';
import { SpaceScreen } from '@/components/ui/SpaceLoader';

/**
 * What a child sees while the children's accounts are paused (there are more of
 * them than the parents' plan has room for): no reproach, no numbers — the
 * fuel is out, go to the grown-ups. The parents' cabinet says what to do.
 */
export function ChildBlocked() {
  const t = useT();
  const logout = useAuthStore((s) => s.logout);
  return (
    <SpaceScreen>
      <span className="emoji" style={{ fontSize: '3.5rem' }} aria-hidden>
        🚀💤
      </span>
      <h1 style={{ fontSize: '1.6rem' }}>{t('childBlocked.title')}</h1>
      <p style={{ maxWidth: '24em', fontSize: '1.15rem' }}>{t('childBlocked.message')}</p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button size="lg" icon="🔄" onClick={() => window.location.reload()}>
          {t('childBlocked.retry')}
        </Button>
        <Button size="lg" variant="ghost" icon="🏃" onClick={logout}>
          {t('rest.goRest')}
        </Button>
      </div>
    </SpaceScreen>
  );
}
