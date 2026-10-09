/**
 * Liveness probe → GET /api/health  →  { ok, country }
 *
 * `country` (ISO 3166-1 alpha-2, or null off Vercel) is where the request came
 * from, as Vercel's edge saw it. The app offers the language of that country
 * to a visitor who has not chosen one (`src/core/i18n/deviceLang.ts`).
 */
export default function handler(req, res) {
  const country = String(req.headers['x-vercel-ip-country'] ?? '').toUpperCase();
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ ok: true, country: /^[A-Z]{2}$/.test(country) ? country : null });
}
