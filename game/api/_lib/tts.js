// Google Cloud Text-to-Speech (natural Ukrainian voice) — server side only, so
// the API key never reaches a browser.
import { createHash } from 'node:crypto';

const ENDPOINT = process.env.GOOGLE_TTS_ENDPOINT ?? 'https://texttospeech.googleapis.com/v1/text:synthesize';

/**
 * The voice of each language the app speaks (`src/core/lang`). A new language
 * is a new line here — the only place a cloud voice is named.
 */
export const VOICES = {
  uk: 'uk-UA-Wavenet-A',
  en: 'en-US-Wavenet-F',
  pl: 'pl-PL-Wavenet-A',
};
export const DEFAULT_LANG = 'uk';
export const DEFAULT_VOICE = VOICES[DEFAULT_LANG];
export const MAX_TTS_CHARS = 400;
/** Slightly slower than normal — clearer for small listeners. */
const SPEAKING_RATE = 0.95;

const VOICE_RE = /^[a-z]{2,3}-[A-Z]{2}-[A-Za-z0-9-]{1,40}$/;

export function normaliseVoice(voice) {
  const v = String(voice ?? '').trim();
  return VOICE_RE.test(v) ? v : DEFAULT_VOICE;
}

/** `lang` as the client sent it → one of ours. */
export function normaliseLang(lang) {
  return Object.hasOwn(VOICES, lang) ? lang : DEFAULT_LANG;
}

/**
 * The voice that reads `lang` for an account: the one configured with its key
 * when that is a voice of this language, the language's own otherwise — a
 * Ukrainian voice must never be handed a Polish or an English phrase.
 */
export function voiceFor(lang, configured) {
  const voice = normaliseVoice(configured);
  return voice.toLowerCase().startsWith(`${lang}-`) ? voice : VOICES[lang];
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
