import { cacheSpeech, ensureSchema, getCachedSpeech, getTtsConfig } from './_lib/db.js';
import { getUserFromReq } from './_lib/auth.js';
import { decryptSecret } from './_lib/secrets.js';
import { MAX_TTS_CHARS, normaliseVoice, synthesize, ttsHash } from './_lib/tts.js';

/**
 * Natural voice → POST /api/tts  { text }  →  { audio }  (base64 MP3)
 *
 * Uses the Google Cloud key the admin configured for this account. Phrases are
 * cached in the database (the game repeats the same lines constantly), so each
 * one is paid for once. 404 `tts_disabled` tells the client to fall back to the
 * browser's own voice.
 */
export default async function handler(req, res) {
  const user = getUserFromReq(req);
  if (!user) return res.status(401).json({ error: 'invalid_token' });
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const text = typeof req.body?.text === 'string' ? req.body.text.replace(/\s+/g, ' ').trim() : '';
  if (!text || text.length > MAX_TTS_CHARS) return res.status(400).json({ error: 'invalid_text' });

  try {
    await ensureSchema();
    const config = await getTtsConfig(user.id);
    const apiKey = config.enabled ? decryptSecret(config.encryptedKey) : null;
    if (!apiKey) return res.status(404).json({ error: 'tts_disabled' });

    const voice = normaliseVoice(config.voice);
    const hash = ttsHash(voice, text);
    let audio = await getCachedSpeech(hash);
    if (!audio) {
      audio = await synthesize(apiKey, voice, text);
      await cacheSpeech(hash, voice, audio);
    }
    return res.status(200).json({ audio });
  } catch (err) {
    console.error('[tts] failed:', err.code ?? '', err.message);
    return res.status(502).json({ error: err.code ?? 'tts_failed' });
  }
}
