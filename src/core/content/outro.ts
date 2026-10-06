import type { TaskInstance } from '@/core/kernel/types';

const STORE_KEY = 'wk-outro-v1';

type Cursor = Record<string, number>;

function load(): Cursor {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) ?? '{}') as Cursor;
  } catch {
    return {};
  }
}

function save(cursor: Cursor): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(cursor));
  } catch {
    /* private mode — the rotation simply restarts next time */
  }
}

/**
 * The fact to tell after this task is solved. A task may carry a whole pool of
 * texts; each solve takes the next one, starting from a random place, so the
 * child hears every text of the pool before any of them comes round again.
 * The position is remembered per pool on the device.
 */
export function pickOutro(task: Pick<TaskInstance, 'outro'>): string | undefined {
  const { outro } = task;
  if (!outro) return undefined;
  if (typeof outro === 'string') return outro;
  if (outro.length === 0) return undefined;
  if (outro.length === 1) return outro[0];

  // The cursor belongs to the pool, not the task: tasks sharing a pool (every
  // paper item of «Еко-патруль») then never tell the same text twice in a row.
  const key = `${outro.length}:${outro[0]}`;
  const cursor = load();
  const at = (cursor[key] ?? Math.floor(Math.random() * outro.length)) % outro.length;
  cursor[key] = (at + 1) % outro.length;
  save(cursor);
  return outro[at];
}
