import { Route, Routes } from 'react-router-dom';
import { SourcesPage } from './SourcesPage';
import { GamesPage } from './GamesPage';
import { Tabs } from './Table';

const TABS = [
  { to: '/admin/reports', label: '📊 Джерела' },
  { to: '/admin/reports/games', label: '🎮 Ігри' },
];

/**
 * `/admin/reports/*` — what is only read, a tab each: where the accounts come
 * from, and the summary of every game.
 */
export function ReportsPage({ adminKey }: { adminKey: string }) {
  return (
    <>
      <Tabs label="Звіти" tabs={TABS} />
      <Routes>
        <Route index element={<SourcesPage adminKey={adminKey} />} />
        <Route path="games" element={<GamesPage />} />
      </Routes>
    </>
  );
}
