import { defineSubject } from '../shared/templateModule';
import { GAMES, SUBJECT } from './config';
import { TASKS } from './tasks';

export const historyModule = defineSubject(SUBJECT, GAMES, TASKS);
