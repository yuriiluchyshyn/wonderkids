// Counting arrivals — the public side of the owner's links (see marketing.js).
// It lives behind /api/health because the deployment has no function to spare.
import { createHash, createHmac } from 'node:crypto';
import { countRecentVisits, ensureSchema, getSetting, linkExists, markVisit, recordVisit } from './db.js';
import { DEMO_MINUTES_DEFAULT, MAX_VISITS_PER_HOUR, VISIT_EVENTS, cleanDemoMinutes, cleanVisit, deviceOf } from './marketing.js';
import { safeEqual } from './secrets.js';

export const DEMO_MINUTES_KEY = 'demo_minutes';

const secret = () => process.env.JWT_SECRET ?? 'dev-only-change-me';

/** Lets the browser that made a visit — and nobody else — say what became of it. */
const visitToken = (id) => createHmac('sha256', secret()).update(`visit:${id}`).digest('hex');

/** A visitor is kept only as a hash of the address — enough to count different people. */
function visitorHash(req) {
  const ip = String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim() || 'local';
  return createHash('sha256').update(`${secret()}:visitor:${ip}`).digest('hex').slice(0, 32);
}

function countryOf(req) {
  const country = String(req.headers['x-vercel-ip-country'] ?? '').toUpperCase();
  return /^[A-Z]{2}$/.test(country) ? country : null;
}

/** How long the trial game lasts, in minutes — the owner's setting, or the default. */
export async function demoMinutes() {
  return cleanDemoMinutes(await getSetting(DEMO_MINUTES_KEY)) ?? DEMO_MINUTES_DEFAULT;
}

/**
 * The public site is a deployment of its own, on another origin, and counts
 * its arrivals here. No session, no cookie — any page may write.
 */
export function allowAnyOrigin(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
}

/**
 * POST { link?, mode: 'site' | 'demo', via?, lang?, referrer? }
 *   → { ok, demoMinutes, visit?, token? }
 *
 * The trial game is always counted (a link it does not know is dropped, the
 * visit stays); the site only by a link that exists. `visit` + `token` let the
 * same browser report later how the trial game ended.
 */
export async function visitArrives(req, res) {
  await ensureSchema();
  const visit = cleanVisit(req.body);
  const minutes = await demoMinutes();
  const known = visit.link ? await linkExists(visit.link) : false;
  if (!known) visit.link = null;
  if (visit.mode === 'site' && !known) return res.status(200).json({ ok: true, demoMinutes: minutes });

  const visitor = visitorHash(req);
  if ((await countRecentVisits(visitor)) >= MAX_VISITS_PER_HOUR) return res.status(200).json({ ok: true, demoMinutes: minutes });

  const id = await recordVisit({
    ...visit,
    country: countryOf(req),
    device: deviceOf(req.headers['user-agent']),
    visitor,
  });
  return res.status(200).json({ ok: true, demoMinutes: minutes, visit: id, token: visitToken(id) });
}

/** PUT { visit, token, event: 'expired' | 'cta' } — what became of a trial game. */
export async function visitGoesOn(req, res) {
  const { visit, token, event } = req.body ?? {};
  if (!Number.isInteger(visit) || !safeEqual(token, visitToken(visit))) return res.status(403).json({ error: 'invalid_token' });
  if (!VISIT_EVENTS.includes(event)) return res.status(400).json({ error: 'invalid_event' });
  await ensureSchema();
  await markVisit(visit, event);
  return res.status(200).json({ ok: true });
}
