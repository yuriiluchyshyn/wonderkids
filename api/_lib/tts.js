// Google Cloud Text-to-Speech (natural Ukrainian voice) — server side only, so
// the API key never reaches a browser.
import { createHash } from 'node:crypto';

const ENDPOINT = process.env.GOOGLE_TTS_ENDPOINT ?? 'https://texttospeech.googleapis.com/v1/text:synthesize';

export const DEFAULT_VOICE = 'uk-UA-Wavenet-A';
/** Voice of the English-lesson cards (`lang: 'en'`), whatever the account's own voice is. */
export const ENGLISH_VOICE = 'en-US-Wavenet-F';
export const MAX_TTS_CHARS = 400;
/** Slightly slower than normal — clearer for small listeners. */
const SPEAKING_RATE = 0.95;

const VOICE_RE = /^[a-z]{2,3}-[A-Z]{2}-[A-Za-z0-9-]{1,40}$/;

export function normaliseVoice(voice) {
  const v = String(voice ?? '').trim();
  return VOICE_RE.test(v) ? v : DEFAULT_VOICE;
}

/** Cache identity of one spoken phrase. */
export function ttsHash(voice, text) {
  return createHash('sha256').update(`${voice}|${SPEAKING_RATE}|${text}`).digest('hex');
}

/**
 * Synthesises `text` → base64 MP3. Throws an Error whose `.code` is a short
 * machine-readable reason and `.message` Google's own explanation.
 */
export async function synthesize(apiKey, voice, text) {
  let res;
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': apiKey },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode: voice.split('-').slice(0, 2).join('-'), name: voice },
        audioConfig: { audioEncoding: 'MP3', speakingRate: SPEAKING_RATE },
      }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch (err) {
    throw Object.assign(new Error(err.message), { code: 'tts_unreachable' });
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.audioContent) {
    const reason = data?.error?.message ?? `HTTP ${res.status}`;
    throw Object.assign(new Error(reason), { code: res.status === 400 || res.status === 403 ? 'tts_key_rejected' : 'tts_failed' });
  }
  return data.audioContent;
}
