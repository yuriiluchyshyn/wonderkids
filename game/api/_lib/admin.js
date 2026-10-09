// Admin access: a single shared ADMIN_KEY (env), sent as `x-admin-key`.
// Deliberately separate from parent/child tokens — parent login is email-only,
// so "being logged in as the owner's email" must never grant admin rights.
import { safeEqual } from './secrets.js';

/** Shorter keys are refused outright — too easy to guess. */
const MIN_ADMIN_KEY_LENGTH = 8;

/**
 * Returns true when the request carries the admin key. Otherwise it has
 * already answered (503 when no key is configured, 401 when it is wrong).
 */
export function requireAdmin(req, res) {
  const configured = process.env.ADMIN_KEY;
  if (!configured || configured.length < MIN_ADMIN_KEY_LENGTH) {
    res.status(503).json({ error: 'admin_not_configured' });
    return false;
  }
  if (!safeEqual(req.headers['x-admin-key'], configured)) {
    res.status(401).json({ error: 'invalid_admin_key' });
    return false;
  }
  return true;
}
