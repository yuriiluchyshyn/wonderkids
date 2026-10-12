import type { ModuleTexts } from '@/core/game/kernel/types';
import type { ColorId, MixId, PaintId, ThingId } from '../content/data';

/** Everything the Art galaxy says, in one language. */
export interface ArtTexts {
  cards?: ModuleTexts;
  /** What the mixer tells when a new kind of mixing begins on `step`. */
  introFor(step: number): string | undefined;
  /** What a tube is called: «Червоний», «Блискітки». */
  paints: Record<PaintId, string>;
  /** What a colour is called: «Фіолетовий», «Блискучий рожевий». */
  colors: Record<ColorId, string>;
  /** The thing to colour: «Жабка». */
  thing(id: ThingId): string;
  /** «Жабка має стати зеленою. Які дві фарби треба змішати?» — with three paints or glitter as the mix asks. */
  prompt(thing: ThingId, mix: MixId): string;
  hint(mix: MixId): string;
  outro(mix: MixId): string;
  /** «Вивчаємо кольори»: «Вибери жовтий колір.» */
  pickColor(color: ColorId): string;
  /** «Який це колір?» */
  nameColor: string;
}
