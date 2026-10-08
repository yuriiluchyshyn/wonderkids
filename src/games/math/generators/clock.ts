import { Mechanics } from '@/core/game/kernel/mechanics';
import type { TaskConfig, TaskInstance } from '@/core/game/kernel/types';
import type { ClockTime, GridChoicePayload } from '@/core/game/templates/types';
import { pick, randInt, shuffle, uid } from '@/core/utils/random';
import { rewardForStep } from '../difficulty';

/** «третя година» — hours 1..12. */
const HOUR = ['', 'перша', 'друга', 'третя', 'четверта', 'п’ята', 'шоста', 'сьома', 'восьма', 'дев’ята', 'десята', 'одинадцята', 'дванадцята'];
/** «пів на четверту», «чверть на четверту» — the hour that is coming. */
const HOUR_TO = ['', 'першу', 'другу', 'третю', 'четверту', 'п’яту', 'шосту', 'сьому', 'восьму', 'дев’яту', 'десяту', 'одинадцяту', 'дванадцяту'];

/** Answers on the board: the right time and five near misses. */
const OPTIONS = 6;

const nextHour = (h: number) => (h % 12) + 1;
const digital = ({ h, m }: ClockTime) => `${h}:${String(m).padStart(2, '0')}`;
const same = (a: ClockTime, b: ClockTime) => a.h === b.h && a.m === b.m;

/** How people say the time: «третя година», «пів на четверту», «за чверть четверта». */
export function sayTime({ h, m }: ClockTime): string {
  if (m === 0) return `${HOUR[h]} година`;
  if (m === 30) return `пів на ${HOUR_TO[nextHour(h)]}`;
  if (m === 15) return `чверть на ${HOUR_TO[nextHour(h)]}`;
  if (m === 45) return `за чверть ${HOUR[nextHour(h)]}`;
  return `${HOUR[h]} година ${m} хвилин`;
}

/** Which minutes a path step asks about. */
function minutesAt(step: number): number[] {
  if (step <= 3) return [0];
  if (step <= 5) return [0, 30];
  if (step <= 7) return [0, 15, 30, 45];
  return [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
}

const INTRO = {
  hours: 'На годиннику дві стрілки. Коротка показує години. Коли довга стрілка дивиться прямо вгору, на дванадцять, — це рівно година. Подивись, куди показує коротка!',
  half: 'Коли довга стрілка дивиться вниз, на шість, минуло пів години. Коротка стрілка тоді стоїть між двома числами.',
  quarter: 'Довга стрілка на трійці — минула чверть години. А якщо вона на дев’ятці — до нової години лишилася чверть.',
  minutes: 'Довга стрілка показує хвилини. Кожне число на годиннику — це ще п’ять хвилин: один — п’ять, два — десять, три — п’ятнадцять.',
};

export function clockIntro(step: number): string {
  if (step <= 3) return INTRO.hours;
  if (step <= 5) return INTRO.half;
  if (step <= 7) return INTRO.quarter;
  return INTRO.minutes;
}

function hintFor({ h, m }: ClockTime): string {
  const long = m === 0 ? 'дивиться вгору, на дванадцять' : `показує на ${m / 5}`;
  const short = m === 0 ? `показує на ${h}` : `вже пройшла ${h}`;
  return `Коротка стрілка ${short}, а довга ${long}. Коротка — це години, довга — хвилини.`;
}

/**
 * «Котра година?» (UI_GRID_CHOICE): read a clock face, or find the clock that
 * shows a given time. Path: whole hours → half hours → quarters → five-minute
 * steps; from step 3 some tasks are reversed (time → clock).
 */
export function generateClock(config: TaskConfig): TaskInstance<GridChoicePayload> {
  const { step } = config;
  const minutes = minutesAt(step);
  // Lean towards what this step has just introduced.
  const fresh = minutes.filter((m) => !minutesAt(step - 2).includes(m));
  const time: ClockTime = { h: randInt(1, 12), m: pick(fresh.length > 0 && Math.random() < 0.7 ? fresh : minutes) };

  // Near misses: the same minutes at another hour, the hands swapped, a neighbour.
  const swapped: ClockTime = { h: time.m === 0 ? 12 : time.m / 5, m: (time.h % 12) * 5 };
  const candidates: ClockTime[] = [
    { h: nextHour(time.h), m: time.m },
    { h: ((time.h + 10) % 12) + 1, m: time.m },
    ...(minutes.includes(swapped.m) ? [swapped] : []),
    ...shuffle(minutes).map((m) => ({ h: time.h, m })),
    ...Array.from({ length: 12 }, () => ({ h: randInt(1, 12), m: pick(minutes) })),
    // Whole hours alone give few near misses: any other hour will do then.
    ...shuffle(Array.from({ length: 12 }, (_, i) => ({ h: i + 1, m: time.m }))),
  ];
  const others: ClockTime[] = [];
  for (const c of shuffle(candidates.slice(0, 3)).concat(candidates.slice(3))) {
    if (others.length < OPTIONS - 1 && !same(c, time) && !others.some((o) => same(o, c))) others.push(c);
  }
  const options = shuffle([time, ...others]);
  const base = { id: uid('clk'), reward: rewardForStep(step), outro: `Так, це ${sayTime(time)}!` };

  if (step >= 3 && Math.random() < 0.4) {
    return {
      ...base,
      key: `clock:find:${digital(time)}`,
      prompt: `Знайди годинник, який показує: ${sayTime(time)}.`,
      payload: {
        template: Mechanics.GridChoice,
        cols: 2,
        stimulus: { glyphs: [digital(time)] },
        // No speaker on these cards: hearing each clock's time would give it away.
        options: options.map((t) => ({ id: digital(t), clock: t })),
        correctId: digital(time),
        hint: hintFor(time),
      },
    };
  }

  return {
    ...base,
    key: `clock:read:${digital(time)}`,
    prompt: 'Котра година на годиннику?',
    payload: {
      template: Mechanics.GridChoice,
      cols: 2,
      stimulus: { clock: time },
      options: options.map((t) => ({ id: digital(t), label: digital(t), speak: sayTime(t) })),
      correctId: digital(time),
      hint: hintFor(time),
    },
  };
}
