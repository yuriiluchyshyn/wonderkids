import { usePageMeta } from '@/core/seo/usePageMeta';
import { SubPageHeader } from '@/components/layout/SubPageHeader';
import { TreasureVault } from '@/components/reward/TreasureVault';

/** The treasure/motivation page. */
export function VaultPage() {
  usePageMeta({ title: 'Скарбничка' });
  return (
    <div className="page stack">
      <SubPageHeader title="Скарбничка" icon="💎" />
      <TreasureVault />
    </div>
  );
}
