/** The visitor's source, remembered on this device (see `../source.ts`). */
import type { SignupSource } from '../source.ts';

const STORAGE_KEY = 'pulsar-source-v1';

/** The source remembered on this device. */
export function readSource(): SignupSource | undefined {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as SignupSource | null;
    return saved && typeof saved.source === 'string' && saved.source ? saved : undefined;
  } catch {
    return undefined;
  }
}

export function saveSource(source: SignupSource): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(source));
  } catch {
    /* private mode or blocked storage — the visitor simply goes on without a source */
  }
}
