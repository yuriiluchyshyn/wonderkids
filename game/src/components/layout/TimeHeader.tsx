import { useT } from '@/core/translator';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@/core/account/auth/useAuthStore';
import { useGameStore } from '@/core/child/store/useGameStore';
import { getPortal } from '@/core/app/portal';
import { useTimeBudget } from '@/core/child/time/screenTime';
import { demoFuelPct, useDemo } from '@/core/app/demo';
import { TimeBudget } from './TimeBudget';
import styles from './TimeHeader.module.css';

/** Routes where the child time clock should never show (auth / parent cabinet). */
const HIDDEN_PREFIXES = ['/login', '/parent-login', '/parent', '/who', '/admin'];

/**
 * The master header above all headers (improvement set #3): an always-visible,
 * wordless strip at the very top of every child screen showing how much play
 * time is left as a draining row of the theme's token. Not in a modal, not in a
 * side panel — everywhere, all the time, so the child always sees it melting.
 */
export function TimeHeader() {
  const t = useT();
  const token = useAuthStore((s) => s.token);
  const activeChildId = useGameStore((s) => s.activeChildId);
  const children = useGameStore((s) => s.children);
  const { fuelPct, inCooldown } = useTimeBudget();
  const { pathname } = useLocation();
  const demo = useDemo((s) => s.active && !s.expired);
  const demoPct = useDemo((s) => demoFuelPct(s.elapsedMs, s.minutes));

  // Only for a signed-in child with an active save, on child-facing screens —
  // or for the guest of the trial game, whose row drains with the trial itself.
  if (!token && !demo) return null;
  if (getPortal() === 'parent') return null;
  if (HIDDEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null;
  if (!children.some((c) => c.id === activeChildId)) return null;

  return (
    <div className={styles.bar} aria-label={t('time.label')} data-tip="time">
      <TimeBudget pct={token ? fuelPct : demoPct} resting={token ? inCooldown : false} slots={10} />
    </div>
  );
}
