import { Mechanics } from '@/core/game/kernel/mechanics';
import type { TaskConfig, TaskInstance } from '@/core/game/kernel/types';
import type { TemplatePayload } from '@/core/game/templates/types';
import { shuffle } from '@/core/utils/random';
import { factPool } from '../shared/facts';
import { card, templateTask, type GameTasks } from '../shared/templateModule';
import { ECO_QUESTIONS, type EcoQuestion } from './content/questions';
import { BINS, MORE_RUBBISH, RUBBISH } from './content/rubbish';
import { ecologyTexts } from './grammar';
import type { EcologyTexts } from './grammar/types';

function recycling(step: number, config: Pick<TaskConfig, 'lang'>): TaskInstance<TemplatePayload>[] {
  const T = ecologyTexts(config.lang);
  const bins = BINS.map((b) => card(b.id, b.emoji, T.bin(b.id).name));
  const wrongSay = Object.fromEntries(BINS.map((b) => [b.id, `${T.bin(b.id).no} ${T.retry}`]));
  const all = [...RUBBISH, ...MORE_RUBBISH];
  // Every thing gets a story of its own bin, dealt out in turn.
  const dealt: Record<string, number> = {};
  return all.map((r) => {
    const story = T.facts(r.bin)[dealt[r.bin] ?? 0];
    dealt[r.bin] = (dealt[r.bin] ?? 0) + 1;
    const words = T.rubbish(r.id);
    return templateTask(
      `bin:${r.id}`,
      T.ask(r.id),
      {
        template: Mechanics.SorterBins,
        item: card(r.id, r.emoji, words.name),
        bins,
        correctBinId: r.bin,
        wrongSay,
        // The first things have a clue of their own; the rest are told how to know their bin.
        hint: words.clue ?? T.bin(r.bin).clue,
      },
      step,
      factPool(T.yes(r.id, r.bin), story),
    );
  });
}

/** Answers on a «Чому так?» board: the right one and eight wrong. */
const CHOICES = 9;

/**
 * Wrong answers for a question: its own (the hand-made ones have two), then
 * the right answers of other topics' questions — of the same kind first, so
 * a «why» is answered with reasons and a «what» with things. Which questions
 * they come from is decided by the Ukrainian content, so the board is the
 * same in every language; only then are the words taken in the task's own.
 */
function wrongAnswers(q: EcoQuestion, T: EcologyTexts): string[] {
  const others = ECO_QUESTIONS.filter((o) => o.topic !== q.topic && o.right !== q.right);
  const sameKind = shuffle(others.filter((o) => o.kind === q.kind));
  const rest = shuffle(others.filter((o) => o.kind !== q.kind));
  const picked = new Map<string, string>();
  q.wrong.forEach((text, i) => picked.set(text, T.why(q.id).wrong[i] ?? text));
  for (const o of [...sameKind, ...rest]) if (!picked.has(o.right)) picked.set(o.right, T.why(o.id).right);
  return [...picked.values()].slice(0, CHOICES - 1);
}

function whyQuestions(step: number, config: Pick<TaskConfig, 'lang'>): TaskInstance<TemplatePayload>[] {
  const T = ecologyTexts(config.lang);
  return ECO_QUESTIONS.filter((q) => q.level <= step).map((q) => {
    const words = T.why(q.id);
    return templateTask(
      `eco:why:${q.id}`,
      words.question,
      {
        template: Mechanics.GridChoice,
        cols: 1,
        stimulus: { emoji: q.emoji },
        options: shuffle([card('right', undefined, words.right), ...wrongAnswers(q, T).map((text, i) => card(`w${i}`, undefined, text))]),
        correctId: 'right',
        hint: words.why,
      },
      step,
      words.why,
    );
  });
}

export const TASKS: Record<string, GameTasks> = {
  recycling: { pool: recycling },
  why: { pool: whyQuestions },
};
