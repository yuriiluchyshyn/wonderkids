import { defineSubject } from '../shared/templateModule';
import { GAMES, SUBJECT } from './config';
import { TASKS } from './tasks';

export const artModule = defineSubject(SUBJECT, GAMES, TASKS);
