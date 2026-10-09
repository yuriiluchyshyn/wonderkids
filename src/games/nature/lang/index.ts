import { subjectTexts } from '../../shared/templateModule';
import { en } from './en';
import { pl } from './pl';
import type { NatureTexts } from './types';
import { uk } from './uk';

/** What the Nature galaxy says in a language: `natureTexts(config.lang)`. */
export const natureTexts = subjectTexts<NatureTexts>({ uk, en, pl });
