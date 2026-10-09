import { subjectTexts } from '../../shared/templateModule';
import { en } from './en';
import { pl } from './pl';
import type { LogicTexts } from './types';
import { uk } from './uk';

export type { LogicTexts } from './types';

/** What the Logic galaxy says in a language: `logicTexts(config.lang)`. */
export const logicTexts = subjectTexts<LogicTexts>({ uk, en, pl });
