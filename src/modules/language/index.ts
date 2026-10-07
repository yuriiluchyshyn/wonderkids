import { defineTemplateModule } from '../shared/templateModule';
import { EN } from './en';
import { languageGames } from './games';
import { UK } from './uk';

/**
 * The Language galaxy (Tech Spec v6 §2.1): the same four games — bubble pop,
 * word chain, rhyme matcher, sentence builder — once in Ukrainian and once as
 * English lessons. Mechanics live in `games.ts`; a language is one `LangPack`.
 */
export const languageModule = defineTemplateModule({
  id: 'language',
  title: 'Мова',
  icon: '🔤',
  accent: '#f59e0b',
  games: [...languageGames(UK), ...languageGames(EN)],
});
