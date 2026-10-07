import { defineSubject } from '../shared/templateModule';
import { GAMES, SUBJECT } from './config';
import { TASKS } from './tasks';

export const ecologyModule = defineSubject(SUBJECT, GAMES, TASKS);
