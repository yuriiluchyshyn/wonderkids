import { subjectTexts } from '../../shared/templateModule';
import { en } from './en';
import { pl } from './pl';
import type { HistoryTexts } from './types';
import { uk } from './uk';

/** What the History galaxy says in a language: `historyTexts(config.lang)`. */
export const historyTexts = subjectTexts<HistoryTexts>({ uk, en, pl });
