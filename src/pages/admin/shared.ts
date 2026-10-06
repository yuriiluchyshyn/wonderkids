import { ApiError, type AdminAccount, type SpeechKey } from '@/core/api/client';

export const ADMIN_KEY_STORAGE = 'wk-admin-key';

const ERRORS: Record<string, string> = {
  invalid_admin_key: 'Невірний ключ адміністратора.',
  admin_not_configured: 'На сервері не задано ADMIN_KEY (мінімум 8 символів).',
  network_error: 'Немає зв’язку із сервером.',
  invalid_voice: 'Назва голосу має вигляд uk-UA-Wavenet-A.',
  invalid_key: 'Вкажи API-ключ (до 200 символів).',
  key_not_found: 'Цей ключ уже видалено.',
  tts_key_rejected: 'Google відхилив ключ.',
  tts_unreachable: 'Не вдалося з’єднатися з Google.',
  no_key: 'Ключ не збережено.',
};

export function errorText(err: unknown): string {
  if (err instanceof ApiError) return ERRORS[err.code] ?? `Помилка: ${err.code}`;
  return err instanceof Error ? err.message : 'Невідома помилка';
}

export const errorFor = (code: string | undefined) => ERRORS[code ?? ''] ?? 'Не вдалося.';

export const formatDate = (iso: string | number | null) =>
  iso ? new Date(iso).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

/** Which voice an account really gets, and why. */
export interface SpeechStatus {
  /** The key in effect (own key first, then the global one), if any. */
  key: SpeechKey | null;
  source: 'own' | 'global' | 'none';
  /** True when the family actually hears the cloud voice. */
  live: boolean;
  text: string;
}

export function speechStatus(account: AdminAccount, keys: SpeechKey[]): SpeechStatus {
  const own = keys.find((k) => k.id === account.speechKeyId) ?? null;
  const global = keys.find((k) => k.isGlobal) ?? null;
  const key = own ?? global;
  const source = own ? 'own' : global ? 'global' : 'none';
  if (!key) return { key, source, live: false, text: 'немає ключа' };
  const name = key.label || `ключ ${key.keyHint}`;
  const which = source === 'own' ? `свій ключ «${name}»` : `глобальний ключ «${name}»`;
  return account.speechOff
    ? { key, source, live: false, text: `вимкнено (${which})` }
    : { key, source, live: true, text: `працює: ${which}` };
}
