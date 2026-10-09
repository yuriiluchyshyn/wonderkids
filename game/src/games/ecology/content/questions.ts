/**
 * «Чому так?» — questions about caring for nature. Seven per topic, easiest
 * first inside a topic; the path takes one question of every topic per step.
 * `why` is the explanation told after the answer (and used as the helper).
 */
import { own, written } from '@/core/language/marks';
import { MORE_QUESTIONS } from './questionsMore';
import TEXTS from '@/locales/app/uk/games/ecology.json';

const J = TEXTS.content.questions;

export type Topic = 'waste' | 'air' | 'water' | 'climate' | 'wildlife' | 'energy';

type Question = [emoji: string, question: string, right: string, wrongA: string, wrongB: string, why: string];

const BY_TOPIC: Record<Topic, Question[]> = {
  waste: [
    ['♻️', J.BY_TOPIC.waste[0][1], J.BY_TOPIC.waste[0][2], J.BY_TOPIC.waste[0][3], J.BY_TOPIC.waste[0][4], J.BY_TOPIC.waste[0][5]],
    ['🛍️', J.BY_TOPIC.waste[1][1], J.BY_TOPIC.waste[1][2], J.BY_TOPIC.waste[1][3], J.BY_TOPIC.waste[1][4], J.BY_TOPIC.waste[1][5]],
    ['🧸', J.BY_TOPIC.waste[2][1], J.BY_TOPIC.waste[2][2], J.BY_TOPIC.waste[2][3], J.BY_TOPIC.waste[2][4], J.BY_TOPIC.waste[2][5]],
    ['🍎', J.BY_TOPIC.waste[3][1], J.BY_TOPIC.waste[3][2], J.BY_TOPIC.waste[3][3], J.BY_TOPIC.waste[3][4], J.BY_TOPIC.waste[3][5]],
    ['🔋', J.BY_TOPIC.waste[4][1], J.BY_TOPIC.waste[4][2], J.BY_TOPIC.waste[4][3], J.BY_TOPIC.waste[4][4], J.BY_TOPIC.waste[4][5]],
    ['🥕', J.BY_TOPIC.waste[5][1], J.BY_TOPIC.waste[5][2], J.BY_TOPIC.waste[5][3], J.BY_TOPIC.waste[5][4], J.BY_TOPIC.waste[5][5]],
    ['🏕️', J.BY_TOPIC.waste[6][1], J.BY_TOPIC.waste[6][2], J.BY_TOPIC.waste[6][3], J.BY_TOPIC.waste[6][4], J.BY_TOPIC.waste[6][5]],
  ],
  air: [
    ['🌳', J.BY_TOPIC.air[0][1], J.BY_TOPIC.air[0][2], J.BY_TOPIC.air[0][3], J.BY_TOPIC.air[0][4], J.BY_TOPIC.air[0][5]],
    ['🚲', J.BY_TOPIC.air[1][1], J.BY_TOPIC.air[1][2], J.BY_TOPIC.air[1][3], J.BY_TOPIC.air[1][4], J.BY_TOPIC.air[1][5]],
    ['🍂', J.BY_TOPIC.air[2][1], J.BY_TOPIC.air[2][2], J.BY_TOPIC.air[2][3], J.BY_TOPIC.air[2][4], J.BY_TOPIC.air[2][5]],
    ['🚗', J.BY_TOPIC.air[3][1], J.BY_TOPIC.air[3][2], J.BY_TOPIC.air[3][3], J.BY_TOPIC.air[3][4], J.BY_TOPIC.air[3][5]],
    ['🔥', J.BY_TOPIC.air[4][1], J.BY_TOPIC.air[4][2], J.BY_TOPIC.air[4][3], J.BY_TOPIC.air[4][4], J.BY_TOPIC.air[4][5]],
    ['🛣️', J.BY_TOPIC.air[5][1], J.BY_TOPIC.air[5][2], J.BY_TOPIC.air[5][3], J.BY_TOPIC.air[5][4], J.BY_TOPIC.air[5][5]],
    ['🌫️', J.BY_TOPIC.air[6][1], J.BY_TOPIC.air[6][2], J.BY_TOPIC.air[6][3], J.BY_TOPIC.air[6][4], J.BY_TOPIC.air[6][5]],
  ],
  water: [
    ['🚰', J.BY_TOPIC.water[0][1], J.BY_TOPIC.water[0][2], J.BY_TOPIC.water[0][3], J.BY_TOPIC.water[0][4], J.BY_TOPIC.water[0][5]],
    ['🐟', J.BY_TOPIC.water[1][1], J.BY_TOPIC.water[1][2], J.BY_TOPIC.water[1][3], J.BY_TOPIC.water[1][4], J.BY_TOPIC.water[1][5]],
    ['💧', J.BY_TOPIC.water[2][1], J.BY_TOPIC.water[2][2], J.BY_TOPIC.water[2][3], J.BY_TOPIC.water[2][4], J.BY_TOPIC.water[2][5]],
    ['🏞️', J.BY_TOPIC.water[3][1], J.BY_TOPIC.water[3][2], J.BY_TOPIC.water[3][3], J.BY_TOPIC.water[3][4], J.BY_TOPIC.water[3][5]],
    ['🌍', J.BY_TOPIC.water[4][1], J.BY_TOPIC.water[4][2], J.BY_TOPIC.water[4][3], J.BY_TOPIC.water[4][4], J.BY_TOPIC.water[4][5]],
    ['🛁', J.BY_TOPIC.water[5][1], J.BY_TOPIC.water[5][2], J.BY_TOPIC.water[5][3], J.BY_TOPIC.water[5][4], J.BY_TOPIC.water[5][5]],
    ['🎨', J.BY_TOPIC.water[6][1], J.BY_TOPIC.water[6][2], J.BY_TOPIC.water[6][3], J.BY_TOPIC.water[6][4], J.BY_TOPIC.water[6][5]],
  ],
  climate: [
    ['🧊', J.BY_TOPIC.climate[0][1], J.BY_TOPIC.climate[0][2], J.BY_TOPIC.climate[0][3], J.BY_TOPIC.climate[0][4], J.BY_TOPIC.climate[0][5]],
    ['🐻‍❄️', J.BY_TOPIC.climate[1][1], J.BY_TOPIC.climate[1][2], J.BY_TOPIC.climate[1][3], J.BY_TOPIC.climate[1][4], J.BY_TOPIC.climate[1][5]],
    ['🏜️', J.BY_TOPIC.climate[2][1], J.BY_TOPIC.climate[2][2], J.BY_TOPIC.climate[2][3], J.BY_TOPIC.climate[2][4], J.BY_TOPIC.climate[2][5]],
    ['🏭', J.BY_TOPIC.climate[3][1], J.BY_TOPIC.climate[3][2], J.BY_TOPIC.climate[3][3], J.BY_TOPIC.climate[3][4], J.BY_TOPIC.climate[3][5]],
    ['🌊', J.BY_TOPIC.climate[4][1], J.BY_TOPIC.climate[4][2], J.BY_TOPIC.climate[4][3], J.BY_TOPIC.climate[4][4], J.BY_TOPIC.climate[4][5]],
    ['🌲', J.BY_TOPIC.climate[5][1], J.BY_TOPIC.climate[5][2], J.BY_TOPIC.climate[5][3], J.BY_TOPIC.climate[5][4], J.BY_TOPIC.climate[5][5]],
    ['🧒', J.BY_TOPIC.climate[6][1], J.BY_TOPIC.climate[6][2], J.BY_TOPIC.climate[6][3], J.BY_TOPIC.climate[6][4], J.BY_TOPIC.climate[6][5]],
  ],
  wildlife: [
    ['🐦', J.BY_TOPIC.wildlife[0][1], J.BY_TOPIC.wildlife[0][2], J.BY_TOPIC.wildlife[0][3], J.BY_TOPIC.wildlife[0][4], J.BY_TOPIC.wildlife[0][5]],
    ['🌰', J.BY_TOPIC.wildlife[1][1], J.BY_TOPIC.wildlife[1][2], J.BY_TOPIC.wildlife[1][3], J.BY_TOPIC.wildlife[1][4], J.BY_TOPIC.wildlife[1][5]],
    ['🐝', J.BY_TOPIC.wildlife[2][1], J.BY_TOPIC.wildlife[2][2], J.BY_TOPIC.wildlife[2][3], J.BY_TOPIC.wildlife[2][4], J.BY_TOPIC.wildlife[2][5]],
    ['🌼', J.BY_TOPIC.wildlife[3][1], J.BY_TOPIC.wildlife[3][2], J.BY_TOPIC.wildlife[3][3], J.BY_TOPIC.wildlife[3][4], J.BY_TOPIC.wildlife[3][5][1] + own(J.BY_TOPIC.wildlife[3][5][2])],
    ['🐣', J.BY_TOPIC.wildlife[4][1], J.BY_TOPIC.wildlife[4][2], J.BY_TOPIC.wildlife[4][3], J.BY_TOPIC.wildlife[4][4], J.BY_TOPIC.wildlife[4][5]],
    ['🐜', J.BY_TOPIC.wildlife[5][1], J.BY_TOPIC.wildlife[5][2], J.BY_TOPIC.wildlife[5][3], J.BY_TOPIC.wildlife[5][4], J.BY_TOPIC.wildlife[5][5]],
    ['🪓', J.BY_TOPIC.wildlife[6][1], J.BY_TOPIC.wildlife[6][2], J.BY_TOPIC.wildlife[6][3], J.BY_TOPIC.wildlife[6][4], J.BY_TOPIC.wildlife[6][5]],
  ],
  energy: [
    ['💡', J.BY_TOPIC.energy[0][1], J.BY_TOPIC.energy[0][2], J.BY_TOPIC.energy[0][3], J.BY_TOPIC.energy[0][4], J.BY_TOPIC.energy[0][5]],
    ['☀️', J.BY_TOPIC.energy[1][1], J.BY_TOPIC.energy[1][2], J.BY_TOPIC.energy[1][3], J.BY_TOPIC.energy[1][4], J.BY_TOPIC.energy[1][5]],
    ['🌬️', J.BY_TOPIC.energy[2][1], J.BY_TOPIC.energy[2][2], J.BY_TOPIC.energy[2][3], J.BY_TOPIC.energy[2][4], J.BY_TOPIC.energy[2][5]],
    ['🔆', J.BY_TOPIC.energy[3][1], J.BY_TOPIC.energy[3][2], J.BY_TOPIC.energy[3][3], J.BY_TOPIC.energy[3][4], J.BY_TOPIC.energy[3][5]],
    ['🔌', J.BY_TOPIC.energy[4][1], J.BY_TOPIC.energy[4][2], J.BY_TOPIC.energy[4][3], J.BY_TOPIC.energy[4][4], J.BY_TOPIC.energy[4][5]],
    ['🧥', J.BY_TOPIC.energy[5][1], J.BY_TOPIC.energy[5][2], J.BY_TOPIC.energy[5][3], J.BY_TOPIC.energy[5][4], J.BY_TOPIC.energy[5][5]],
    ['🚪', J.BY_TOPIC.energy[6][1], J.BY_TOPIC.energy[6][2], J.BY_TOPIC.energy[6][3], J.BY_TOPIC.energy[6][4], J.BY_TOPIC.energy[6][5]],
  ],
};

const TOPICS = Object.keys(BY_TOPIC) as Topic[];
export const QUESTIONS_PER_TOPIC = BY_TOPIC.waste.length;

export interface EcoQuestion {
  id: string;
  topic: Topic;
  emoji: string;
  question: string;
  right: string;
  /** Hand-written wrong answers, where the question has them. */
  wrong: string[];
  why: string;
  kind: AnswerKind;
  /** The path step this question belongs to. */
  level: number;
}

/** What a question asks for — wrong answers on the board are of the same kind, so none stands out by its shape. */
export type AnswerKind = 'why' | 'what' | 'how';
const kindOf = (marked: string, question = written(marked)): AnswerKind => (/^(Чому|Навіщо)/.test(question) ? 'why' : /^(Як|Куди|Де|Звідки|Коли|Скільки)(\s|$)/.test(question) ? 'how' : 'what');

/** Questions a path step opens — five new ones, as on every path (docs/level-design.md). */
export const QUESTIONS_PER_STEP = 5;

const HAND_MADE: Omit<EcoQuestion, 'level'>[] = Array.from({ length: QUESTIONS_PER_TOPIC }, (_, round) =>
  TOPICS.map((topic) => {
    const [emoji, question, right, wrongA, wrongB, why] = BY_TOPIC[topic][round];
    return { id: `${topic}${round}`, topic, emoji, question, right, wrong: [wrongA, wrongB], why, kind: kindOf(question) };
  }),
).flat();

const MORE: Omit<EcoQuestion, 'level'>[] = (() => {
  const byTopic = TOPICS.map((topic) =>
    MORE_QUESTIONS[topic]
      .trim()
      .split('\n')
      .map((line, i) => {
        const [emoji, question, right, why] = line.split('|');
        return { id: `${topic}m${i}`, topic, emoji, question, right, wrong: [], why, kind: kindOf(question) };
      }),
  );
  // One of every topic per round, so a level never dwells on a single topic.
  return Array.from({ length: Math.max(...byTopic.map((t) => t.length)) }, (_, round) => byTopic.flatMap((t) => (t[round] ? [t[round]] : []))).flat();
})();

/**
 * Every question in the order the path opens them, each with its own `level`
 * — the path step it first appears on. A question never moves to another level.
 */
export const ECO_QUESTIONS: EcoQuestion[] = [...HAND_MADE, ...MORE].map((q, i) => ({ ...q, level: Math.floor(i / QUESTIONS_PER_STEP) + 1 }));

/** Path length: as many steps as the questions fill, five a step. */
export const WHY_STEPS = Math.floor(ECO_QUESTIONS.length / QUESTIONS_PER_STEP);

/** Nine more things to tell per topic; a question adds its own explanation. */
export const TOPIC_FACTS: Record<Topic, string[]> = J.TOPIC_FACTS;
