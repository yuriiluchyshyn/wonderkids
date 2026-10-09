import { subjectTexts } from '../../shared/templateModule';
import { en } from './en';
import { pl } from './pl';
import type { ArtTexts } from './types';
import { uk } from './uk';

/** What the Art galaxy says in a language: `artTexts(config.lang)`. */
export const artTexts = subjectTexts<ArtTexts>({ uk, en, pl });
