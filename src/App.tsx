import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@/core/theme/ThemeProvider';
import { HubPage } from '@/pages/HubPage';
import { GamePage } from '@/pages/GamePage';
import { VaultPage } from '@/pages/VaultPage';
import { ParentPage } from '@/pages/ParentPage';
import { AudioPage } from '@/pages/AudioPage';

/** Root application: theme side-effects + client routing. */
export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="app-shell">
          <Routes>
            <Route path="/" element={<HubPage />} />
            <Route path="/play/:moduleId/:subId" element={<GamePage />} />
            <Route path="/vault" element={<VaultPage />} />
            <Route path="/parent" element={<ParentPage />} />
            <Route path="/parent/audio" element={<AudioPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}
