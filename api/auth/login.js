import { ensureSchema, upsertUser } from '../_lib/db.js';
import { isValidEmail, signToken } from '../_lib/auth.js';

/**
 * Email-only login → POST /api/auth/login
 * No password yet (POC): submitting an email creates the account if needed and
 * returns a token for that identity.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const { email } = req.body ?? {};
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'invalid_email' });
  }

  try {
    await ensureSchema();
    const user = await upsertUser(email);
    const token = signToken(user);
    return res.status(200).json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error('[login] failed:', err);
    return res.status(500).json({ error: 'login_failed' });
  }
}
