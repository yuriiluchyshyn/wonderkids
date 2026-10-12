import type { GameGroup, SubCategory } from './types';

export interface GameSet<T extends SubCategory = SubCategory> {
  group?: GameGroup;
  subs: T[];
}

/**
 * The games of a galaxy in their sets (the Language galaxy: one per language),
 * in the order the sets first appear; a galaxy without sets is one unnamed set.
 */
export function setsOf<T extends SubCategory>(subs: T[]): GameSet<T>[] {
  const sets = new Map<string, GameSet<T>>();
  for (const sub of subs) {
    const id = sub.group?.id ?? '';
    if (!sets.has(id)) sets.set(id, { group: sub.group, subs: [] });
    sets.get(id)?.subs.push(sub);
  }
  return [...sets.values()];
}
