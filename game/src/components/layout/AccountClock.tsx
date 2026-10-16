import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@/core/account/auth/useAuthStore';
import { useLimits } from '@/core/account/billing/useLimits';
import { useDemo } from '@/core/app/demo';
import { getPortal } from '@/core/app/portal';
import { useGameStore } from '@/core/child/store/useGameStore';
import { Cutscene } from '@/components/game/Cutscene';
import { useScreenTime } from '@/components/game/useScreenTime';

/**
 * On the free plan (and with no plan) the child's day of play is counted for as
 * long as the child's account is OPEN — on the hub, in the vault, in the shop,
 * anywhere but a game, which counts itself — and not only while the child plays.
 * On Family the time runs only while the child really plays, so this does
 * nothing there. When the day's minutes are used up the child rests, wherever
 * they are, on the same friendly screen as in a game.
 *
 * The server holds the budget (`ScreenTimeService`); this only says when the
 * child's account is open. Renders nothing most of the time.
 */
export function AccountClock() {
  const token = useAuthStore((s) => s.token);
  const childSession = useAuthStore((s) => s.childId);
  const logout = useAuthStore((s) => s.logout);
  const openClock = useLimits((s) => s.limits?.openClock === true && !s.limits.blocked);
  const trial = useDemo((s) => s.active);
  const child = useGameStore((s) => s.children.some((c) => c.id === s.activeChildId));
  const { pathname } = useLocation();
  // A game counts its own time (and tells the child it is time to rest in its own way).
  const inGame = pathname.startsWith('/play/');
  const active = Boolean(token && childSession && openClock && child && !trial && !inGame && getPortal() !== 'parent');
  const screen = useScreenTime(active);

  // The tank ran dry with nothing to finish: rest now.
  useEffect(() => {
    if (active && screen.depleted) screen.endSession();
  }, [active, screen.depleted]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!active || !screen.synced || !screen.inCooldown) return null;
  return <Cutscene playScene={false} ready={false} onResume={() => {}} onExit={logout} />;
}
