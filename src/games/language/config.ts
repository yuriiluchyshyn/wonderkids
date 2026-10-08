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
 * Every language the galaxy teaches: the same games are made for each
 * pack. To add a language, add its pack to `content/` and list it here.
 */
export const PACKS: LangPack[] = [UK, EN];

/** What every language game has in common, whatever the language. */
const COMMON: Record<GameKind, Pick<GameCard, 'mechanics' | 'tasksPerLevel'>> = {
  // A table with many letters to place is a long task: five to a level.
  alphabet: { mechanics: Mechanics.LetterGrid, tasksPerLevel: 5 },
  // Every other one is several moves a task too (a word to spell, three pairs
  // to join, a sentence to build), so ten made a level drag: five, in both languages.
  bubbles: { mechanics: Mechanics.BubblePop, tasksPerLevel: 5 },
  chain: { mechanics: Mechanics.DragMatch, tasksPerLevel: 5 },
  rhymes: { mechanics: Mechanics.DragMatch, tasksPerLevel: 5 },
  sentences: { mechanics: Mechanics.ChronoSequence, tasksPerLevel: 5 },
};

/** What the child is told when the path reaches a new stage of a game: [step, text]. */
function stageIntros(kind: GameKind, uk: boolean): [step: number, text: string][] {
  switch (kind) {
    case 'alphabet':
      return [
        [STAGE.abcPlain, 'Тепер у порожніх клітинках немає підказок. Згадай, яка літера за якою стоїть!'],
        [STAGE.abcLong, 'Таблиця стала більшою: тепер у ній три рядки літер.'],
        [STAGE.abcSpot, 'Тепер усі літери на місці — але дві з них помінялися місцями. Знайди й торкнись однієї з них!'],
        [STAGE.abcWhole, uk ? 'Перед тобою вся абетка! Постав на місця всі літери, яких бракує.' : 'Перед тобою вся англійська абетка! Постав на місця всі літери, яких бракує.'],
      ];
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
      // The hub's language filter: one flag per pack.
      group: { id: pack.lang, icon: pack.flag, label: pack.name },
      publishDate: V6_RELEASE,
      hasText: true,
    };
  });
}

/** The games of this subject — the same set per language, in the order the hub lists them. */
export const GAMES: GameCard[] = PACKS.flatMap(cardsOf);
