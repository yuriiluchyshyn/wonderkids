// Auth0 for the parent login: verifies the ID token the browser got from
// Auth0 Universal Login. The API keeps issuing its own session token
// (auth.js) — Auth0 only proves who the parent is.
import { createPublicKey } from 'node:crypto';
import jwt from 'jsonwebtoken';

/**
 * Tenant domain and SPA client id. Both are public values the frontend needs
 * too, so the API reads the same `VITE_AUTH0_*` variables instead of asking
 * for a second copy. Read on every call so an edited .env.local applies in dev.
 */
export function auth0Config() {
  const domain = (process.env.VITE_AUTH0_DOMAIN ?? '')
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/\/+$/, '');
  const clientId = (process.env.VITE_AUTH0_CLIENT_ID ?? '').trim();
  return domain && clientId ? { domain, clientId } : null;
}

/** Without both variables the parent login stays email-only. */
export function auth0Enabled() {
  return auth0Config() !== null;
}

/** Signing keys by `kid`, per tenant; refetched when a token names a new key. */
const keyCache = new Map();

async function signingKey(domain, kid) {
  const cacheKey = `${domain}|${kid}`;
  if (!keyCache.has(cacheKey)) {
    const res = await fetch(`https://${domain}/.well-known/jwks.json`);
    if (!res.ok) throw new Error(`jwks_http_${res.status}`);
    const { keys = [] } = await res.json();
    for (const jwk of keys) {
      if (jwk.kty === 'RSA' && jwk.kid && (jwk.use ?? 'sig') === 'sig') {
        keyCache.set(`${domain}|${jwk.kid}`, createPublicKey({ key: jwk, format: 'jwk' }));
      }
    }
  }
  const key = keyCache.get(cacheKey);
  if (!key) throw new Error('unknown_signing_key');
  return key;
}

/**
 * Verify an Auth0 ID token: RS256 signature against the tenant's keys, issued
 * by our tenant, for our application, not expired. Returns its claims; throws
 * on anything else.
 */
export async function verifyIdToken(idToken) {
  const config = auth0Config();
  if (!config) throw new Error('auth0_not_configured');

  const kid = jwt.decode(String(idToken), { complete: true })?.header?.kid;
  if (!kid) throw new Error('malformed_token');

  return jwt.verify(idToken, await signingKey(config.domain, kid), {
    algorithms: ['RS256'],
    issuer: `https://${config.domain}/`,
    audience: config.clientId,
  });
}
