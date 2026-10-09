import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { auth0Enabled, verifyIdToken } from '../api/_lib/auth0.js';

const DOMAIN = 'tenant.example.auth0.com';
const CLIENT_ID = 'client-123';

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const jwks = { keys: [{ ...publicKey.export({ format: 'jwk' }), kid: 'key-1', use: 'sig', alg: 'RS256' }] };

// The tenant's key set, served without a network.
globalThis.fetch = async (url) => {
  assert.equal(String(url), `https://${DOMAIN}/.well-known/jwks.json`);
  return { ok: true, json: async () => jwks };
};

function idToken(overrides = {}, { key = privateKey, kid = 'key-1', algorithm = 'RS256' } = {}) {
  return jwt.sign(
    {
      iss: `https://${DOMAIN}/`,
      aud: CLIENT_ID,
      email: 'mama@example.com',
      email_verified: true,
      ...overrides,
    },
    key,
    { algorithm, keyid: kid, subject: 'auth0|1', expiresIn: '5m' },
  );
}

function configure() {
  process.env.VITE_AUTH0_DOMAIN = `https://${DOMAIN}/`;
  process.env.VITE_AUTH0_CLIENT_ID = CLIENT_ID;
}

test('Auth0 is off until both variables are set', () => {
  delete process.env.VITE_AUTH0_DOMAIN;
  delete process.env.VITE_AUTH0_CLIENT_ID;
  assert.equal(auth0Enabled(), false);
  process.env.VITE_AUTH0_DOMAIN = DOMAIN;
  assert.equal(auth0Enabled(), false);
  configure();
  assert.equal(auth0Enabled(), true);
});

test('a token signed by the tenant for this app is accepted', async () => {
  configure();
  const claims = await verifyIdToken(idToken());
  assert.equal(claims.email, 'mama@example.com');
  assert.equal(claims.email_verified, true);
});

test('tokens for another app, tenant or key are rejected', async () => {
  configure();
  await assert.rejects(verifyIdToken(idToken({ aud: 'someone-else' })));
  await assert.rejects(verifyIdToken(idToken({ iss: 'https://evil.example.com/' })));
  await assert.rejects(verifyIdToken(idToken({}, { kid: 'unknown-key' })));

  const stranger = generateKeyPairSync('rsa', { modulusLength: 2048 }).privateKey;
  await assert.rejects(verifyIdToken(idToken({}, { key: stranger })));

  // A token "signed" with a shared secret must never pass as RS256.
  await assert.rejects(verifyIdToken(idToken({}, { key: 'secret', algorithm: 'HS256' })));
  await assert.rejects(verifyIdToken('not-a-token'));
});

test('an expired token is rejected', async () => {
  configure();
  const expired = jwt.sign({ email: 'mama@example.com', exp: Math.floor(Date.now() / 1000) - 60 }, privateKey, {
    algorithm: 'RS256',
    keyid: 'key-1',
    issuer: `https://${DOMAIN}/`,
    audience: CLIENT_ID,
  });
  await assert.rejects(verifyIdToken(expired));
});
