import { ensureSchema, ownsChild, resolveChildLogin } from '../_lib/db.js';
import { getUserFromReq, signChildToken } from '../_lib/auth.js';

/**
 * Child login → POST /api/auth/child-login
 *
 * Two ways in, both answering with a child token + childId:
 *
 *  - the child's own: body `{ identifier, pin }` — the unique nickname (or
 *    email) and the parent-set login code;
 *  - the parent's: a PARENT session token in `Authorization` and body
 *    `{ childId }` — the cabinet's «Відкрити гру» opens one of the account's
 *    own children without typing the nick and PIN. A child token cannot do
 *    this, and the child must belong to the account.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const { identifier, pin, childId } = req.body ?? {};

  if (childId !== undefined) {
    const parent = getUserFromReq(req);
    if (!parent || parent.childId) return res.status(401).json({ error: 'invalid_token' });
    if (typeof childId !== 'string' || !childId) return res.status(400).json({ error: 'invalid_child_profile_id' });
    try {
      await ensureSchema();
      if (!(await ownsChild(parent.id, childId))) return res.status(404).json({ error: 'child_not_found' });
      return res.status(200).json({ token: signChildToken(parent.id, childId), childId, user: { id: parent.id } });
    } catch (err) {
      console.error('[child-login] failed:', err);
      return res.status(500).json({ error: 'login_failed' });
    }
  }

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
