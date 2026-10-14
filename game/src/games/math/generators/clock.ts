import { Mechanics } from '@/core/game/kernel/mechanics';
import type { TaskConfig, TaskInstance } from '@/core/game/kernel/types';
import type { ClockTime, GridChoicePayload } from '@/core/game/templates/types';
import { pick, randInt, shuffle, uid } from '@/core/utils/random';
import { say, spoken, written } from '@/core/language/marks';
import type { LangCode } from '@/core/language';
import { rewardForStep } from '../difficulty';
import { mathTexts } from '../grammar';
import { digitalTime, partOfDay } from '../grammar/clockExplain';
import type { HintScript } from '@/core/game/hints/types';

/** Answers on the board: the right time and five near misses. */
const OPTIONS = 6;

/** The path: 12 steps of the ordinary clock, then 4 of the 24-hour format. */
export const CLOCK_STEPS = 16;
/** The first step that writes times in the 24-hour format («15:00»). */
export const CLOCK_24H_STEP = 13;

/** A time of the day: what the face shows (`h` 1–12) and, on a 24-hour step, the hour 0–23. */
interface DayTime extends ClockTime {
  hour24?: number;
}

const nextHour = (h: number) => (h % 12) + 1;
const same = (a: ClockTime, b: ClockTime) => a.h === b.h && a.m === b.m;
const sameDay = (a: DayTime, b: DayTime) => same(a, b) && a.hour24 === b.hour24;
const faceOf = (hour24: number) => hour24 % 12 || 12;

/** Which minutes a path step asks about — the 24-hour steps walk the same ladder again. */
function minutesAt(step: number): number[] {
  const at = step >= CLOCK_24H_STEP ? step - CLOCK_24H_STEP + 1 : step;
  if (step >= CLOCK_24H_STEP) {
    if (at <= 1) return [0];
    if (at <= 2) return [0, 30];
    if (at <= 3) return [0, 15, 30, 45];
  } else {
    if (at <= 3) return [0];
    if (at <= 5) return [0, 30];
    if (at <= 7) return [0, 15, 30, 45];
  }
  return [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
}

export function clockIntro(step: number, lang?: LangCode): string | undefined {
  const { intro } = mathTexts(lang).clock;
  if (step >= CLOCK_24H_STEP + 1) return intro.h24minutes;
  if (step >= CLOCK_24H_STEP) return intro.h24;
  if (step <= 3) return intro.hours;
  if (step <= 5) return intro.half;
  if (step <= 7) return intro.quarter;
  return intro.minutes;
}

/**
 * «Котра година?» (UI_GRID_CHOICE): read a clock face, or find the clock that
 * shows a given time. Path: whole hours → half hours → quarters → five-minute
 * steps; from step 3 some tasks are reversed (time → clock). From step 13 the
 * times are written in the 24-hour format («15:30»): the clock is read with the
 * part of the day told, and «15:00» is found on a face that says 3.
 *
 * Six answers in a 3 × 2 board, so the whole task fits a phone's screen. Every
 * task brings a worked explanation (`explain`: which hand is the hours, how
 * to count the minutes, the answer), shown after mistakes or a long silence.
 */
export function generateClock(config: TaskConfig): TaskInstance<GridChoicePayload> {
  const { step } = config;
  const T = mathTexts(config.lang).clock;
  const h24 = step >= CLOCK_24H_STEP;
  const minutes = minutesAt(step);
  // Lean towards what this step has just introduced.
  const fresh = h24 && step === CLOCK_24H_STEP ? minutes : minutes.filter((m) => !minutesAt(step - 2).includes(m));
  const m = pick(fresh.length > 0 && Math.random() < 0.7 ? fresh : minutes);
  // A 24-hour step asks mostly about the afternoon and evening, where the hour changes.
  const hour24 = h24 ? (Math.random() < 0.75 ? randInt(13, 23) : randInt(1, 11)) : undefined;
  const time: DayTime = hour24 === undefined ? { h: randInt(1, 12), m } : { h: faceOf(hour24), m, hour24 };

  const digital = (t: DayTime) => digitalTime(t, t.hour24);
  const told = (t: DayTime) => (t.hour24 === undefined ? T.say(t) : T.say24(t.hour24, t.m));
  // On the board a time is written in digits and read in words.
  const marked = (t: DayTime) => say(digital(t), told(t));

  const beats = T.explain(time, told(time), time.hour24);
  // How to read it, beat by beat — the hand each beat is about blinks. On a task that shows
  // a clock (clock → time) it is the board's clock that blinks; on one that shows none
  // (time → clock) the help draws its own. Also offered when the child stays silent a long while.
  const helpWith = (clock: boolean): HintScript => ({
    ...(clock ? { scene: { kind: 'clock', time: { h: time.h, m: time.m } } } : {}),
    beats,
    after: { idle: true },
  });
  const hint = beats.map((b) => b.text).join(' ');
  const base = { id: uid('clk'), reward: rewardForStep(step), outro: T.yes(told(time)) };

  const find = step >= 3 && Math.random() < (h24 ? 0.5 : 0.4);
  if (find) {
    // Near misses on the faces: another hour with the same minutes, the hands
    // swapped — and on a 24-hour step the faces a child would pick by reading
    // «15» as 5 or as 1.
    const swapped: ClockTime = { h: time.m === 0 ? 12 : time.m / 5, m: (time.h % 12) * 5 };
    const misread: ClockTime[] = hour24 === undefined ? [] : [hour24 % 10, Math.floor(hour24 / 10)].filter((h) => h >= 1 && h !== time.h).map((h) => ({ h, m: time.m }));
    const candidates: ClockTime[] = [
      ...misread,
      { h: nextHour(time.h), m: time.m },
      { h: ((time.h + 10) % 12) + 1, m: time.m },
      ...(minutes.includes(swapped.m) ? [swapped] : []),
      ...shuffle(minutes).map((mm) => ({ h: time.h, m: mm })),
      ...Array.from({ length: 12 }, () => ({ h: randInt(1, 12), m: pick(minutes) })),
      // Whole hours alone give few near misses: any other hour will do then.
      ...shuffle(Array.from({ length: 12 }, (_, i) => ({ h: i + 1, m: time.m }))),
    ];
    const lead = misread.length + 3;
    const others: ClockTime[] = [];
    for (const c of shuffle(candidates.slice(0, lead)).concat(candidates.slice(lead))) {
      if (others.length < OPTIONS - 1 && !same(c, time) && !others.some((o) => same(o, c))) others.push(c);
    }
    const id = (t: ClockTime) => `${t.h}:${String(t.m).padStart(2, '0')}`;
    const options = shuffle<ClockTime>([{ h: time.h, m: time.m }, ...others]);
    // The prompt writes the time in digits and says it in words.
    const asked = hour24 === undefined ? told(time) : marked(time);
    return {
      ...base,
      key: `clock:find:${digital(time)}`,
      prompt: written(T.find(asked)),
      speak: spoken(T.find(asked)),
      payload: {
        template: Mechanics.GridChoice,
        cols: 3,
        stimulus: { glyphs: [digital(time)] },
        // No speaker on these cards: hearing each clock's time would give it away.
        options: options.map((t) => ({ id: id(t), clock: t })),
        correctId: id(time),
        hint,
        help: helpWith(true),
      },
    };
  }

  // Reading a face: near misses at another hour, other minutes — and on a
  // 24-hour step the same face at the other half of the day.
  const swapped: DayTime | null = (() => {
    const s = { h: time.m === 0 ? 12 : time.m / 5, m: (time.h % 12) * 5 };
    if (!minutes.includes(s.m)) return null;
    return hour24 === undefined ? s : { ...s, hour24: hour24 >= 12 ? (s.h % 12) + 12 : s.h % 12 || 12 };
  })();
  const at = (hourOf24: number, mm: number): DayTime => (hour24 === undefined ? { h: faceOf(hourOf24), m: mm } : { h: faceOf(hourOf24), m: mm, hour24: hourOf24 % 24 });
  const H = hour24 ?? time.h;
  const candidates: DayTime[] = [
    ...(hour24 === undefined ? [] : [at(hour24 >= 12 ? hour24 - 12 : hour24 + 12, time.m)].filter((t) => t.hour24 !== 0)),
    at(H + 1, time.m),
    at(H + (hour24 === undefined ? 11 : 23), time.m),
    ...(swapped ? [swapped] : []),
    ...shuffle(minutes).map((mm) => at(H, mm)),
    ...Array.from({ length: 12 }, () => at(hour24 === undefined ? randInt(1, 12) : randInt(1, 23), pick(minutes))),
    ...shuffle(Array.from({ length: 12 }, (_, i) => at(hour24 === undefined ? i + 1 : i + 12, time.m))),
  ].filter((t) => t.hour24 === undefined || (t.hour24 >= 1 && t.hour24 <= 23));
  const lead = hour24 === undefined ? 3 : 4;
  const others: DayTime[] = [];
  for (const c of shuffle(candidates.slice(0, lead)).concat(candidates.slice(lead))) {
    if (others.length < OPTIONS - 1 && !sameDay(c, time) && !others.some((o) => digital(o) === digital(c))) others.push(c);
  }
  const options = shuffle([time, ...others]);
  const prompt = hour24 === undefined ? T.read : T.read24(hour24);
  return {
    ...base,
    key: `clock:read:${digital(time)}`,
    prompt,
    payload: {
      template: Mechanics.GridChoice,
      cols: 3,
      stimulus: { clock: { h: time.h, m: time.m }, ...(hour24 === undefined ? {} : { caption: DAY_EMOJI[partOfDay(hour24)] }) },
      options: options.map((t) => ({ id: digital(t), label: digital(t), speak: told(t) })),
      correctId: digital(time),
      hint,
      help: helpWith(false),
    },
  };
}

/** The part of the day drawn under a clock read in the 24-hour format. */
const DAY_EMOJI = { morning: '🌅', day: '☀️', evening: '🌙' } as const;
