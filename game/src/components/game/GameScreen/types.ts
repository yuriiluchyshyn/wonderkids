import type { useGameSession } from '../useGameSession';

/** A level being played (`useGameSession`): its task, its progress, what the child did. */
export type GameSession = ReturnType<typeof useGameSession>;

/** The game shell opens on the game's spoken intro, then plays. */
export type Phase = 'intro' | 'play';
