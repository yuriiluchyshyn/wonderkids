import { defineGeneratedSubject } from '../shared/templateModule';
import { GAMES, SUBJECT, TEXTS, getIntro } from './config';
import { buildLevel, generateTask } from './tasks';

export const mathModule = defineGeneratedSubject(SUBJECT, GAMES, { generateTask, buildLevel, getIntro, texts: TEXTS });
