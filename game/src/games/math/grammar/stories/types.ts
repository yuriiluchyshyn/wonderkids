import type { CurrencyId } from '@/core/game/content/currency';

/**
 * The words of «Задачі» in one language.
 *
 * A story problem is drawn once (`generators/wordProblems.ts`): which frame,
 * which skin, which numbers, whether its hero is a boy or a girl. Here it is
 * only TOLD — so the same draw can be told in the language on the screen and
 * in the voice's, and stay one problem. Nothing in a language's file may roll
 * dice or decide what the problem is.
 */

export type Frame =
  | 'join' | 'gotMore' | 'cameIn' | 'gave' | 'wentAway'
  | 'twoKinds' | 'left20' | 'howManyMore' | 'howManyFewer' | 'missing'
  | 'totalPrice' | 'change' | 'notEnough' | 'repriced' | 'threeAdd'
  | 'groups' | 'priceTimes' | 'rows' | 'share' | 'pack'
  | 'timesPlus' | 'timesChange' | 'shareMinus' | 'timesMore' | 'timesFewer'
  | 'moreTotal' | 'timed' | 'speed' | 'thought' | 'twoBuys' | 'halves';

/** Who the story is about: a boy or a girl, and which of the eight names. */
export interface StoryHero {
  boy: boolean;
  name: number;
}

export interface StoryTold {
  text: string;
  how: string;
}

export interface StoryWords {
  /** Tells a problem: the numbers come in the order the frame draws them (see the generator). */
  tell(frame: Frame, skin: number, n: number[], hero: StoryHero | undefined, money: CurrencyId): StoryTold;
  /** The few words written under the pictures of a problem. */
  chips: {
    /** Where the two piles of «join» are: «на столі», «в кошику». */
    join(skin: number): [string, string];
    howManyMore: string;
    howManyFewer: string;
    change: string;
    lack: string;
    half: string;
    when: string;
    price(n: number, money: CurrencyId): string;
    eachPrice(n: number, money: CurrencyId): string;
    by(n: number): string;
    each(n: number): string;
    extra(n: number): string;
    timesMore(n: number): string;
    timesFewer(n: number): string;
    moreBy(n: number): string;
    at(hour: number): string;
    hours(n: number): string;
    speed(km: number): string;
  };
}
