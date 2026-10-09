import type { Language } from '../types.ts';
import { config } from './config.ts';
import { letterName } from './letters.ts';
import { fraction, sign } from './math.ts';
import { voiced } from './voice.ts';

export * from './letters.ts';
export * from './numbers.ts';
export * from './voice.ts';

export const pl: Language = { ...config, voiced, letterName, sign, fraction };
