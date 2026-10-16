import { NO_STRESS } from '../stress.ts';
import type { Language } from '../types.ts';
import { config } from './config.ts';
import { letterName } from './letters.ts';
import { fraction, sign } from './math.ts';
import { voiced } from './voice.ts';

export * from './letters.ts';
export * from './numbers.ts';
export * from './voice.ts';

/** English voices stress English well enough: no dictionary (yet). A `stress.json` here and `stressOf` would add one. */
export const en: Language = { ...config, voiced, stress: NO_STRESS, letterName, sign, fraction };
