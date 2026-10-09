import { useT } from '@/core/translator';
import { usePageMeta } from '@/core/app/seo/usePageMeta';
import { SubPageHeader } from '@/components/layout/SubPageHeader';
import { ParentDashboard } from '@/components/parent/ParentDashboard';

/** Settings page (profile, theme, audio, pacing, goals). Opened from the gear. */
export function ParentPage() {
  const t = useT();
  usePageMeta({ title: t('parentLogin.title') });
  return (
    <div className="page stack">
      <SubPageHeader title={t('page.settings')} icon="⚙️" backTo={null} />
      <ParentDashboard />
    </div>
  );
}
