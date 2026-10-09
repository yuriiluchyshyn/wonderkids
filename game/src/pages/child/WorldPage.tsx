import { useT } from '@/core/translator';
import { usePageMeta } from '@/core/app/seo/usePageMeta';
import { SubPageHeader } from '@/components/layout/SubPageHeader';
import { WorldView } from '@/components/world/WorldView';

/** «Мій світ» — the town, stations of knowledge and residents the child has earned. */
export function WorldPage() {
  const t = useT();
  usePageMeta({ title: t('page.world') });
  return (
    <div className="page stack">
      <SubPageHeader title={t('page.world')} icon="🌍" />
      <WorldView />
    </div>
  );
}
