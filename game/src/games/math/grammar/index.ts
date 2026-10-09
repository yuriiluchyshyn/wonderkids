import { DEFAULT_LANG, type LangCode } from '@/core/language';
import { en } from './en';
import { pl } from './pl';
import type { MathTexts } from './types';
import { uk } from './uk';

export type { MathTexts } from './types';

const TEXTS: Record<LangCode, MathTexts> = { uk, en, pl };

/** What the Math galaxy says in `lang` — Ukrainian when no language is asked for. */
export const mathTexts = (lang: LangCode = DEFAULT_LANG): MathTexts => TEXTS[lang];

/** The languages the galaxy's games are written in. */
export const MATH_LANGS = Object.keys(TEXTS) as LangCode[];
