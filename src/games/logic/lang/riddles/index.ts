import { subjectTexts } from '../../../shared/templateModule';
import { en } from './en';
import { pl } from './pl';
import type { RiddleWords } from './types';
import { uk } from './uk';

/** The words of «Логічні задачі» in a language: `riddleWords(lang)`. */
export const riddleWords = subjectTexts<RiddleWords>({ uk, en, pl });
