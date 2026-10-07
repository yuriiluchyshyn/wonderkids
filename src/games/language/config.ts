import { Mechanics } from '@/core/game/kernel/mechanics';
import { V6_RELEASE, type GameCard, type SubjectDef } from '../shared/templateModule';
import { EN } from './content/en';
import { UK } from './content/uk';
import { GAME_KINDS, LANGUAGE_STEPS, STAGE, type GameKind, type LangPack } from './tasks';

/** The subject as the hub shows it. */
export const SUBJECT: SubjectDef = {
  id: 'language',
  title: 'Мова',
  icon: '🔤',
  accent: '#f59e0b',
};

/**
 * Every language the galaxy teaches: the same four games are made for each
 * pack. To add a language, add its pack to `content/` and list it here.
 */
export const PACKS: LangPack[] = [UK, EN];

/** What every language game has in common, whatever the language. */
const COMMON: Record<GameKind, Pick<GameCard, 'mechanics'>> = {
  bubbles: { mechanics: Mechanics.BubblePop },
  chain: { mechanics: Mechanics.DragMatch },
  rhymes: { mechanics: Mechanics.DragMatch },
  sentences: { mechanics: Mechanics.ChronoSequence },
};

/** What the child is told when the path reaches a new stage of a game: [step, text]. */
function stageIntros(kind: GameKind, uk: boolean): [step: number, text: string][] {
  switch (kind) {
    case 'bubbles':
      return [
        [STAGE.parts, uk ? 'Тепер у бульбашках — склади. Лопай їх по порядку, щоб вийшло слово!' : 'Тепер збираємо короткі англійські слова. Лопай літери так, як вони стоять у слові!'],
        [STAGE.spell, uk ? 'А тепер складаємо слова з окремих літер. Лопай літеру за літерою!' : 'Слова стають довшими. Лопай літеру за літерою — зліва направо!'],
        [STAGE.strays, uk ? 'Тепер слово не написане — послухай його і склади сам. Обережно: серед бульбашок є зайві літери!' : 'Обережно: серед бульбашок тепер є зайві літери. Вони не лопаються!'],
      ];
    case 'chain':
      return [
        [STAGE.sameLetter, 'Тепер з’єднуємо два слова, які починаються на однакову літеру.'],
        [STAGE.halves, 'Слово розпалося на дві половинки! Знайди для кожного початку його закінчення.'],
        [STAGE.assoc, 'Тепер шукаємо слова, пов’язані за змістом: що з чим буває разом?'],
      ];
    case 'sentences':
      return [
        [STAGE.three, 'Речення стають довшими: тепер у них три слова.'],
        [STAGE.long, 'А тепер — справжні великі речення з чотирьох і п’яти слів!'],
      ];
    default:
      return [];
  }
}

/** The cards of one language: its own titles and texts on top of the common settings. */
function cardsOf(pack: LangPack): GameCard[] {
  return GAME_KINDS.map((kind) => {
    const intros = stageIntros(kind, pack.lang === 'uk');
    return {
      id: `${pack.prefix}${kind}`,
      gameId: `language_${pack.lang}_${kind}`,
      ...pack.cards[kind],
      ...COMMON[kind],
      introFor: (step: number) => intros.find(([from]) => from === step)?.[1],
      steps: LANGUAGE_STEPS,
      tasksPerLevel: 10,
      publishDate: V6_RELEASE,
      hasText: true,
    };
  });
}

/** The games of this subject — four per language, in the order the hub lists them. */
export const GAMES: GameCard[] = PACKS.flatMap(cardsOf);
