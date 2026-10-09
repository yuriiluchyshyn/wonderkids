import { allowAnyOrigin, visitArrives, visitGoesOn } from './_lib/visits.js';

/**
 * Liveness probe → GET /api/health  →  { ok, country }
 *
 * `country` (ISO 3166-1 alpha-2, or null off Vercel) is where the request came
 * from, as Vercel's edge saw it. The app offers the language of that country
 * to a visitor who has not chosen one (`src/core/translator/deviceLang.ts`).
 *
 * The same address counts arrivals (the deployment has no function to spare
 * for an endpoint of their own — see `_lib/visits.js`):
 *
 *   POST /api/health  { link?, mode, via?, lang?, referrer? }  an arrival by one of the
 *                     owner's links, or into the trial game → { demoMinutes, visit?, token? }
 *   PUT  /api/health  { visit, token, event }                  how that trial game ended
 */
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS' || req.method === 'POST' || req.method === 'PUT') {
    allowAnyOrigin(res);
    if (req.method === 'OPTIONS') return res.status(204).end();
    try {
      return await (req.method === 'POST' ? visitArrives(req, res) : visitGoesOn(req, res));
    } catch (err) {
      console.error('[visit] failed:', err);
      return res.status(500).json({ error: 'server_error' });
    }
  }
  const country = String(req.headers['x-vercel-ip-country'] ?? '').toUpperCase();
  return res.status(200).json({ ok: true, country: /^[A-Z]{2}$/.test(country) ? country : null });
}
