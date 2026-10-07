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
  /**
   * `counted` — the name after a number, lower-case: one, two–four, five and
   * more («цеглинка», «цеглинки», «цеглинок»). Read out on the win screen.
   */
  artifact: { name: string; emoji: string; counted: [one: string, few: string, many: string] };
  /**
   * The "play-time" token shown in the always-visible time header: a row of
   * them drains one-by-one as the session burns down — a wordless clock. It is
   * an hourglass or a magic time crystal depending on the theme, and must never
   * be a star or the theme's artifact: stars mean progress, difficulty and
   * rewards only (PRD v4.0 §2.1).
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
  | 'minecraft'
  | 'galaxy';
