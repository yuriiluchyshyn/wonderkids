import type { ModuleTexts } from '@/core/game/kernel/types';
import type { MixId, PaintId } from '../content/data';

/** Everything the Art galaxy says, in one language. */
export interface ArtTexts {
  cards?: ModuleTexts;
  introFor(step: number): string | undefined;
  /** What a tube of paint is called: «Червоний». */
  paints: Record<PaintId, string>;
  /** What a mixed colour is called: «Фіолетовий». */
  mixes: Record<MixId, string>;
  /** The thing to colour — `at` is its place among all the things of `STEPS`, in order. */
  thing(at: number): string;
  /** «Жабка має стати зеленою. Які дві фарби треба змішати?» */
  prompt(at: number, mix: MixId): string;
  hint(mix: MixId, a: PaintId, b: PaintId): string;
  outro(mix: MixId, a: PaintId, b: PaintId): string;
}
