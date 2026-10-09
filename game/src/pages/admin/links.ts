import { DEFAULT_SITE_URL, LINK_PARAM, TRIAL_PATH, rootHost } from '@pulsar/platform';
import type { LinkMode } from '@/core/account/api/client';
import { getPortal } from '@/core/app/portal';

/** The public site's address, without a trailing slash. */
export function siteOrigin(): string {
  return getPortal() === 'dev' ? DEFAULT_SITE_URL : `https://${rootHost(window.location.hostname)}`;
}

/** The address of the trial game — on the child's portal, or on this origin where there are no portals. */
export function trialUrl(): string {
  const play = getPortal() === 'dev' ? window.location.origin : `https://play.${rootHost(window.location.hostname)}`;
  return `${play}${TRIAL_PATH}`;
}

/** The address to hand out for a link with this code. */
export function linkUrl(mode: LinkMode, code: string): string {
  return `${mode === 'demo' ? trialUrl() : `${siteOrigin()}/`}?${LINK_PARAM}=${code}`;
}

export const MODE_NAME: Record<LinkMode, string> = { demo: '🚀 Пробна гра', site: '🌐 Сайт' };

let regions: Intl.DisplayNames | null = null;

/** «🇵🇱 Польща» for `PL`; the code itself when the browser knows no name for it. */
export function countryName(code: string | null): string {
  if (!code) return '— невідомо';
  const flag = String.fromCodePoint(...[...code].map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65));
  try {
    regions ??= new Intl.DisplayNames(['uk'], { type: 'region' });
    return `${flag} ${regions.of(code) ?? code}`;
  } catch {
    return `${flag} ${code}`;
  }
}
