/**
 * What the game runs on, found out once at start-up and written on `<html>`
 * (`data-os`, `data-browser`, `data-perf`) so a stylesheet can ask too.
 *
 * The rules of what to do with it are in `docs/browser-support.md`. In short:
 * a rule that can hold for every device is written for every device; only what
 * a weaker device cannot afford — a sky that twinkles over the whole screen, a
 * blur behind a card, a crowd of particles — is keyed off `data-perf='lite'`.
 * A component never asks «is this Android?».
 */

export type Os = 'android' | 'ios' | 'other';
export type Browser = 'samsung' | 'chrome' | 'safari' | 'firefox' | 'webview' | 'other';
export type PerfTier = 'full' | 'lite';

/** A device with this much memory (GB) or this many cores, or fewer, is a weak one. */
const WEAK_MEMORY_GB = 4;
const WEAK_CORES = 4;

interface Hints {
  userAgent: string;
  maxTouchPoints?: number;
  deviceMemory?: number;
  hardwareConcurrency?: number;
}

export function osOf({ userAgent, maxTouchPoints = 0 }: Hints): Os {
  if (/Android/i.test(userAgent)) return 'android';
  // An iPad introduces itself as a Mac — but a Mac has no touch screen.
  if (/iPhone|iPad|iPod/i.test(userAgent) || (/Macintosh/i.test(userAgent) && maxTouchPoints > 1)) return 'ios';
  return 'other';
}

export function browserOf({ userAgent }: Hints): Browser {
  if (/SamsungBrowser/i.test(userAgent)) return 'samsung';
  // A page opened inside another app: Android's System WebView, or the apps that say so.
  if (/; wv\)|FBAN|FBAV|FB_IAB|Instagram|Telegram|Viber/i.test(userAgent)) return 'webview';
  if (/Firefox|FxiOS/i.test(userAgent)) return 'firefox';
  if (/Chrome|CriOS|Chromium|Edg/i.test(userAgent)) return 'chrome';
  if (/Safari/i.test(userAgent)) return 'safari';
  return 'other';
}

/**
 * Android always gets the lighter look: its compositor keeps every layer in a
 * small budget of video memory, and the phones in question (Galaxy A) are the
 * ones that flickered. An iPhone never does — it reports few cores and no
 * memory at all, and runs the full look well. Anything else is judged by what
 * it says about itself.
 */
export function perfOf(hints: Hints): PerfTier {
  const os = osOf(hints);
  if (os === 'android') return 'lite';
  if (os === 'ios') return 'full';
  const weak = (hints.deviceMemory ?? Infinity) <= WEAK_MEMORY_GB || (hints.hardwareConcurrency ?? Infinity) <= WEAK_CORES;
  return weak ? 'lite' : 'full';
}

function readHints(): Hints {
  if (typeof navigator === 'undefined') return { userAgent: '' };
  const nav = navigator as Navigator & { deviceMemory?: number };
  return {
    userAgent: nav.userAgent,
    maxTouchPoints: nav.maxTouchPoints,
    deviceMemory: nav.deviceMemory,
    hardwareConcurrency: nav.hardwareConcurrency,
  };
}

const hints = readHints();
const tier = perfOf(hints);

/** The device, as the code may ask about it. */
export const perf = {
  os: osOf(hints),
  browser: browserOf(hints),
  tier,
  lite: tier === 'lite',
  /** How many particles of `wanted` this device should be given. */
  particles: (wanted: number): number => (tier === 'lite' ? Math.ceil(wanted / 2) : wanted),
} as const;

/** Tells the stylesheets what the device is. Called once, before the first render. */
export function markPlatform(): void {
  const root = document.documentElement;
  root.dataset.os = perf.os;
  root.dataset.browser = perf.browser;
  root.dataset.perf = perf.tier;
}
