import { useT } from '@/core/translator';
import type { ClockTime } from '@/core/game/templates/types';

/**
 * An analogue clock: twelve numbers, a short hour hand and a long minute hand.
 * The hour hand creeps between numbers as the minutes pass, like a real one.
 */
export function ClockFace({ time, className }: { time: ClockTime; className?: string }) {
  const t = useT();
  const minuteAngle = time.m * 6;
  const hourAngle = (time.h % 12) * 30 + time.m * 0.5;
  const hand = (angle: number, length: number) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x2: 50 + Math.cos(rad) * length, y2: 50 + Math.sin(rad) * length };
  };

  return (
    <svg className={className} viewBox="0 0 100 100" role="img" aria-label={t('tpl.clock')}>
      <circle cx="50" cy="50" r="47" fill="#fff" stroke="#334155" strokeWidth="4" />
      {Array.from({ length: 60 }, (_, i) => {
        const big = i % 5 === 0;
        const rad = ((i * 6 - 90) * Math.PI) / 180;
        const from = big ? 39.5 : 42;
        return (
          <line
            key={i}
            x1={50 + Math.cos(rad) * from}
            y1={50 + Math.sin(rad) * from}
            x2={50 + Math.cos(rad) * 44}
            y2={50 + Math.sin(rad) * 44}
            stroke="#64748b"
            strokeWidth={big ? 1.6 : 0.6}
          />
        );
      })}
      {Array.from({ length: 12 }, (_, i) => {
        const n = i + 1;
        const rad = ((n * 30 - 90) * Math.PI) / 180;
        return (
          <text
            key={n}
            x={50 + Math.cos(rad) * 33.5}
            y={50 + Math.sin(rad) * 33.5}
            fontSize="10"
            fontWeight="800"
            fill="#0f172a"
            textAnchor="middle"
            dominantBaseline="central"
          >
            {n}
          </text>
        );
      })}
      <line x1="50" y1="50" {...hand(hourAngle, 18)} stroke="#0f172a" strokeWidth="4.5" strokeLinecap="round" />
      <line x1="50" y1="50" {...hand(minuteAngle, 26.5)} stroke="#ef4444" strokeWidth="2.8" strokeLinecap="round" />
      <circle cx="50" cy="50" r="3.2" fill="#0f172a" />
    </svg>
  );
}
