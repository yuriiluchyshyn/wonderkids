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
  name: string;
  icon: string;
  /** Registered learning-module id when the galaxy is live; absent = soon. */
  moduleId?: string;
  comingSoon?: boolean;
  /** Icons that float in the galactic background for this galaxy. */
  motif: string[];
}

export const GALAXIES: Galaxy[] = [
  { id: 'math', name: 'Математика', icon: '🧮', moduleId: 'math', motif: ['➕', '➖', '✖️', '➗', '🔢', '📐'] },
  { id: 'geography', name: 'Географія', icon: '🌍', moduleId: 'geography', motif: ['🌍', '🗺️', '🧭', '⛰️', '🏔️'] },
  { id: 'ecology', name: 'Екологія', icon: '♻️', moduleId: 'ecology', motif: ['♻️', '🌱', '🌳', '💧', '🐝'] },
  { id: 'history', name: 'Історія', icon: '🏛️', moduleId: 'history', motif: ['🏛️', '🦖', '⏳', '🏰', '📜'] },
  { id: 'language', name: 'Мова', icon: '🔤', comingSoon: true, motif: ['🔤', '📚', '✏️', '💬', '📝'] },
  { id: 'science', name: 'Природа', icon: '🌿', moduleId: 'nature', motif: ['🌿', '❄️', '🌷', '☀️', '🍂'] },
  { id: 'music', name: 'Музика', icon: '🎵', comingSoon: true, motif: ['🎵', '🎶', '🎹', '🥁', '🎺'] },
];

/** The galaxy the hub opens on. */
export const DEFAULT_GALAXY_ID = GALAXIES.find((g) => g.moduleId)?.id ?? GALAXIES[0].id;

export function getGalaxy(id: string): Galaxy {
  return GALAXIES.find((g) => g.id === id) ?? GALAXIES[0];
}
