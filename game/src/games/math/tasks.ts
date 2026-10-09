import type { TaskConfig, TaskInstance } from '@/core/game/kernel/types';
import { generateMentalMath } from './generators/mentalMath';
import { generateFraction } from './generators/fractions';
import { generateFractionOps } from './generators/fractionOps';
import { generateBalance } from './generators/balance';
import { generateGeometry } from './generators/geometry';
import { generateMaze } from './generators/maze';
import { generateShop } from './generators/shop';
import { generateCompare } from './generators/compare';
import { generateClock } from './generators/clock';
import { generateWordProblem } from './generators/wordProblems';
import { MATH_SUB } from './ids';

/**
 * Makes one task of a game: every game has its own generator in `generators/`.
 * All of them produce payloads for the shared templates.
 */
export function generateTask(config: TaskConfig): TaskInstance {
  switch (config.subCategoryId) {
    case MATH_SUB.fractions:
      return generateFraction(config);
    case MATH_SUB.fractionOps:
      return generateFractionOps(config);
    case MATH_SUB.balance:
      return generateBalance(config);
    case MATH_SUB.geometry:
      return generateGeometry(config);
    case MATH_SUB.maze:
      return generateMaze(config);
    case MATH_SUB.shop:
      return generateShop(config);
    case MATH_SUB.compare:
      return generateCompare(config);
    case MATH_SUB.wordProblems:
      return generateWordProblem(config);
    case MATH_SUB.clock:
      return generateClock(config);
    default:
      return generateMentalMath(config);
  }
}
