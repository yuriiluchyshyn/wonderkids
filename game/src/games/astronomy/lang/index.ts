import { subjectTexts } from '../../shared/templateModule';
import { en } from './en';
import { pl } from './pl';
import type { AstronomyTexts } from './types';
import { uk } from './uk';

/** What the Astronomy galaxy says in a language: `astronomyTexts(config.lang)`. */
export const astronomyTexts = subjectTexts<AstronomyTexts>({ uk, en, pl });
