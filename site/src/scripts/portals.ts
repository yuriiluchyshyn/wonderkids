/**
 * The way from this page into the game. The game is a deployment of its own:
 * the links to its portals are written into the page when it is built
 * (`build/seo.ts`), and here they only learn two things — where the game is
 * when both run on a developer's machine, and where the visitor came from.
 */
import { DEV_PORT, TRIAL_PATH, VIA_PARAM, isLocalHost, queryOfSource, rootHost, sourceOfQuery, type PortalHost, type SignupSource } from '@pulsar/platform';
import { readSource, rememberLangChoice, saveSource } from '@pulsar/platform/browser';

/** Where each portal lets a visitor in when the game runs on one origin. */
const LOCAL_ENTRY: Record<PortalHost, string> = { play: '/login', parents: '/parent-login' };

/** The game's dev server on this machine — or `null` on a real host, where the built addresses are right. */
export function localGameOrigin(): string | null {
  const { protocol, hostname } = window.location;
  return isLocalHost(hostname) ? `${protocol}//${hostname}:${DEV_PORT.game}` : null;
}

/**
 * Where the visitor came from: the `utm_*` labels of the link, or what was
 * remembered from an earlier visit, or else the site that sent them.
 */
function visitorSource(): SignupSource | undefined {
  const named = sourceOfQuery(window.location.search);
  if (named) return named;
  const remembered = readSource();
  if (remembered) return remembered;
  try {
    const sender = rootHost(new URL(document.referrer).hostname);
    if (sender && !sender.endsWith(rootHost(window.location.hostname))) return { source: sender, medium: 'referral' };
  } catch {
    /* no referrer */
  }
  return undefined;
}

/**
 * Points every `[data-portal]` link at its portal, carrying the visitor's
 * source and language along. A link marked `data-trial` leads into the trial
 * game (no account) and says that it was this site's button that led there.
 */
export function wirePortalLinks(): void {
  const source = visitorSource();
  if (source) saveSource(source);
  const from = source ? queryOfSource(source) : '';
  const local = localGameOrigin();

  document.querySelectorAll<HTMLAnchorElement>('a[data-portal]').forEach((link) => {
    const portal = link.dataset.portal as PortalHost;
    const trial = 'trial' in link.dataset;
    const url = new URL((local ? local + (trial ? TRIAL_PATH : LOCAL_ENTRY[portal]) : link.href) + from);
    if (trial) url.searchParams.set(VIA_PARAM, 'site');
    link.href = url.href;
    // Going on from this page, the visitor goes on in its language.
    link.addEventListener('click', () => rememberLangChoice(document.documentElement.lang));
  });
}
