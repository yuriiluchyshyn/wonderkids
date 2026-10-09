import { ensureSchema, isNicknameAvailable } from './_lib/db.js';
import { getUserFromReq } from './_lib/auth.js';

const NICKNAME_RE = /^[a-z0-9_]{3,12}$/;

/**
 * Child nickname availability → GET /api/nickname?nick=marko_speed
 * Returns `{ available }`, excluding the caller's own account so a parent can
 * keep their own child's nickname.
 */
export default async function handler(req, res) {
  const user = getUserFromReq(req);
  if (!user) {
    return res.status(401).json({ error: 'invalid_token' });
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const nick = String(req.query.nick ?? '').trim().toLowerCase();
  if (!NICKNAME_RE.test(nick)) {
    return res.status(400).json({ error: 'invalid_nickname' });
  }

  try {
    await ensureSchema();
    const available = await isNicknameAvailable(nick, user.id);
    return res.status(200).json({ available });
  } catch (err) {
    console.error('[nickname] failed:', err);
    return res.status(500).json({ error: 'check_failed' });
  }
}
