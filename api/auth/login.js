import { createParent, ensureSchema, findParentByEmail } from '../_lib/db.js';
import { isValidEmail, signToken } from '../_lib/auth.js';
import { normaliseEmail, suggestEmail } from '../_lib/email.js';

/**
 * Parent login by email → POST /api/auth/login  { email, create? }
 *
 * No password yet (POC). Signing in NEVER creates an account by itself: an
 * unknown address answers 404 `account_not_found` (with a `suggestion` when the
 * domain looks mistyped), and the account is only created when the client
 * repeats the call with `create: true` after the parent confirmed it. This is
 * what stops a typo from quietly producing a second, empty account.
 *
 * One mailbox = one account: `Name.Surname+x@googlemail.com` signs in to the
 * same account as `namesurname@gmail.com`.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

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
