import { usePageMeta } from '@/core/app/seo/usePageMeta';
import { SubPageHeader } from '@/components/layout/SubPageHeader';
import { WorldView } from '@/components/world/WorldView';

/** «Мій світ» — the town, lands and residents the child has earned. */
export function WorldPage() {
  usePageMeta({ title: 'Мій світ' });
  return (
    <div className="page stack">
      <SubPageHeader title="Мій світ" icon="🌍" />
      <WorldView />
    </div>
  );
}
