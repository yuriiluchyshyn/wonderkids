/**
 * What waits on a step of a path, and what makes a step plain.
 *
 * A path carries three different things, and each used to work out for itself
 * which steps were its own:
 *
 *   a progression gift   every 5th step (🎀), every 10th (🎁), the last (🏆)
 *   a treasure chest     every 3rd step that is not a gift step
 *   a key of knowledge   every 3–5 steps, drawn from the game's id (`keySteps`)
 *
 * The first two are drawn on the step itself; a key is a badge pinned to its
 * corner. When a key fell on a gift or a chest the two pictures sat on top of
 * one another and neither could be made out — so keys are laid out on the
 * plain steps only (`keyStepsOnPath`), and this is where all three agree on
 * what a step holds.
 *
 * Pure (no imports) so it runs under `node --test`.
 */

/** Which progression gift sits on a step, if any. */
export type GiftTier = 'small' | 'big' | 'biggest' | null;

export function giftTierOf(step: number, total: number): GiftTier {
  if (total > 0 && step === total) return 'biggest';
  if (step % 10 === 0) return 'big';
  if (step % 5 === 0) return 'small';
  return null;
}

/** Does a progression gift wait on this step? */
export function isGiftStep(step: number, total: number): boolean {
  return giftTierOf(step, total) !== null;
}

/**
 * Whether a treasure chest is hidden on this step. Chests land on every 3rd
 * step that isn't already a gift step (and never the very first step), so the
 * path alternates between gifts and hidden treasures.
 */
export function hasChest(step: number, total: number): boolean {
  if (step <= 1) return false;
  return step % 3 === 0 && !isGiftStep(step, total);
}

/** A step with nothing drawn on it: no gift, no chest — room for a key's badge. */
export function isPlainStep(step: number, total: number): boolean {
  return !isGiftStep(step, total) && !hasChest(step, total);
}
