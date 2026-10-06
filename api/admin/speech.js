import { deleteTtsKey, ensureSchema, listTtsKeys, saveTtsKey } from '../_lib/db.js';
import { requireAdmin } from '../_lib/admin.js';
import { decryptSecret, encryptSecret } from '../_lib/secrets.js';
import { DEFAULT_VOICE } from '../_lib/tts.js';

const VOICE_RE = /^[a-z]{2,3}-[A-Z]{2}-[A-Za-z0-9-]{1,40}$/;

/** Never send a stored key back — only its last 4 characters. */
function present(key) {
  const { encryptedKey, ...rest } = key;
  const plain = decryptSecret(encryptedKey);
  return {
    ...rest,
    voice: rest.voice || DEFAULT_VOICE,
    keyHint: plain ? `…${plain.slice(-4)}` : '',
    // False when the secret can no longer be decrypted (SECRETS_KEY changed).
    readable: Boolean(plain),
  };
}

/**
 * Admin: Google Speech keys →
 *   GET    /api/admin/speech                 all keys + who each one serves
 *   POST   /api/admin/speech  { label, key, voice, scope, accountIds }
 *   PUT    /api/admin/speech  { id, label, key?, voice, scope, accountIds }
 *   DELETE /api/admin/speech?id=…
 * `scope`: "global" (serves every account; there is one global key at a time)
 * or "accounts" (serves exactly `accountIds`). Requires `x-admin-key`.
 */
export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return undefined;

  try {
    await ensureSchema();

    if (req.method === 'GET') {
      return res.status(200).json({ keys: (await listTtsKeys()).map(present), defaultVoice: DEFAULT_VOICE });
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      const creating = req.method === 'POST';
      const { id, label, key, voice, scope, accountIds } = req.body ?? {};
      if (!creating && !Number.isInteger(id)) return res.status(400).json({ error: 'invalid_id' });

      const secret = typeof key === 'string' ? key.trim() : '';
      if (secret.length > 200 || (creating && !secret)) return res.status(400).json({ error: 'invalid_key' });

      const voiceName = typeof voice === 'string' ? voice.trim() : '';
      if (voiceName && !VOICE_RE.test(voiceName)) return res.status(400).json({ error: 'invalid_voice' });

      if (scope !== 'global' && scope !== 'accounts') return res.status(400).json({ error: 'invalid_scope' });
      const ids = Array.isArray(accountIds) ? accountIds : [];
      if (!ids.every(Number.isInteger)) return res.status(400).json({ error: 'invalid_account_ids' });

      const savedId = await saveTtsKey({
        id: creating ? null : id,
        label: typeof label === 'string' ? label.trim().slice(0, 80) : '',
        encryptedKey: secret ? encryptSecret(secret) : undefined,
        voice: voiceName || null,
        isGlobal: scope === 'global',
        accountIds: ids,
      });
      if (savedId === null) return res.status(404).json({ error: 'key_not_found' });
      return res.status(200).json({ id: savedId, keys: (await listTtsKeys()).map(present) });
    }

    if (req.method === 'DELETE') {
      const id = Number(req.query?.id);
      if (!Number.isInteger(id)) return res.status(400).json({ error: 'invalid_id' });
      if (!(await deleteTtsKey(id))) return res.status(404).json({ error: 'key_not_found' });
      return res.status(200).json({ keys: (await listTtsKeys()).map(present) });
    }

    res.setHeader('Allow', 'GET, POST, PUT, DELETE');
    return res.status(405).json({ error: 'method_not_allowed' });
  } catch (err) {
    console.error('[admin/speech] failed:', err);
    return res.status(500).json({ error: 'server_error' });
  }
}
