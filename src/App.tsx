import { lazy, Suspense, type CSSProperties } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@/core/theme/ThemeProvider';
import { useActiveTheme } from '@/core/theme/useActiveTheme';
import { useAuthStore } from '@/core/auth/useAuthStore';
import { useGameStore } from '@/core/store/useGameStore';
import { useRemoteSync } from '@/core/sync/useRemoteSync';
import { getPortal } from '@/core/portal';
import { LoginPage } from '@/pages/LoginPage';
import { ChildLoginPage } from '@/pages/ChildLoginPage';
import { HubPage } from '@/pages/HubPage';
import { GamePage } from '@/pages/GamePage';
import { VaultPage } from '@/pages/VaultPage';
import { WorldPage } from '@/pages/WorldPage';
import { ParentPage } from '@/pages/ParentPage';
import { AudioPage } from '@/pages/AudioPage';
import { ChildSelectPage } from '@/pages/ChildSelectPage';
import { TimeHeader } from '@/components/layout/TimeHeader';
import { ThemeDecor } from '@/components/theme/ThemeDecor';

// Loaded on demand: the admin tool is never part of what a child downloads.
const AdminPage = lazy(() => import('@/pages/AdminPage').then((m) => ({ default: m.AdminPage })));

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
  // Reflect the active theme while loading; a new child (no theme yet) resolves
  // to the neutral galaxy default via useActiveTheme.
  const theme = useActiveTheme();
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
        {error ? '😿' : theme.icon}
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
  const children = useGameStore((s) => s.children);
  const activeChildId = useGameStore((s) => s.activeChildId);

  if (status === 'error') return <SyncSplash error />;
  if (status !== 'ready') return <SyncSplash />;

  const portal = getPortal();

  // Parent portal (parents.*): ONLY the parent cabinet — never the child hub,
  // so a parent never lands on "обери пригоду".
  if (portal === 'parent') {
    return (
      <Routes>
        <Route path="/parent" element={<ParentPage />} />
        <Route path="/parent/audio" element={<AudioPage />} />
        <Route path="*" element={<Navigate to="/parent" replace />} />
      </Routes>
    );
  }

  const hasChildren = children.length > 0;
  const activeOk = hasChildren && children.some((c) => c.id === activeChildId);
  // Only the dev host may reach the parent cabinet directly; the kid portal
  // (play.*) must never expose it.
  const canReachParent = portal === 'dev';
  const noActiveFallback = canReachParent && !hasChildren ? '/parent' : '/who';

  return (
    <Routes>
      {canReachParent && <Route path="/parent" element={<ParentPage />} />}
      {canReachParent && <Route path="/parent/audio" element={<AudioPage />} />}
      <Route path="/who" element={<ChildSelectPage />} />

      <Route path="/" element={activeOk ? <HubPage /> : <Navigate to={noActiveFallback} replace />} />
      <Route
        path="/play/:moduleId/:subId"
        element={activeOk ? <GamePage /> : <Navigate to={noActiveFallback} replace />}
      />
      <Route path="/world" element={activeOk ? <WorldPage /> : <Navigate to={noActiveFallback} replace />} />
      <Route path="/vault" element={activeOk ? <VaultPage /> : <Navigate to={noActiveFallback} replace />} />
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
  // `/login` is the CHILD credential login by default; on the parents.* portal
  // it's the parent email login. `/parent-login` is always the parent login
  // (so a parent can sign in on dev too).
  const loginElement = getPortal() === 'parent' ? <LoginPage /> : <ChildLoginPage />;

  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="app-shell">
          <ThemeDecor />
          <TimeHeader />
          <Routes>
            <Route path="/login" element={loginElement} />
            <Route path="/parent-login" element={<LoginPage />} />
            {/* Admin panel — guarded by the server-side ADMIN_KEY; the kids'
                portal (play.*) does not even mount the route. */}
            {getPortal() !== 'kid' && (
              <Route
                path="/admin/*"
                element={
                  <Suspense fallback={null}>
                    <AdminPage />
                  </Suspense>
                }
              />
            )}
            <Route path="/*" element={<ProtectedApp />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}
