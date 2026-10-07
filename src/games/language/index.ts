import { defineSubject } from '../shared/templateModule';
import { GAMES, PACKS, SUBJECT } from './config';
import { languageTasks } from './tasks';

export const languageModule = defineSubject(SUBJECT, GAMES, Object.assign({}, ...PACKS.map(languageTasks)));
