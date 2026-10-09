import type { LangCode } from '../../../lang/types.ts';
import { en } from './en.ts';
import { pl } from './pl.ts';
import type { WorldWords } from './types.ts';

const WORDS: Partial<Record<LangCode, WorldWords>> = { en, pl };

/**
 * The words of «Мій світ» laid over the Ukrainian content — nothing for
 * Ukrainian itself (and for a language that has none yet): then the content's
 * own words stand.
 */
export const worldWords = (lang?: LangCode): WorldWords | undefined => (lang ? WORDS[lang] : undefined);
