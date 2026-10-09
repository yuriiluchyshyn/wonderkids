import type { AppKey } from '@/core/i18n/app';

/**
 * Galaxies = subjects (PRD). Each galaxy holds planets (adventures / learning
 * module sub-categories): Математика → планета додавання, віднімання, …
 *
 * A galaxy is live when it points at a registered learning module; the rest
 * are placeholders shown in the galaxy picker as "coming soon" so the universe
 * reads as bigger than what is playable today.
 */
export interface Galaxy {
  id: string;
  icon: string;
  /** Registered learning-module id when the galaxy is live; absent = soon. */
  moduleId?: string;
  comingSoon?: boolean;
  /** Icons that float in the galactic background for this galaxy. */
  motif: string[];
}

export const GALAXIES: Galaxy[] = [
  { id: 'math', icon: '🧮', moduleId: 'math', motif: ['➕', '➖', '✖️', '➗', '🔢', '📐'] },
  { id: 'geography', icon: '🌍', moduleId: 'geography', motif: ['🌍', '🗺️', '🧭', '⛰️', '🏔️'] },
  { id: 'ecology', icon: '♻️', moduleId: 'ecology', motif: ['♻️', '🌱', '🌳', '💧', '🐝'] },
  { id: 'history', icon: '🏛️', moduleId: 'history', motif: ['🏛️', '🦖', '⏳', '🏰', '📜'] },
  { id: 'language', icon: '🔤', moduleId: 'language', motif: ['🔤', '📚', '✏️', '💬', '📝'] },
  { id: 'logic', icon: '🧩', moduleId: 'logic', motif: ['🧩', '🔷', '🔺', '🪞', '♟️'] },
  { id: 'astronomy', icon: '🔭', moduleId: 'astronomy', motif: ['🔭', '🪐', '⭐', '🌙', '☄️'] },
  { id: 'art', icon: '🎨', moduleId: 'art', motif: ['🎨', '🖌️', '🌈', '✏️', '🖍️'] },
  { id: 'science', icon: '🌿', moduleId: 'nature', motif: ['🌿', '❄️', '🌷', '☀️', '🍂'] },
  { id: 'music', icon: '🎵', comingSoon: true, motif: ['🎵', '🎶', '🎹', '🥁', '🎺'] },
];

/** The galaxy the hub opens on. */
export const DEFAULT_GALAXY_ID = GALAXIES.find((g) => g.moduleId)?.id ?? GALAXIES[0].id;

/** The key of a galaxy's name in the app dictionary: `t(galaxyKey(galaxy.id))`. */
export const galaxyKey = (id: string): AppKey => `galaxy.${id}` as AppKey;

export function getGalaxy(id: string): Galaxy {
  return GALAXIES.find((g) => g.id === id) ?? GALAXIES[0];
}
