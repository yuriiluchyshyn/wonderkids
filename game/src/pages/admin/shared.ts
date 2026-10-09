import { ApiError, type AdminAccount, type SpeechKey } from '@/core/account/api/client';

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
  mail_failed: 'Лист не надіслано.',
  no_reply_address: 'Автор не залишив пошти.',
  invalid_reply: 'Напиши відповідь (до 4000 знаків).',
  not_found: 'Цього звернення вже немає.',
  invalid_demo_minutes: 'Тривалість пробної гри — ціле число хвилин від 1 до 60.',
  invalid_name: 'Дай посиланню назву.',
  invalid_mode: 'Обери, куди веде посилання.',
  invalid_code: 'Код — від 2 до 40 знаків: латинські малі літери, цифри, дефіс.',
  code_taken: 'Посилання з таким кодом уже є — впиши інший код.',
  link_not_found: 'Цього посилання вже немає.',
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

/** Edit distance between two strings (small inputs only). */
function distance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const next = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = row[j];
      row[j] = next;
    }
  }
  return row[b.length];
}

/**
 * Other accounts whose email is within a couple of keystrokes of this one —
 * almost always the same person who mistyped once (gamil.com, a swapped
 * letter). They are different addresses, so the server cannot merge them; the
 * admin decides which to remove.
 */
export function lookalikes(account: AdminAccount, all: AdminAccount[]): AdminAccount[] {
  return all.filter((other) => other.id !== account.id && distance(other.email, account.email) <= 2);
}
