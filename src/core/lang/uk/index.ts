import type { Language } from '../types.ts';
import { config } from './config.ts';
import { letterName } from './letters.ts';
import { fraction, sign } from './math.ts';
import { voiced } from './voice.ts';

export * from '../marks.ts';
export * from './letters.ts';
export * from './numbers.ts';
export * from './phrase.ts';
export * from './voice.ts';

export const uk: Language = { ...config, voiced, letterName, sign, fraction };
