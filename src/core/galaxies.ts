/**
 * Galaxies = subjects (PRD). Each galaxy holds planets (adventures / learning
 * module sub-categories): Математика → планета додавання, віднімання, …
 *
 * Only "Математика" is implemented today (it maps to the `math` learning
 * module). The rest are placeholders shown in the galaxy picker as "coming
 * soon" so the universe reads as bigger than one subject.
 */
export interface Galaxy {
  id: string;
  name: string;
  icon: string;
  /** Registered learning-module id when the galaxy is live; absent = soon. */
  moduleId?: string;
  comingSoon?: boolean;
}

export const GALAXIES: Galaxy[] = [
  { id: 'math', name: 'Математика', icon: '🧮', moduleId: 'math' },
  { id: 'geography', name: 'Географія', icon: '🌍', comingSoon: true },
  { id: 'language', name: 'Мова', icon: '🔤', comingSoon: true },
  { id: 'science', name: 'Природа', icon: '🔬', comingSoon: true },
  { id: 'music', name: 'Музика', icon: '🎵', comingSoon: true },
];

/** The galaxy the hub opens on. */
export const DEFAULT_GALAXY_ID = GALAXIES.find((g) => g.moduleId)?.id ?? GALAXIES[0].id;

export function getGalaxy(id: string): Galaxy {
  return GALAXIES.find((g) => g.id === id) ?? GALAXIES[0];
}
