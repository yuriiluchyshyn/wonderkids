import { ensureSchema, getTtsKey } from '../_lib/db.js';
import { requireAdmin } from '../_lib/admin.js';
import { decryptSecret } from '../_lib/secrets.js';
import { normaliseVoice, synthesize } from '../_lib/tts.js';

const SAMPLE = 'Привіт! Я твій новий голос. Рахуймо разом: один, два, три!';

/**
 * Admin: try a stored Google key →  POST /api/admin/tts-test  { keyId }
 * Always calls Google (no cache) so a bad key shows up immediately. Returns
 * `{ ok: true, audio }` or `{ ok: false, error, detail }` with Google's reason.
 */
export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return undefined;
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  const { keyId } = req.body ?? {};
  if (!Number.isInteger(keyId)) return res.status(400).json({ error: 'invalid_id' });

  try {
    await ensureSchema();
    const config = await getTtsKey(keyId);
    const apiKey = decryptSecret(config?.encryptedKey);
    if (!apiKey) return res.status(200).json({ ok: false, error: 'no_key', detail: 'Ключ не збережено.' });
    try {
      const audio = await synthesize(apiKey, normaliseVoice(config?.voice), SAMPLE);
      return res.status(200).json({ ok: true, audio });
    } catch (err) {
      return res.status(200).json({ ok: false, error: err.code ?? 'tts_failed', detail: err.message });
    }
  } catch (err) {
    console.error('[admin/tts-test] failed:', err);
    return res.status(500).json({ error: 'server_error' });
  }
}
