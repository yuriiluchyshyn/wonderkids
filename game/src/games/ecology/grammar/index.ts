import { subjectTexts } from '../../shared/templateModule';
import { en } from './en';
import { pl } from './pl';
import type { EcologyTexts } from './types';
import { uk } from './uk';

/** What the Ecology galaxy says in a language: `ecologyTexts(config.lang)`. */
export const ecologyTexts = subjectTexts<EcologyTexts>({ uk, en, pl });
