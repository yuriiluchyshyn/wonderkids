import { createParent, ensureSchema, findParentByEmail } from '../_lib/db.js';
import { isValidEmail, signToken } from '../_lib/auth.js';
import { auth0Enabled, verifyIdToken } from '../_lib/auth0.js';
import { normaliseEmail, suggestEmail } from '../_lib/email.js';

/**
 * Parent login → POST /api/auth/login
 *
 * Two modes in one endpoint (the Vercel Hobby plan allows 12 functions, and
 * this project uses all of them — a new endpoint fails the deployment):
 *
 * **Auth0** (when configured, see ../_lib/auth0.js) — body `{ idToken }`. The
 * browser signs in on Auth0 Universal Login and sends the ID token here; we
 * verify it and answer with our own session token. The account is still found
 * by mailbox (`email_key`), so parents who registered before Auth0 keep their
 * children and progress. The address must be VERIFIED by Auth0: the email is
 * the account identity, so an unverified one would let anybody sign up with
 * someone else's address and open their account. For the same reason a new
 * address needs no "create?" confirmation — a verified address cannot be a typo.
 *
 * **Email only** (the fallback while Auth0 is not configured; with Auth0 it
 * answers 403 `auth0_required`) — body `{ email, create? }`. No password
 * (POC). Signing in NEVER creates an account by itself: an unknown address
 * answers 404 `account_not_found` (with a `suggestion` when the domain looks
 * mistyped), and the account is only created when the client repeats the call
 * with `create: true` after the parent confirmed it. This is what stops a typo
 * from quietly producing a second, empty account.
 *
 * One mailbox = one account: `Name.Surname+x@googlemail.com` signs in to the
 * same account as `namesurname@gmail.com`.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  if (auth0Enabled()) return auth0Login(req, res);

  const { email, create } = req.body ?? {};
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'invalid_email' });
  }

  try {
    await ensureSchema();
    let user = await findParentByEmail(email);
    let created = false;

    if (!user) {
      if (create !== true) {
        const suggestion = suggestEmail(email);
        return res.status(404).json({
          error: 'account_not_found',
          email: normaliseEmail(email),
          suggestion,
          // Lets the UI say "you probably meant X — that account exists".
          suggestionExists: suggestion ? Boolean(await findParentByEmail(suggestion)) : false,
        });
      }
      user = await createParent(email);
      created = true;
    }

    const token = signToken(user);
    return res.status(200).json({ token, user: { id: user.id, email: user.email }, created });
  } catch (err) {
    console.error('[login] failed:', err);
    return res.status(500).json({ error: 'login_failed' });
  }
}

async function auth0Login(req, res) {
  const { idToken } = req.body ?? {};
  // An address alone proves nothing once Auth0 is on.
  if (idToken === undefined) {
    return res.status(403).json({ error: 'auth0_required' });
  }
  if (typeof idToken !== 'string' || !idToken) {
    return res.status(400).json({ error: 'invalid_token' });
  }

  let claims;
  try {
    claims = await verifyIdToken(idToken);
  } catch (err) {
    console.warn('[login] Auth0 token rejected:', err instanceof Error ? err.message : err);
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
    console.error('[login] failed:', err);
    return res.status(500).json({ error: 'login_failed' });
  }
}
