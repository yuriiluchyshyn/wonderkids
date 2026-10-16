import { LangProvider, useGameLang, useParentLang, useT } from '@/core/translator';
import { lazy, Suspense, useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { VoiceGuard } from '@/core/audio/voice';
import { ThemeProvider } from '@/core/theme/ThemeProvider';
import { useAuthStore } from '@/core/account/auth/useAuthStore';
import { useGameStore } from '@/core/child/store/useGameStore';
import { useRemoteSync } from '@/core/account/sync/useRemoteSync';
import { getPortal, portalUrl } from '@/core/app/portal';
import { seatGuest, useDemo, useTrialVoice } from '@/core/app/demo';
import { signupSource } from '@/core/app/attribution';
import { queryOfSource } from '@pulsar/platform';
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
import { SpaceLoader, SpaceScreen } from '@/components/ui/SpaceLoader';
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
  color: 'var(--primary-ink, #fff)',
  background: 'var(--primary, #7c3aed)',
  cursor: 'pointer',
};

/** Full-screen message shown while the save loads (or fails to) after login. */
function SyncSplash({ error }: { error?: boolean }) {
  const t = useT();
  const logout = useAuthStore((s) => s.logout);
  return (
    <SpaceScreen>
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
    </SpaceScreen>
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

/**
 * The trial game (`core/app/demo.ts`): the child's screens for a guest who
 * lives in memory — no account, no save, no clock. Once the first level is
 * finished (`finishDemo`), `DemoOver` — the way to an account — takes the
 * game's place.
 */
function DemoRoutes() {
  const expired = useDemo((s) => s.expired);
  const [seated, setSeated] = useState(false);
  useTrialVoice();

  useEffect(() => {
    seatGuest();
    setSeated(true);
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

/**
 * Gate: require a session — or a trial game. Whoever comes without one is sent
 * to the PARENTS' login, on every portal: a newcomer has no nickname and no
 * PIN, so the child's login is a dead end for them, while the parents' is
 * where an account begins. The child's login stays at `/login` for those who
 * are sent there by name (the cabinet's «open the child's game», a parent's
 * sign-out) — and takes over when a child's own session has just ended here,
 * so the child reads why and signs in again.
 */
function ProtectedApp() {
  const token = useAuthStore((s) => s.token);
  const endedAsChild = useAuthStore((s) => s.endedAsChild);
  const demo = useDemo((s) => s.active);
  // The trial is a clean game of its own even for someone signed in: their save is never loaded under it.
  if (demo) return <DemoRoutes />;
  if (!token) return <Navigate to={endedAsChild ? '/login' : '/parent-login'} replace />;
  return <SyncedRoutes />;
}

/**
 * The child portal has no parent cabinet, so a parent who signs in there has
 * nowhere to land (they would end up on the child picker). Whoever comes to
 * it without a session, and its «Вхід для батьків», lead here, and from here
 * to the parents' own portal — told where the visitor came from, because that
 * portal is another origin and cannot read what this one remembered. (In
 * production `vercel.json` redirects the address itself, before the app.)
 */
function ToParentLogin() {
  useEffect(() => {
    const source = signupSource();
    window.location.replace(portalUrl('parent', '/parent-login') + (source ? queryOfSource(source) : ''));
  }, []);
  return null;
}

/** Root application: theme side-effects + client routing + auth gate. */
export function App() {
  // `/login` is the CHILD credential login; the parents.* portal has no child
  // login, so there it is one more name of the parent login and leads to it
  // (one page, one address). `/parent-login` is always the parent login (so a
  // parent can sign in on dev too) — except on the child portal, which sends
  // it to the parents' portal.
  const loginElement = getPortal() === 'parent' ? <Navigate to="/parent-login" replace /> : <ChildLoginPage />;

  return (
    <BrowserRouter>
      {/* Inside the router: the grown-ups' pages wear the default theme, whichever child is chosen. */}
      <ThemeProvider>
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
      </ThemeProvider>
    </BrowserRouter>
  );
}
