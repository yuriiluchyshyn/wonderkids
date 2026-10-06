// Encryption at rest for third-party credentials (e.g. a parent's Google
// Cloud API key). AES-256-GCM with a key derived from SECRETS_KEY (falls back
// to JWT_SECRET so local dev works without extra setup).
import { createCipheriv, createDecipheriv, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const master = process.env.SECRETS_KEY ?? process.env.JWT_SECRET ?? 'dev-only-change-me';
const key = scryptSync(master, 'wonderkids.secrets.v1', 32);

/** → "v1.<iv>.<tag>.<ciphertext>" (base64url parts). */
export function encryptSecret(plain) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const data = Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()]);
  return ['v1', iv, cipher.getAuthTag(), data].map((p) => (typeof p === 'string' ? p : p.toString('base64url'))).join('.');
}

/** Returns the plaintext, or null when the value is missing or unreadable. */
export function decryptSecret(stored) {
  if (!stored) return null;
  try {
    const [version, iv, tag, data] = String(stored).split('.');
    if (version !== 'v1') return null;
    const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64url'));
    decipher.setAuthTag(Buffer.from(tag, 'base64url'));
    return Buffer.concat([decipher.update(Buffer.from(data, 'base64url')), decipher.final()]).toString('utf8');
  } catch {
    return null;
  }
}

/** Constant-time string comparison. */
export function safeEqual(a, b) {
  const x = Buffer.from(String(a ?? ''));
  const y = Buffer.from(String(b ?? ''));
  return x.length === y.length && timingSafeEqual(x, y);
}
