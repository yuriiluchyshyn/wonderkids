import { ensureSchema, getState, saveState } from './_lib/db.js';
import { getUserFromReq } from './_lib/auth.js';

/**
 * Per-user save →  GET /api/state   (load, or null when empty)
 *                  PUT /api/state   (replace with { state })
 */
export default async function handler(req, res) {
  const user = getUserFromReq(req);
  if (!user) {
    return res.status(401).json({ error: 'invalid_token' });
  }

  try {
    await ensureSchema();

    if (req.method === 'GET') {
      const state = await getState(user.id);
      return res.status(200).json({ state });
    }

    if (req.method === 'PUT') {
      const { state } = req.body ?? {};
      if (state === null || typeof state !== 'object' || Array.isArray(state)) {
        return res.status(400).json({ error: 'invalid_state' });
      }
      const updatedAt = await saveState(user.id, state);
      return res.status(200).json({ ok: true, updatedAt });
    }

    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ error: 'method_not_allowed' });
  } catch (err) {
    console.error('[state] failed:', err);
    return res.status(500).json({ error: 'server_error' });
  }
}
