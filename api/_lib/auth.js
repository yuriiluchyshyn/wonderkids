// Shared auth helpers for the serverless API functions.
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-only-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '30d';

export { isValidEmail } from './email.js';

/** Sign a token identifying a (parent) account user. */
export function signToken(user) {
  return jwt.sign({ email: user.email }, JWT_SECRET, {
    subject: String(user.id),
    expiresIn: JWT_EXPIRES_IN,
  });
}

/** Sign a child session token (subject = owning account id, plus childId). */
export function signChildToken(userId, childId) {
  return jwt.sign({ childId }, JWT_SECRET, {
    subject: String(userId),
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Verify the Bearer token on a request. Returns `{ id, email, childId }` (the
 * account id; `childId` is set only for a child session) or null when the
 * token is missing or invalid.
 */
export function getUserFromReq(req) {
  const header = req.headers.authorization ?? '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return { id: Number(payload.sub), email: payload.email, childId: payload.childId ?? null };
  } catch {
    return null;
  }
}
