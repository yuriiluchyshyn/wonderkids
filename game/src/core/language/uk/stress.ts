/**
 * Where Ukrainian words are stressed — for the cloud voice (`../stress.ts`).
 *
 * Ukrainian has no rule that says which syllable is stressed, so every word the
 * app says is written once with its stress in `stress.json`. `npm run stress`
 * (in `game/`) lists the words the app says that it does not know yet, and
 * `npm run check:content` fails while there are any.
 *
 * Deliberately free of React and of `@/` imports so it runs under `node --test`.
 */
import { stressOf, type StressFile } from '../stress.ts';

export const stress = stressOf(() => import('./stress.json', { with: { type: 'json' } }).then((m) => m.default as StressFile), {
  letters: /^[а-щьюяєіїґ’'-]+$/,
  vowels: /[аеєиіїоуюя]/g,
});
