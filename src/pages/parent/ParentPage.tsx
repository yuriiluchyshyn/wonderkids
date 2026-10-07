import { usePageMeta } from '@/core/app/seo/usePageMeta';
import { SubPageHeader } from '@/components/layout/SubPageHeader';
import { ParentDashboard } from '@/components/parent/ParentDashboard';

/** Settings page (profile, theme, audio, pacing, goals). Opened from the gear. */
export function ParentPage() {
  usePageMeta({ title: 'Кабінет батьків' });
  return (
    <div className="page stack">
      <SubPageHeader title="Налаштування" icon="⚙️" backTo={null} />
      <ParentDashboard />
    </div>
  );
}
