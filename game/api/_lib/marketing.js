/**
 * The owner's own links and the visits by them — the rules, with no database
 * and no request in them (tested in `tests/marketing.test.js`).
 *
 * A LINK is made in the admin panel and handed out: one per place it is put
 * (a profile, an ad, a flyer's QR code), so the visits can be told apart. It
 * is a code in the query string — `?l=insta-bio` — and leads either to the
 * public site or straight into the trial game:
 *
 *   site   https://pulsarkids.com/?l=<code>
 *   demo   https://play.pulsarkids.com/try?l=<code>
 *
 * A VISIT is one arrival: when, by which link, into which mode, from which
 * country. The trial game is counted with or without a link; the site only by
 * a link that exists (its plain page views are Vercel Analytics' business).
 */

/** How long the trial game lasts when the owner has not said otherwise. */
export const DEMO_MINUTES_DEFAULT = 5;
export const DEMO_MINUTES_MIN = 1;
export const DEMO_MINUTES_MAX = 60;

/** Where a link leads, and so what a visit was a visit to. */
export const MODES = ['site', 'demo'];
/** How a visitor got into the trial game: by a link, or by the button on our own site. */
export const VIAS = ['link', 'site'];
/** What may happen to a trial game later: its time ran out, «create an account» was pressed. */
export const VISIT_EVENTS = ['expired', 'cta'];

/** One visitor may be counted this many times an hour; more is a robot or a reload loop. */
export const MAX_VISITS_PER_HOUR = 30;

const CODE = /^[a-z0-9][a-z0-9_-]{1,39}$/;
const LANG = /^[a-z]{2}$/;
const HOST = /^[a-z0-9.-]{1,80}$/;

/** A whole number of minutes within the allowed range, or null. */
export function cleanDemoMinutes(value) {
  const minutes = Number(value);
  return Number.isInteger(minutes) && minutes >= DEMO_MINUTES_MIN && minutes <= DEMO_MINUTES_MAX ? minutes : null;
}

/** A link's code as it is written in an address, or null when it cannot be one. */
export function cleanCode(value) {
  if (typeof value !== 'string') return null;
  const code = value.trim().toLowerCase();
  return CODE.test(code) ? code : null;
}

const LATIN = {
  а: 'a', б: 'b', в: 'v', г: 'h', ґ: 'g', д: 'd', е: 'e', є: 'ye', ж: 'zh', з: 'z', и: 'y', і: 'i', ї: 'yi', й: 'y',
  к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch',
  ш: 'sh', щ: 'shch', ь: '', ю: 'yu', я: 'ya', ы: 'y', э: 'e', ё: 'yo', ъ: '',
};

/** A code made from a link's name («Інстаграм, біо» → `instahram-bio`); null when nothing usable is left. */
export function codeFromName(name) {
  const latin = [...String(name ?? '').toLowerCase()].map((ch) => LATIN[ch] ?? ch).join('');
  const code = latin
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/, '');
  return cleanCode(code);
}

/** A short code for a link whose name gives none. */
export function randomCode(random = Math.random) {
  const letters = 'abcdefghjkmnpqrstuvwxyz23456789';
  return Array.from({ length: 7 }, () => letters[Math.floor(random() * letters.length)]).join('');
}

/** A new link as the admin panel sends it → `{ link }` or `{ error }`. */
export function cleanLink(raw) {
  const name = typeof raw?.name === 'string' ? raw.name.trim().slice(0, 80) : '';
  if (!name) return { error: 'invalid_name' };
  if (!MODES.includes(raw.mode)) return { error: 'invalid_mode' };
  const typed = typeof raw.code === 'string' && raw.code.trim() !== '';
  const code = typed ? cleanCode(raw.code) : (codeFromName(name) ?? randomCode());
  if (!code) return { error: 'invalid_code' };
  const note = typeof raw.note === 'string' ? raw.note.trim().slice(0, 300) : '';
  return { link: { name, code, mode: raw.mode, note } };
}

/** Phone, tablet or computer — as far as the browser's name tells. */
export function deviceOf(userAgent) {
  const ua = String(userAgent ?? '');
  if (/ipad|tablet|android(?!.*mobile)/i.test(ua)) return 'tablet';
  if (/mobi|iphone|ipod|android/i.test(ua)) return 'mobile';
  return ua ? 'desktop' : null;
}

/** What a browser reports about an arrival, with everything odd dropped. */
export function cleanVisit(raw) {
  const body = raw && typeof raw === 'object' ? raw : {};
  const lang = typeof body.lang === 'string' ? body.lang.trim().toLowerCase().slice(0, 2) : '';
  const referrer = typeof body.referrer === 'string' ? body.referrer.trim().toLowerCase() : '';
  return {
    link: cleanCode(body.link),
    mode: MODES.includes(body.mode) ? body.mode : 'demo',
    via: VIAS.includes(body.via) ? body.via : 'link',
    lang: LANG.test(lang) ? lang : null,
    referrer: HOST.test(referrer) ? referrer : null,
  };
}
