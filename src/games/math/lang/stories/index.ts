import { subjectTexts } from '../../../shared/templateModule';
import { en } from './en';
import { pl } from './pl';
import type { StoryWords } from './types';
import { uk } from './uk';

/** The words of «Задачі» in a language: `storyWords(lang)`. */
export const storyWords = subjectTexts<StoryWords>({ uk, en, pl });
