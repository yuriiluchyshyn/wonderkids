/**
 * The trial game: the first level of the real game, with no account.
 *
 * It is opened by an address — `/try` on the child's portal, with the code of
 * the owner's link when it was reached by one (`/try?l=insta-bio`), or
 * `?via=site` when it was the button on our own site. So an ad, a profile or
 * a flyer can lead straight into play. With `?game=geography:flags` it opens
 * in that game instead of the hub — what a game's page on the site leads to
 * (`?via=page`): whoever came for the flags gets the flags.
 *
 * What it keeps:
 *
 * - **Only this tab knows it is a trial** — `sessionStorage`. A reload stays in
 *   the trial (and is not counted as another visit); a closed tab ends it.
 * - **Nothing played is saved.** The guest child lives in memory: a reload
 *   starts from an empty purse — and with the clock wound back, which is
 *   accepted: there is nothing to carry over.
 * - **No clock.** The trial is one whole level, not a few minutes: the child
 *   plays at their own pace and is never cut off mid-task.
 *
 * When the first level is finished — its win screen seen — `finishDemo()`
 * ends the trial and `DemoOver` asks the child, kindly, to call a parent
 * to create the account.
 */
import { TRIAL_PATH, gameOfQuery, linkOfQuery, queryOfSource, viaOfQuery, type GameRef, type VisitVia } from '@pulsar/platform';
import { useEffect } from 'react';
import { create } from 'zustand';
import { api } from '@/core/account/api/client';
import { speechEngine } from '@/core/audio/SpeechEngine';
import { signupSource } from '@/core/app/attribution';
import { moduleRegistry } from '@/core/game/kernel/ModuleRegistry';
import { speaks } from '@/core/game/kernel/types';
import { portalUrl } from '@/core/app/portal';
import { useGameStore } from '@/core/child/store/useGameStore';
import { tApp, useDeviceLang } from '@/core/translator';

const STORAGE_KEY = 'pulsar-demo-v1';

/**
 * First-run tips the guest is spared (`components/coach/tips.ts`): a tour of
 * every button would eat the trial. What stays is what play cannot do without —
 * how to start a game and how to answer on each board.
 */
const TIPS_SKIPPED = ['hub.galaxy', 'hub.stars', 'hub.artifacts', 'hub.treasures', 'hub.profile', 'hub.time', 'game.tts', 'game.track', 'game.dots', 'game.home'];

/** The guest never meets the game's own rest screen: the trial is one level, and that is all its limit. */
const GUEST_TIME = { sessionDurationMinutes: 120, cooldownMinutes: 0, maxDailyMinutes: 240 };

interface DemoSession {
  /** The code of the link that led here, if one did. */
  link: string | null;
  via: VisitVia;
  /** The counted visit — to report how the trial ended. */
  ticket: { visit: number; token: string } | null;
  /** The first level was finished: a reload shows `DemoOver` again, not another level. */
  over?: boolean;
}

function readSession(): DemoSession | null {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null') as DemoSession | null;
    return saved && typeof saved.via === 'string' ? saved : null;
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
  /** The first level is finished: the game is replaced by `DemoOver`. */
  expired: boolean;
  session: DemoSession | null;
}

export const useDemo = create<DemoState>(() => ({
  active: false,
  expired: false,
  session: null,
}));

const isTrialPath = (pathname: string): boolean => pathname.replace(/\/+$/, '') === TRIAL_PATH;

/**
 * Called once at start-up, before the first render. An address that asks for
 * the trial starts one (and is counted); a tab already in a trial goes on.
 * The trial is the same clean game for everyone: a signed-in child's
 * theme, progress and settings take no part in it, and nothing of it reaches
 * their save (`DemoRoutes` never loads or syncs one). Their own game is back
 * once the trial is left (`endDemo`).
 */
export function beginDemo(): void {
  const { pathname, search } = window.location;
  const asked = isTrialPath(pathname);

  if (asked) {
    const game = playable(gameOfQuery(search));
    const fresh: DemoSession = {
      link: linkOfQuery(search) ?? null,
      via: viaOfQuery(search),
      ticket: null,
    };
    // The address has done its job: a reload must not count again. The hub lives at «/»; a game asked for by name — at its own address.
    window.history.replaceState(null, '', game ? `/play/${game.module}/${game.sub}` : '/');
    writeSession(fresh);
    useDemo.setState({ active: true, session: fresh });
    api
      .visit({ link: fresh.link, mode: 'demo', via: fresh.via, lang: useDeviceLang.getState().lang, referrer: referrerHost(), game: game ? `${game.module}:${game.sub}` : null })
      .then(({ visit, token }) => {
        const { active, session } = useDemo.getState();
        if (!active || !session) return;
        const counted: DemoSession = { ...session, ticket: visit && token ? { visit, token } : null };
        writeSession(counted);
        useDemo.setState({ session: counted });
      })
      .catch(() => {
        /* offline or no API: the trial is played all the same, uncounted */
      });
    return;
  }

  const session = readSession();
  if (!session) return;
  useDemo.setState({ active: true, expired: Boolean(session.over), session });
}

/**
 * The game a link names, if the trial can open in it: it exists and is written
 * in the language this visitor is offered. Anything else — a game since
 * removed, a typo — and the trial opens in the hub, as it always did.
 */
function playable(game: GameRef | undefined): GameRef | undefined {
  if (!game) return undefined;
  const sub = moduleRegistry.get(game.module)?.subCategories.find((candidate) => candidate.id === game.sub);
  return sub && speaks(sub, useDeviceLang.getState().lang) ? game : undefined;
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

let guestSeated = false;

/** The guest the trial is played by — made once per page load, kept in memory only. */
export function seatGuest(): void {
  // Once per page load — and always over an empty store, whoever is signed in on this device.
  if (guestSeated) return;
  guestSeated = true;
  const store = useGameStore.getState();
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

/**
 * The trial game speaks with the natural cloud voice — stresses and all — when
 * the owner switched it on for trials (`/admin/settings`, its own key); with
 * the browser's voice otherwise. Mounted by `DemoRoutes` for as long as the trial lasts.
 */
export function useTrialVoice(): void {
  useEffect(() => {
    let active = true;
    api
      .trialVoice()
      .then(({ enabled }) => {
        if (active && enabled) speechEngine.setCloudVoice((text, lang) => api.trialTts(text, lang));
      })
      .catch(() => {
        /* no API: the browser's voice reads */
      });
    return () => {
      active = false;
      speechEngine.setCloudVoice(null);
    };
  }, []);
}

/**
 * The first level is done: the trial is over and `DemoOver` (the way to an
 * account) takes the game's place. Counted as the visit's «played to the end».
 */
export function finishDemo(): void {
  const { active, expired, session } = useDemo.getState();
  if (!active || expired) return;
  const over = session ? { ...session, over: true } : null;
  writeSession(over);
  useDemo.setState({ expired: true, session: over });
  if (session?.ticket) api.visitEvent(session.ticket, 'expired').catch(() => {});
}

/** Leave the trial: the guest and everything they collected are gone. */
export function endDemo(): void {
  guestSeated = false;
  writeSession(null);
  useDemo.setState({ active: false, expired: false, session: null });
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
