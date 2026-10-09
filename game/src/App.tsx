import { LangProvider, useGameLang, useParentLang, useT } from '@/core/translator';
import { lazy, Suspense, useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { VoiceGuard } from '@/core/audio/voice';
import { ThemeProvider } from '@/core/theme/ThemeProvider';
import { useAuthStore } from '@/core/account/auth/useAuthStore';
import { useGameStore } from '@/core/child/store/useGameStore';
import { useRemoteSync } from '@/core/account/sync/useRemoteSync';
import { getPortal, portalUrl } from '@/core/app/portal';
import { demoTick, seatGuest, useDemo } from '@/core/app/demo';
import { DemoOver } from '@/components/demo/DemoOver';
import { LoginPage } from '@/pages/auth/LoginPage';
import { ChildLoginPage } from '@/pages/auth/ChildLoginPage';
import { HubPage } from '@/pages/child/HubPage';
import { GamePage } from '@/pages/child/GamePage';
import { VaultPage } from '@/pages/child/VaultPage';
import { WorldPage } from '@/pages/child/WorldPage';
import { ParentPage } from '@/pages/parent/ParentPage';
import { AudioPage } from '@/pages/child/AudioPage';
import { ChildSelectPage } from '@/pages/auth/ChildSelectPage';
import { TimeHeader } from '@/components/layout/TimeHeader';
import { SpaceLoader } from '@/components/ui/SpaceLoader';
import { ThemeDecor } from '@/components/theme/ThemeDecor';

// Loaded on demand: the admin tool is never part of what a child downloads.
const AdminPage = lazy(() => import('@/pages/admin/AdminPage').then((m) => ({ default: m.AdminPage })));

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
  const t = useT();
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
      {error ? (
        <span className="emoji" style={{ fontSize: '3rem' }} aria-hidden>
          😿
        </span>
      ) : (
        <SpaceLoader label={t('app.loading')} />
      )}
      {error ? (
        <>
          <p style={{ fontWeight: 700 }}>{t('app.loadFailed')}</p>
          <p className="muted">{t('app.loadFailedHint')}</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button type="button" style={splashBtn} onClick={() => window.location.reload()}>
              {t('common.retry')}
            </button>
            <button type="button" style={{ ...splashBtn, opacity: 0.7 }} onClick={logout}>
              {t('common.logout')}
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}

/**
 * The language of a part of the app. The child's screens are in the language
 * of the child's game, the parents' in the cabinet's; before anyone has signed
 * in (and on the login pages) it is the language offered to this device.
 */
function InLang({ of, children }: { of: 'game' | 'parent'; children: ReactNode }) {
  const game = useGameLang();
  const parent = useParentLang();
  return <LangProvider lang={of === 'parent' ? parent : game}>{children}</LangProvider>;
}

/** Routes available only once a save is loaded for the signed-in user. */
function SyncedRoutes() {
  const status = useRemoteSync();
  const children = useGameStore((s) => s.children);
  const activeChildId = useGameStore((s) => s.activeChildId);

  const portal = getPortal();

  if (status === 'error') return <SyncSplash error />;
  if (status !== 'ready') return <SyncSplash />;

  // Parent portal (parents.*): ONLY the parent cabinet — never the child hub,
  // so a parent never lands on "обери пригоду".
  if (portal === 'parent') {
    return (
      <InLang of="parent">
        <Routes>
          <Route path="/parent" element={<ParentPage />} />
          <Route path="/parent/audio" element={<AudioPage />} />
          <Route path="*" element={<Navigate to="/parent" replace />} />
        </Routes>
      </InLang>
    );
  }

  const hasChildren = children.length > 0;
  const activeOk = hasChildren && children.some((c) => c.id === activeChildId);
  // Only the dev host may reach the parent cabinet directly; the kid portal
  // (play.*) must never expose it.
  const canReachParent = portal === 'dev';
  const noActiveFallback = canReachParent && !hasChildren ? '/parent' : '/who';

  return (
    <InLang of="game">
    <Routes>
      {canReachParent && <Route path="/parent" element={<InLang of="parent"><ParentPage /></InLang>} />}
      {canReachParent && <Route path="/parent/audio" element={<InLang of="parent"><AudioPage /></InLang>} />}
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
    </InLang>
  );
}

/** How often the trial's clock looks at the time. */
const DEMO_TICK_MS = 1000;

/**
 * The trial game (`core/app/demo.ts`): the child's screens for a guest who
 * lives in memory — no account, no save, no server clock. Its own clock runs
 * while the page is on the screen; when the time is up the game is taken off
 * the screen, wherever it was, and `DemoOver` takes its place.
 */
function DemoRoutes() {
  const expired = useDemo((s) => s.expired);
  const [seated, setSeated] = useState(false);

  useEffect(() => {
    seatGuest();
    setSeated(true);
  }, []);

  useEffect(() => {
    let last = Date.now();
    const id = window.setInterval(() => {
      const now = Date.now();
      // A hidden page plays nothing; a long gap is a sleeping phone, not play.
      if (!document.hidden) demoTick(Math.min(now - last, 2 * DEMO_TICK_MS));
      last = now;
    }, DEMO_TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  if (!seated) return null;
  if (expired) {
    return (
      <InLang of="game">
        <DemoOver />
      </InLang>
    );
  }
  return (
    <InLang of="game">
      <Routes>
        <Route path="/" element={<HubPage />} />
        <Route path="/play/:moduleId/:subId" element={<GamePage />} />
        <Route path="/world" element={<WorldPage />} />
        <Route path="/vault" element={<VaultPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </InLang>
  );
}

/** Gate: require a session — or a trial game —, otherwise send the user to the login screen. */
function ProtectedApp() {
  const token = useAuthStore((s) => s.token);
  const demo = useDemo((s) => s.active);
  if (!token) return demo ? <DemoRoutes /> : <Navigate to="/login" replace />;
  return <SyncedRoutes />;
}

/**
 * The child portal has no parent cabinet, so a parent who signs in there has
 * nowhere to land (they would end up on the child picker). Its «Вхід для
 * батьків» leads here, and from here to the parents' own portal.
 */
function ToParentLogin() {
  useEffect(() => {
    window.location.replace(portalUrl('parent', '/parent-login'));
  }, []);
  return null;
}

/** Root application: theme side-effects + client routing + auth gate. */
export function App() {
  // `/login` is the CHILD credential login by default; on the parents.* portal
  // it's the parent email login. `/parent-login` is always the parent login
  // (so a parent can sign in on dev too) — except on the child portal, which
  // sends it to the parents' portal.
  const loginElement = getPortal() === 'parent' ? <LoginPage /> : <ChildLoginPage />;

  return (
    <ThemeProvider>
      <BrowserRouter>
        <VoiceGuard />
        <div className="app-shell">
          <ThemeDecor />
          <InLang of="game">
            <TimeHeader />
          </InLang>
          <Routes>
            <Route path="/login" element={loginElement} />
            <Route path="/parent-login" element={getPortal() === 'kid' ? <ToParentLogin /> : <LoginPage />} />
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
