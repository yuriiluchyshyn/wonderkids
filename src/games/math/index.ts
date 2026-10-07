import { defineGeneratedSubject } from '../shared/templateModule';
import { GAMES, SUBJECT, getIntro } from './config';
import { generateTask } from './tasks';

export const mathModule = defineGeneratedSubject(SUBJECT, GAMES, { generateTask, getIntro });
