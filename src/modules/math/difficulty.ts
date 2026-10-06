/**
 * Maps a path step (1..50) to concrete math difficulty parameters. This is the
 * per-module interpretation of the shared difficulty coefficient — the single
 * place that defines how "hard" each step is for the Math subject. Tune here.
 */

/** Largest operand for addition/subtraction at a given step (≈5 → ≈950). */
export function addSubMax(step: number): number {
  return Math.round(5 + Math.pow(step, 1.75));
}

/** Largest factor for multiplication at a given step (2 → ~27). */
export function mulFactorMax(step: number): number {
  return Math.min(30, 2 + Math.floor(step / 2));
}

/** Divisor/quotient ceiling for division at a given step (2 → ~12). */
export function divFactorMax(step: number): number {
  return Math.min(12, 2 + Math.floor(step / 3));
}

/**
 * Denominator ceiling for «Смачні Дроби» at a given step (2 → 8). The game is
 * an introduction (PRD v4.0: ⭐, 10 levels), so it grows one slice at a time.
 */
export function fractionDenomMax(step: number): number {
  return Math.min(8, 2 + Math.floor((step - 1) * 0.7));
}

/** Spread of the distractor answers — wider as it gets harder. */
export function optionSpread(step: number): number {
  return Math.max(3, Math.min(20, Math.round(step / 2) + 2));
}

/** Apples awarded per task — grows modestly with difficulty (1 → ~9). */
export function rewardForStep(step: number): number {
  return 1 + Math.floor(step / 6);
}
