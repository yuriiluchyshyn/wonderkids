/**
 * The trial game: a few minutes of the real game with no account.
 *
 * It is opened by an address — `/try` on the child's portal, with the code of
 * the owner's link when it was reached by one (`/try?l=insta-bio`), or
 * `?via=site` when it was the button on our own site. So an ad, a profile or
 * a flyer can lead straight into play.
 *
 * What it keeps:
 *
 * - **Only this tab knows it is a trial** — `sessionStorage`. A reload stays in
 *   the trial (and is not counted as another visit); a closed tab ends it.
 * - **Nothing played is saved.** The guest child lives in memory: a reload
 *   starts from an empty purse — and with the clock wound back, which is
 *   accepted: there is nothing to carry over.
 * - **The clock** counts only while the page is on the screen. How long the
 *   trial lasts is the owner's setting (`/admin/settings`), told by the
 *   server when the visit is counted.
 *
 * When the time is up the game stops where it is — mid-task too — and
 * `DemoOver` asks the child, kindly, to call a parent.
 */
import { TRIAL_PATH, VIA_PARAM, linkOfQuery, queryOfSource } from '@pulsar/platform';
import { create } from 'zustand';
import { api } from '@/core/account/api/client';
import { useAuthStore } from '@/core/account/auth/useAuthStore';
import { signupSource } from '@/core/app/attribution';
import { portalUrl } from '@/core/app/portal';
import { useGameStore } from '@/core/child/store/useGameStore';
import { tApp, useDeviceLang } from '@/core/translator';

const STORAGE_KEY = 'pulsar-demo-v1';

/** Used until the server says how long the trial lasts (and if it cannot be asked). */
export const DEMO_MINUTES_FALLBACK = 5;

/**
 * First-run tips the guest is spared (`components/coach/tips.ts`): a tour of
 * every button would eat the trial. What stays is what play cannot do without —
 * how to start a game and how to answer on each board.
 */
const TIPS_SKIPPED = ['hub.galaxy', 'hub.stars', 'hub.artifacts', 'hub.treasures', 'hub.profile', 'hub.time', 'game.tts', 'game.track', 'game.dots', 'game.home'];

/** The guest never meets the game's own rest screen: the trial's clock is the only one. */
const GUEST_TIME = { sessionDurationMinutes: 120, cooldownMinutes: 0, maxDailyMinutes: 240 };

interface DemoSession {
  /** The code of the link that led here, if one did. */
  link: string | null;
  via: 'link' | 'site';
  minutes: number;
  /** The counted visit — to report how the trial ended. */
  ticket: { visit: number; token: string } | null;
}

function readSession(): DemoSession | null {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null') as DemoSession | null;
    return saved && typeof saved.minutes === 'number' ? saved : null;
  } catch {
    return null;
  }
}

function writeSession(session: DemoSession | null): void {
  try {
    if (session) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* private mode: the trial lasts until the page is reloaded */
  }
}

interface DemoState {
  /** This tab is playing the trial game. */
  active: boolean;
  minutes: number;
  /** Time played in this page load, counted while the page is on the screen. */
  elapsedMs: number;
  /** The time is up: the game is replaced by `DemoOver`. */
  expired: boolean;
  session: DemoSession | null;
}

export const useDemo = create<DemoState>(() => ({
  active: false,
  minutes: DEMO_MINUTES_FALLBACK,
  elapsedMs: 0,
  expired: false,
  session: null,
}));

const isTrialPath = (pathname: string): boolean => pathname.replace(/\/+$/, '') === TRIAL_PATH;

/**
 * Called once at start-up, before the first render. An address that asks for
 * the trial starts one (and is counted); a tab already in a trial goes on.
 * Someone who is signed in simply gets their own game — the arrival is still
 * counted, a link was followed.
 */
export function beginDemo(): void {
  const { pathname, search } = window.location;
  const asked = isTrialPath(pathname);
  const signedIn = Boolean(useAuthStore.getState().token);

  if (asked) {
    const query = new URLSearchParams(search);
    const fresh: DemoSession = {
      link: linkOfQuery(search) ?? null,
      via: query.get(VIA_PARAM) === 'site' ? 'site' : 'link',
      minutes: DEMO_MINUTES_FALLBACK,
      ticket: null,
    };
    // The address has done its job: the hub lives at «/», and a reload must not count again.
    window.history.replaceState(null, '', '/');
    if (!signedIn) {
      writeSession(fresh);
      useDemo.setState({ active: true, minutes: fresh.minutes, session: fresh });
    }
    api
      .visit({ link: fresh.link, mode: 'demo', via: fresh.via, lang: useDeviceLang.getState().lang, referrer: referrerHost() })
      .then(({ demoMinutes, visit, token }) => {
        if (signedIn || !useDemo.getState().active) return;
        const counted: DemoSession = { ...fresh, minutes: demoMinutes, ticket: visit && token ? { visit, token } : null };
        writeSession(counted);
        useDemo.setState({ minutes: demoMinutes, session: counted });
      })
      .catch(() => {
        /* offline or no API: the trial runs its default length, uncounted */
      });
    return;
  }

  const session = readSession();
  if (!session) return;
  if (signedIn) writeSession(null);
  else useDemo.setState({ active: true, minutes: session.minutes, session });
}

/** The site that sent the visitor here, if the browser tells. */
function referrerHost(): string | null {
  try {
    const host = new URL(document.referrer).hostname.toLowerCase();
    return host && host !== window.location.hostname ? host : null;
  } catch {
    return null;
  }
}

/** The guest the trial is played by — made once per page load, kept in memory only. */
export function seatGuest(): void {
  const store = useGameStore.getState();
  if (store.children.length > 0) return;
  const lang = useDeviceLang.getState().lang;
  store.hydrate({});
  useGameStore.getState().addChild({
    lang,
    profile: { name: tApp(lang, 'child.defaultName') },
    settings: { timeControl: GUEST_TIME },
  });
  for (const tip of TIPS_SKIPPED) useGameStore.getState().markTipSeen(tip);
}

/**
 * The guest is called «Друже» in the language of the device — and that
 * language may only become known a moment after the guest is seated (the
 * server says which country this is), so the name follows it.
 */
useDeviceLang.subscribe(({ lang }) => {
  if (!useDemo.getState().active || useGameStore.getState().children.length === 0) return;
  const name = tApp(lang, 'child.defaultName');
  if (useGameStore.getState().profile.name !== name) useGameStore.getState().setProfile({ name });
});

/** Adds played time; the trial ends when it reaches the limit. */
export function demoTick(ms: number): void {
  const { active, expired, elapsedMs, minutes, session } = useDemo.getState();
  if (!active || expired) return;
  const next = elapsedMs + ms;
  if (next < minutes * 60_000) {
    useDemo.setState({ elapsedMs: next });
    return;
  }
  useDemo.setState({ elapsedMs: next, expired: true });
  if (session?.ticket) api.visitEvent(session.ticket, 'expired').catch(() => {});
}

/** How much of the trial is left, 0..100 — for the draining gauge at the top. */
export const demoFuelPct = (elapsedMs: number, minutes: number): number => Math.max(0, Math.min(100, 100 - (elapsedMs / (minutes * 60_000)) * 100));

/** Leave the trial: the guest and everything they collected are gone. */
export function endDemo(): void {
  writeSession(null);
  useDemo.setState({ active: false, expired: false, elapsedMs: 0, session: null });
  useGameStore.getState().resetAll();
}

/**
 * Where a parent creates the account: the parents' portal, told where the
 * visitor came from (that portal is another origin and cannot read what this
 * one remembered).
 */
export function parentSignupUrl(): string {
  const link = useDemo.getState().session?.link ?? undefined;
  const source = signupSource() ?? { source: link ?? 'trial', medium: link ? 'link' : 'demo' };
  return portalUrl('parent', '/parent-login') + queryOfSource({ ...source, link: link ?? source.link });
}

/** «Create an account» was pressed in the trial: note it, forget the trial, go to the parents' portal. */
export function goCreateAccount(): void {
  const ticket = useDemo.getState().session?.ticket;
  if (ticket) api.visitEvent(ticket, 'cta').catch(() => {});
  const url = parentSignupUrl();
  // The page is about to leave: only the tab's note is wiped, the screen stays as it is.
  writeSession(null);
  window.location.assign(url);
}
