import { subjectTexts } from '../../shared/templateModule';
import { en } from './en';
import { pl } from './pl';
import type { LanguageTexts } from './types';
import { uk } from './uk';

/** What the Language galaxy says in a language of the screen: `languageTexts(config.lang)`. */
export const languageTexts = subjectTexts<LanguageTexts>({ uk, en, pl });
