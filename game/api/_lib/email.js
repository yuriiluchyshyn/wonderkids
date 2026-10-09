// Email identity rules. Parent login is by email, so two spellings of the same
// mailbox must never become two accounts, and an obvious typo should be caught
// before it silently creates a new, empty one. Pure functions — no I/O.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email) {
  return typeof email === 'string' && EMAIL_RE.test(email.trim());
}

/** What we store and show: trimmed, lower-cased. */
export function normaliseEmail(email) {
  return String(email ?? '').trim().toLowerCase();
}

const GMAIL_DOMAINS = new Set(['gmail.com', 'googlemail.com']);

/**
 * The mailbox an address really delivers to — the uniqueness key of an
 * account. Gmail ignores dots and anything after "+", and googlemail.com is
 * the same service, so `Yura.L+kids@GoogleMail.com` and `yural@gmail.com` are
 * ONE mailbox and must be one account. Other providers are left as typed.
 */
export function emailKey(email) {
  const normalised = normaliseEmail(email);
  const at = normalised.lastIndexOf('@');
  if (at < 0) return normalised;
  const local = normalised.slice(0, at);
  const domain = normalised.slice(at + 1);
  if (!GMAIL_DOMAINS.has(domain)) return normalised;
  return `${local.split('+')[0].replaceAll('.', '')}@gmail.com`;
}

/** Common slips of well-known domains → what was meant. */
const DOMAIN_TYPOS = {
  'gamil.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmal.com': 'gmail.com',
  'gmail.co': 'gmail.com',
  'gmail.con': 'gmail.com',
  'gmail.cm': 'gmail.com',
  'gmail.om': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gnail.com': 'gmail.com',
  'gmail.comm': 'gmail.com',
  'hotmial.com': 'hotmail.com',
  'hotmai.com': 'hotmail.com',
  'hotmail.con': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'outlook.con': 'outlook.com',
  'yaho.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'yahoo.con': 'yahoo.com',
  'ukr.ne': 'ukr.net',
  'ukr.nte': 'ukr.net',
  'urk.net': 'ukr.net',
  'ukr.met': 'ukr.net',
  'icloud.con': 'icloud.com',
  'iclod.com': 'icloud.com',
  'i.ua.': 'i.ua',
  'meta.ua.': 'meta.ua',
};

/** The corrected address when the domain looks mistyped, else null. */
export function suggestEmail(email) {
  const normalised = normaliseEmail(email);
  const at = normalised.lastIndexOf('@');
  if (at < 0) return null;
  const fixed = DOMAIN_TYPOS[normalised.slice(at + 1)];
  return fixed ? `${normalised.slice(0, at)}@${fixed}` : null;
}
