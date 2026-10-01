/** A deep skin of the whole app — not just a palette (per PRD §6). */
export interface Theme {
  id: ThemeId;
  name: string;
  icon: string;
  /** Companion that travels across the math race track. */
  mascot: { name: string; emoji: string };
  /** The goal the mascot travels toward (apple → rainbow, finish flag, ...). */
  goal: { name: string; emoji: string };
  /** Collectible artifact earned per task. */
  artifact: { name: string; emoji: string };
  /** Emojis spawned by the celebration/particle system. */
  celebrationEmojis: string[];
  /** Themed collectibles shown on the learning-path nodes (cycled). */
  pathIcons: string[];
  /** The solo "Dream build" assembled from artifacts (ship / rocket / castle). */
  dreamBuild: { name: string; emoji: string };
  /** CSS custom properties applied to :root when the theme is active. */
  palette: {
    bg1: string;
    bg2: string;
    surface: string;
    surfaceInk: string;
    primary: string;
    primaryInk: string;
    accent: string;
    accentInk: string;
    text: string;
    textSoft: string;
    ring: string;
  };
}

export type ThemeId =
  | 'unicorns'
  | 'cars'
  | 'space'
  | 'dinos'
  | 'underwater'
  | 'forest';
