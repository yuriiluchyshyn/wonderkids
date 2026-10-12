import { defineSubject } from '../shared/templateModule';
import { GAMES, PACKS, SUBJECT } from './config';
import { languageTasks } from './tasks';
import { WORD_SEARCH, wordSearchTasks } from './wordSearch';

export const languageModule = defineSubject(SUBJECT, GAMES, Object.assign({}, ...PACKS.map(languageTasks), ...PACKS.map((pack) => ({ [`${pack.prefix}${WORD_SEARCH}`]: wordSearchTasks(pack) }))));
