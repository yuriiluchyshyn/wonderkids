/**
 * Pure answer checks for the UI templates — Engine-Layer rules kept apart from
 * rendering so they are trivially testable (no React, no `@/` imports).
 */

/** Every item sits on the slot it belongs to. */
export function isMatchComplete(pairs: Record<string, string>, placed: Record<string, string>): boolean {
  return Object.keys(pairs).every((item) => placed[item] === pairs[item]);
}

/** Positions (0-based) where the current order already agrees with the right one. */
export function correctPositions(correct: string[], current: string[]): boolean[] {
  return current.map((id, i) => correct[i] === id);
}

export function isSequenceCorrect(correct: string[], current: string[]): boolean {
  return correct.length === current.length && correctPositions(correct, current).every(Boolean);
}

/** Tolerant float compare for fraction weights (1/2 vs 3/6). */
export function sameValue(a: number, b: number): boolean {
  return Math.abs(a - b) < 1e-9;
}

/** −1: left pan heavier, 0: balanced, 1: right pan heavier. */
export function scaleTilt(left: number, right: number): -1 | 0 | 1 {
  if (sameValue(left, right)) return 0;
  return right > left ? 1 : -1;
}

/** Are all selected cells one piece (4-neighbour connected)? */
export function isConnected(cells: ReadonlySet<number>, cols: number): boolean {
  if (cells.size === 0) return false;
  const [first] = cells;
  const seen = new Set<number>([first]);
  const stack = [first];
  while (stack.length > 0) {
    const c = stack.pop() as number;
    const col = c % cols;
    const next = [c - cols, c + cols];
    if (col > 0) next.push(c - 1);
    if (col < cols - 1) next.push(c + 1);
    for (const n of next) {
      if (cells.has(n) && !seen.has(n)) {
        seen.add(n);
        stack.push(n);
      }
    }
  }
  return seen.size === cells.size;
}

/** Perimeter (in cell sides) of a set of grid cells. */
export function perimeter(cells: ReadonlySet<number>, cols: number): number {
  let p = 0;
  for (const c of cells) {
    const col = c % cols;
    if (!cells.has(c - cols)) p += 1;
    if (!cells.has(c + cols)) p += 1;
    if (col === 0 || !cells.has(c - 1)) p += 1;
    if (col === cols - 1 || !cells.has(c + 1)) p += 1;
  }
  return p;
}

/** Can you step from one grid cell to the other (side by side)? */
export function isAdjacent(a: number, b: number, cols: number): boolean {
  const dr = Math.abs(Math.floor(a / cols) - Math.floor(b / cols));
  const dc = Math.abs((a % cols) - (b % cols));
  return dr + dc === 1;
}

/**
 * The next cell to step on to get from `from` to `goal` walking only over
 * `walkable` cells (shortest way), or null when there is none — the maze hint
 * shows just this one step, never the whole route.
 */
export function nextStepTowards(from: number, goal: number, walkable: ReadonlySet<number>, cols: number): number | null {
  if (from === goal) return null;
  const cameFrom = new Map<number, number>([[from, from]]);
  const queue = [from];
  while (queue.length > 0) {
    const cell = queue.shift() as number;
    if (cell === goal) break;
    for (const next of walkable) {
      if (!cameFrom.has(next) && isAdjacent(cell, next, cols)) {
        cameFrom.set(next, cell);
        queue.push(next);
      }
    }
  }
  if (!cameFrom.has(goal)) return null;
  let cell = goal;
  while (cameFrom.get(cell) !== from) cell = cameFrom.get(cell) as number;
  return cell;
}

/**
 * Bubble pop: may the bubble with face `tapped` be popped now? `faces` are the
 * faces in the right order, `popped` how many are gone already. Compared by
 * face, so the two «МА» of «МАМА» are interchangeable.
 */
export function isNextBubble(faces: readonly string[], popped: number, tapped: string): boolean {
  return popped < faces.length && faces[popped] === tapped;
}

/** Colour mixer: are these exactly the paints of the recipe (any order)? */
export function isRecipe(recipe: readonly string[], poured: readonly string[]): boolean {
  return poured.length === recipe.length && [...poured].sort().join('|') === [...recipe].sort().join('|');
}

/** Smallest distance between any two points — dot-to-dot stars must not overlap. */
export function minGap(points: readonly { x: number; y: number }[]): number {
  let min = Infinity;
  for (let i = 0; i < points.length; i += 1) {
    for (let j = i + 1; j < points.length; j += 1) {
      min = Math.min(min, Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y));
    }
  }
  return min;
}

/** Letter table: does the letter `itemId` belong in the cell at `index`? `order` are the ids in the right order. */
export function isLetterPlace(order: readonly string[], itemId: string, index: number): boolean {
  return order[index] === itemId;
}

/** Letter table: the ids as the child sees them — in order, with the two swapped cells exchanged. */
export function withSwap<T>(order: readonly T[], swapped?: readonly [number, number]): T[] {
  const shown = [...order];
  if (swapped) [shown[swapped[0]], shown[swapped[1]]] = [shown[swapped[1]], shown[swapped[0]]];
  return shown;
}

/**
 * Word search: the cells of the straight line from cell `a` to cell `b` of a
 * `cols`-wide table — across, down or slanting at 45° — or null when the two
 * are not on one line.
 */
export function lineCells(cols: number, a: number, b: number): number[] | null {
  const [ra, ca, rb, cb] = [Math.floor(a / cols), a % cols, Math.floor(b / cols), b % cols];
  const dr = Math.sign(rb - ra);
  const dc = Math.sign(cb - ca);
  const steps = Math.max(Math.abs(rb - ra), Math.abs(cb - ca));
  if (!(ra === rb || ca === cb || Math.abs(rb - ra) === Math.abs(cb - ca))) return null;
  return Array.from({ length: steps + 1 }, (_, i) => (ra + dr * i) * cols + ca + dc * i);
}

/**
 * Which of the words not found yet a line spells — read either way, so a
 * word may be drawn from its last letter too. Matched by its letters, not by
 * where it was hidden: the same word met by chance elsewhere counts as well.
 */
export function wordOnLine(letters: readonly string[], cells: readonly number[], words: readonly { id: string; word: string }[], found: readonly string[]): string | null {
  const text = cells.map((c) => letters[c]).join('');
  const back = [...text].reverse().join('');
  return words.find((w) => !found.includes(w.id) && (w.word === text || w.word === back))?.id ?? null;
}
