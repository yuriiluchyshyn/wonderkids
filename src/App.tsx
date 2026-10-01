import type { CSSProperties } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@/core/theme/ThemeProvider';
import { useAuthStore } from '@/core/auth/useAuthStore';
import { useRemoteSync } from '@/core/sync/useRemoteSync';
import { LoginPage } from '@/pages/LoginPage';
import { HubPage } from '@/pages/HubPage';
import { GamePage } from '@/pages/GamePage';
import { VaultPage } from '@/pages/VaultPage';
import { ParentPage } from '@/pages/ParentPage';
import { AudioPage } from '@/pages/AudioPage';

const splashBtn: CSSProperties = {
  minHeight: 48,
  padding: '0 20px',
  borderRadius: 'var(--radius)',
  border: 'none',
  fontFamily: 'inherit',
  fontSize: '1rem',
  fontWeight: 700,
  color: 'var(--on-primary, #fff)',
  background: 'var(--primary, #7c3aed)',
  cursor: 'pointer',
};

/** Full-screen message shown while the save loads (or fails to) after login. */
function SyncSplash({ error }: { error?: boolean }) {
  const logout = useAuthStore((s) => s.logout);
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        textAlign: 'center',
        padding: 24,
      }}
    >
      <span className="emoji" style={{ fontSize: '3rem' }} aria-hidden>
        {error ? '😿' : '🦄'}
      </span>
      {error ? (
        <>
          <p style={{ fontWeight: 700 }}>Не вдалося завантажити твій прогрес.</p>
          <p className="muted">Перевір, чи увімкнений сервер, і спробуй ще раз.</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button type="button" style={splashBtn} onClick={() => window.location.reload()}>
              Спробувати ще раз
            </button>
            <button type="button" style={{ ...splashBtn, opacity: 0.7 }} onClick={logout}>
              Вийти
            </button>
          </div>
        </>
      ) : (
        <p style={{ fontWeight: 700 }}>Завантажуємо твою пригоду…</p>
      )}
    </div>
  );
}

/** Routes available only once a save is loaded for the signed-in user. */
function SyncedRoutes() {
  const status = useRemoteSync();

  if (status === 'error') return <SyncSplash error />;
  if (status !== 'ready') return <SyncSplash />;

  return (
    <Routes>
      <Route path="/" element={<HubPage />} />
      <Route path="/play/:moduleId/:subId" element={<GamePage />} />
      <Route path="/vault" element={<VaultPage />} />
      <Route path="/parent" element={<ParentPage />} />
      <Route path="/parent/audio" element={<AudioPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/** Gate: require a session, otherwise send the user to the login screen. */
function ProtectedApp() {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <SyncedRoutes />;
}

/** Root application: theme side-effects + client routing + auth gate. */
export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="app-shell">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/*" element={<ProtectedApp />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}
