/** A single distinct collectible the child can find hidden in path chests. */
export interface Treasure {
  id: string;
  name: string;
  emoji: string;
}

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
  /**
   * The themed "play-time" token shown in the always-visible time header. A row
   * of these drains one-by-one as the session burns down (eggs vanish, a car's
   * fuel empties, unicorns fade...) — a wordless clock the child always sees.
   */
  timeToken: { name: string; emoji: string };
  /** Emojis spawned by the celebration/particle system. */
  celebrationEmojis: string[];
  /** Themed collectibles shown on the learning-path nodes (cycled). */
  pathIcons: string[];
  /** The solo "Dream build" assembled from artifacts (ship / rocket / castle). */
  dreamBuild: { name: string; emoji: string };
  /**
   * The themed treasure chest that appears on path steps. `closed` is the
   * hidden/locked look; `open` is the burst shown as it springs open.
   */
  chest: { closed: string; open: string };
  /**
   * The pool of distinct collectibles the child discovers in chests. Each is
   * found at most once per theme (a sticker-album style collection).
   */
  treasures: Treasure[];
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
  | 'forest'
  | 'lego'
  | 'frozen'
  | 'galaxy';
