import { createParent, ensureSchema, findParentByEmail } from '../_lib/db.js';
import { isValidEmail, signToken } from '../_lib/auth.js';
import { auth0Enabled, verifyIdToken } from '../_lib/auth0.js';

/**
 * Parent login through Auth0 → POST /api/auth/auth0  { idToken }
 *
 * The browser signs in on Auth0 Universal Login and sends the ID token here;
 * we verify it and answer with our own session token, exactly like the
 * email-only login did. The account is still found by mailbox (`email_key`),
 * so parents who registered before Auth0 keep their children and progress.
 *
 * The address must be VERIFIED by Auth0: the email is the account identity, so
 * an unverified one would let anybody sign up with someone else's address and
 * open their account. For the same reason a new address needs no "create?"
 * confirmation here — a verified address cannot be a typo.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  if (!auth0Enabled()) {
    return res.status(503).json({ error: 'auth0_not_configured' });
  }

  const { idToken } = req.body ?? {};
  if (typeof idToken !== 'string' || !idToken) {
    return res.status(400).json({ error: 'invalid_token' });
  }

  let claims;
  try {
    claims = await verifyIdToken(idToken);
  } catch (err) {
    console.warn('[auth0] token rejected:', err instanceof Error ? err.message : err);
    return res.status(401).json({ error: 'invalid_token' });
  }

  if (!isValidEmail(claims.email)) {
    return res.status(403).json({ error: 'email_missing' });
  }
  if (claims.email_verified !== true) {
    return res.status(403).json({ error: 'email_not_verified', email: claims.email });
  }

  try {
    await ensureSchema();
    let user = await findParentByEmail(claims.email);
    const created = !user;
    if (!user) user = await createParent(claims.email);

    const token = signToken(user);
    return res.status(200).json({ token, user: { id: user.id, email: user.email }, created });
  } catch (err) {
    console.error('[auth0] login failed:', err);
    return res.status(500).json({ error: 'login_failed' });
  }
}
