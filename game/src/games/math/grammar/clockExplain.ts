import type { ClockTime, ExplainLine } from '@/core/game/templates/types';
import { fill } from '@/core/language/fill';
import { say } from '@/core/language/marks';

/** The sentences of the clock's explanation, as every language's `math.json` has them under `clock`. */
export interface ClockExplainWords {
  explain: {
    hourOn: string;
    hourPast: string;
    minuteTop: string;
    minuteCount: string;
    minuteTimes: string;
    afternoon: string;
    morning: string;
    so: string;
  };
  parts: { morning: string; day: string; evening: string };
}

/** The part of the day a 24-hour time falls in. */
export function partOfDay(hour24: number): 'morning' | 'day' | 'evening' {
  if (hour24 < 12) return 'morning';
  return hour24 < 18 ? 'day' : 'evening';
}

/** «12:00», «3:05», and in the 24-hour format «15:30», «09:15». */
export function digitalTime({ h, m }: ClockTime, hour24?: number): string {
  const hour = hour24 === undefined ? String(h) : String(hour24).padStart(2, '0');
  return `${hour}:${String(m).padStart(2, '0')}`;
}

/**
 * How to read a clock, line by line: which hand is the hours and where it
 * points, which is the minutes and how to count them, (on a 24-hour step)
 * how the time of day turns the hour into the digital one, and the answer.
 * Lines carry `say` marks: show them through `written`, speak them through
 * `spoken`. Every language builds the same lines out of its own words.
 */
export function clockExplain(
  J: ClockExplainWords,
  time: ClockTime,
  told: string,
  hour24?: number,
): ExplainLine[] {
  const { h, m } = time;
  const next = (h % 12) + 1;
  const n = m / 5;
  const lines: ExplainLine[] = [
    { tone: 'hour', text: m === 0 ? fill(J.explain.hourOn, { h }) : fill(J.explain.hourPast, { h, next }) },
    {
      tone: 'minute',
      text:
        m === 0
          ? J.explain.minuteTop
          : n <= 6
            ? fill(J.explain.minuteCount, { n, m, count: Array.from({ length: n }, (_, i) => (i + 1) * 5).join(', ') })
            : fill(J.explain.minuteTimes, { n, m }),
    },
  ];
  if (hour24 !== undefined) {
    const part = J.parts[partOfDay(hour24)];
    lines.push({
      tone: 'day',
      text: hour24 > 12 ? fill(J.explain.afternoon, { part, h, H: hour24 }) : fill(J.explain.morning, { part, H: hour24 }),
    });
  }
  // Shown: «12:00 — дванадцята година»; said: the words alone.
  lines.push({ tone: 'sum', text: fill(J.explain.so, { time: say(`${digitalTime(time, hour24)} — ${told}`, told) }) });
  return lines;
}
