// Shared request handling for the /api/v1/session/* endpoints.
import { ensureSchema, trackSession } from './db.js';
import { getUserFromReq } from './auth.js';
import { clampTzOffset, describe } from './screenTime.js';

/**
 * Authenticate, resolve which child the request is about, run `transition`
 * against that child's play-time row and answer with the PRD payload.
 *
 * A child session can only ever touch its own profile (taken from the token).
 * A parent session names the child with `child_profile_id`.
 */
export async function handleSession(req, res, { method, parentOnly = false, transition }) {
  const user = getUserFromReq(req);
  if (!user) return res.status(401).json({ error: 'invalid_token' });

  if (req.method !== method) {
    res.setHeader('Allow', method);
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  if (parentOnly && user.childId) return res.status(403).json({ error: 'parent_only' });

  const body = req.body ?? {};
  const childId = user.childId ?? body.child_profile_id;
  if (typeof childId !== 'string' || !childId) {
    return res.status(400).json({ error: 'invalid_child_profile_id' });
  }
  const tz = clampTzOffset(body.tz_offset_min);

  try {
    await ensureSchema();
    const now = Date.now();
    const result = await trackSession(user.id, childId, (state, limits) =>
      transition(state, limits, now, tz, body),
    );
    if (!result) return res.status(404).json({ error: 'child_not_found' });
    return res.status(200).json({ child_profile_id: childId, ...describe(result.state, result.limits, now) });
  } catch (err) {
    console.error('[session] failed:', err);
    return res.status(500).json({ error: 'server_error' });
  }
}
