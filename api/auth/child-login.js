import { ensureSchema, resolveChildLogin } from '../_lib/db.js';
import { signChildToken } from '../_lib/auth.js';

/**
 * Child login → POST /api/auth/child-login
 * Body: { identifier, pin } where identifier is the child's unique nickname (or
 * email) and pin is the parent-set login code. Returns a child token + childId.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const { identifier, pin } = req.body ?? {};
  if (typeof identifier !== 'string' || !identifier.trim() || typeof pin !== 'string') {
    return res.status(400).json({ error: 'invalid_credentials' });
  }

  try {
    await ensureSchema();
    const r = await resolveChildLogin(identifier, pin);
    if (r.status === 'ok') {
      const token = signChildToken(r.userId, r.childId);
      return res.status(200).json({ token, childId: r.childId, user: { id: r.userId } });
    }
    if (r.status === 'bad_pin') {
      return res.status(401).json({ error: 'invalid_pin' });
    }
    return res.status(404).json({ error: 'child_not_found' });
  } catch (err) {
    console.error('[child-login] failed:', err);
    return res.status(500).json({ error: 'login_failed' });
  }
}
