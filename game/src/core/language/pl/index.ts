import { NO_STRESS } from '../stress.ts';
import type { Language } from '../types.ts';
import { config } from './config.ts';
import { letterName } from './letters.ts';
import { fraction, sign } from './math.ts';
import { voiced } from './voice.ts';

export * from './letters.ts';
export * from './numbers.ts';
export * from './voice.ts';

/** Polish stress falls on the last syllable but one, and voices know it: no dictionary (yet). */
export const pl: Language = { ...config, voiced, stress: NO_STRESS, letterName, sign, fraction };
