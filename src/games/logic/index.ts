import { defineSubject } from '../shared/templateModule';
import { GAMES, SUBJECT } from './config';
import { TASKS } from './tasks';

export const logicModule = defineSubject(SUBJECT, GAMES, TASKS);
