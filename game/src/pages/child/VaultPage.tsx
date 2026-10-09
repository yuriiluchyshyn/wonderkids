import { useT } from '@/core/i18n';
import { usePageMeta } from '@/core/app/seo/usePageMeta';
import { SubPageHeader } from '@/components/layout/SubPageHeader';
import { TreasureVault } from '@/components/reward/TreasureVault';

/** The treasure/motivation page. */
export function VaultPage() {
  const t = useT();
  usePageMeta({ title: t('page.vault') });
  return (
    <div className="page stack">
      <SubPageHeader title={t('page.vault')} icon="💎" />
      <TreasureVault />
    </div>
  );
}
