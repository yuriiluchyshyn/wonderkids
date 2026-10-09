import { subjectTexts } from '../../shared/templateModule';
import { en } from './en';
import { pl } from './pl';
import type { GeographyTexts } from './types';
import { uk } from './uk';

/** What the Geography galaxy says in a language: `geographyTexts(config.lang)`. */
export const geographyTexts = subjectTexts<GeographyTexts>({ uk, en, pl });
