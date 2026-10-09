import type { ReactNode } from 'react';

/**
 * Small flat illustrations of famous landmarks. Emoji cannot show these (there
 * is no emoji for Saint Sophia or the Brandenburg Gate), and a wrong picture
 * teaches the wrong thing — so each one is drawn to its real silhouette.
 * Canvas: 120 × 100.
 */
const SKY = '#cfe9ff';
const GRASS = '#8fce7a';

const columns = (xs: number[], y: number, h: number, w: number, fill: string) =>
  xs.map((x) => <rect key={x} x={x} y={y} width={w} height={h} fill={fill} />);

const ART: Record<string, ReactNode> = {
  // Eiffel Tower — iron lattice tower tapering to a point, two platforms.
  paris: (
    <>
      <path d="M34 92 Q52 62 57 12 L63 12 Q68 62 86 92 L75 92 Q66 74 60 58 Q54 74 45 92 Z" fill="#7a5c3e" />
      <rect x="43" y="62" width="34" height="5" fill="#5e452d" />
      <rect x="50" y="40" width="20" height="4" fill="#5e452d" />
      <rect x="59" y="5" width="2" height="9" fill="#5e452d" />
    </>
  ),
  // Saint Sophia Cathedral, Kyiv — white walls, green domes, golden centre.
  kyiv: (
    <>
      <rect x="22" y="56" width="76" height="36" fill="#fbfbf7" stroke="#d9d4c4" />
      {[30, 44, 70, 84].map((x) => (
        <rect key={x} x={x} y="68" width="7" height="24" rx="3.5" fill="#c9d6e2" />
      ))}
      <rect x="55" y="72" width="10" height="20" rx="5" fill="#8a6d4b" />
      {[
        [32, 50, 7],
        [88, 50, 7],
        [46, 42, 8],
        [74, 42, 8],
      ].map(([x, y, r]) => (
        <g key={x}>
          <rect x={x - r * 0.7} y={y} width={r * 1.4} height={56 - y} fill="#fbfbf7" stroke="#d9d4c4" />
          <path d={`M${x - r} ${y} Q${x - r} ${y - r * 1.5} ${x} ${y - r * 2} Q${x + r} ${y - r * 1.5} ${x + r} ${y} Z`} fill="#2f9e6a" />
          <path d={`M${x} ${y - r * 2 - 6} v6 M${x - 2} ${y - r * 2 - 4} h4`} stroke="#d4a017" strokeWidth="1.3" />
        </g>
      ))}
      <rect x="52" y="30" width="16" height="26" fill="#fbfbf7" stroke="#d9d4c4" />
      <path d="M48 30 Q48 14 60 8 Q72 14 72 30 Z" fill="#e2b322" />
      <path d="M60 0 v8 M57 3 h6" stroke="#d4a017" strokeWidth="1.6" />
    </>
  ),
  // Big Ben (Elizabeth Tower), London — clock tower with a pointed roof.
  london: (
    <>
      <rect x="48" y="26" width="24" height="66" fill="#c8a56a" stroke="#a5834d" />
      <rect x="45" y="22" width="30" height="24" fill="#d6b77e" stroke="#a5834d" />
      <circle cx="60" cy="34" r="9" fill="#fff" stroke="#3b3b3b" strokeWidth="1.5" />
      <path d="M60 34 V28 M60 34 H65" stroke="#3b3b3b" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M45 22 L60 2 L75 22 Z" fill="#59636b" />
      {[52, 60, 68].map((x) => (
        <rect key={x} x={x - 1.5} y="52" width="3" height="36" fill="#a5834d" />
      ))}
    </>
  ),
  // Colosseum, Rome — an oval amphitheatre with rows of arches, one side broken.
  rome: (
    <>
      <path d="M12 92 V58 Q30 40 60 38 L60 30 Q88 32 108 50 V92 Z" fill="#dcc09a" stroke="#b7996f" />
      {[0, 1, 2].map((row) =>
        [18, 30, 42, 54, 66, 78, 90].map((x) =>
          row === 0 && x < 60 ? null : (
            <rect key={`${row}-${x}`} x={x} y={44 + row * 16} width="8" height="11" rx="4" fill="#6b5237" />
          ),
        ),
      )}
    </>
  ),
  // The pyramids of Giza near Cairo.
  cairo: (
    <>
      <circle cx="98" cy="18" r="9" fill="#ffd54a" />
      <rect x="0" y="80" width="120" height="20" fill="#e7c98b" />
      <path d="M8 84 L38 34 L68 84 Z" fill="#d9b36a" />
      <path d="M38 34 L68 84 L50 84 Z" fill="#c29a52" />
      <path d="M52 84 L84 22 L116 84 Z" fill="#e2bd75" />
      <path d="M84 22 L116 84 L96 84 Z" fill="#c9a25a" />
    </>
  ),
  // The White House, Washington — white, columned porch, flag on the roof.
  washington: (
    <>
      <rect x="0" y="84" width="120" height="16" fill={GRASS} />
      <rect x="12" y="50" width="96" height="36" fill="#fff" stroke="#cfcfcf" />
      {[18, 30, 86, 98].map((x) => (
        <rect key={x} x={x} y="58" width="7" height="9" fill="#9fb7cc" />
      ))}
      <path d="M40 50 L60 36 L80 50 Z" fill="#f2f2f2" stroke="#cfcfcf" />
      {columns([44, 52, 60, 68, 74], 50, 36, 3, '#dcdcdc')}
      <path d="M60 36 V20" stroke="#777" strokeWidth="1.4" />
      <path d="M60 20 h12 v7 h-12 Z" fill="#c62828" />
    </>
  ),
  // The Parthenon on the Acropolis, Athens — marble columns under a pediment.
  athens: (
    <>
      <path d="M0 100 Q60 70 120 100 Z" fill="#c9b48c" />
      <rect x="18" y="80" width="84" height="6" fill="#e9e3d3" stroke="#c9c1ab" />
      {columns([22, 33, 44, 55, 66, 77, 88], 46, 34, 6, '#f3efe3')}
      <rect x="18" y="40" width="84" height="6" fill="#e9e3d3" stroke="#c9c1ab" />
      <path d="M18 40 L60 22 L102 40 Z" fill="#f3efe3" stroke="#c9c1ab" />
    </>
  ),
  // Tokyo Tower — shaped like the Eiffel Tower, painted orange and white.
  tokyo: (
    <>
      <path d="M36 92 Q53 62 57 12 L63 12 Q67 62 84 92 L74 92 Q65 74 60 58 Q55 74 46 92 Z" fill="#f4511e" />
      <path d="M52 44 h16 l1 8 h-18 Z M48 66 h24 l2 8 h-28 Z" fill="#fff" />
      <rect x="54" y="38" width="12" height="5" fill="#fff" stroke="#f4511e" />
      <rect x="59" y="4" width="2" height="10" fill="#f4511e" />
    </>
  ),
  // Brandenburg Gate, Berlin — six columns and a chariot (quadriga) on top.
  berlin: (
    <>
      <rect x="0" y="88" width="120" height="12" fill="#c8c8c8" />
      {columns([20, 34, 48, 66, 80, 94], 42, 46, 6, '#e3d6b8')}
      <rect x="14" y="30" width="92" height="12" fill="#d8c9a6" stroke="#b9a981" />
      <rect x="40" y="24" width="40" height="6" fill="#d8c9a6" stroke="#b9a981" />
      <path d="M50 24 q4 -12 10 -8 q6 -4 10 8 Z" fill="#4f8a6b" />
      <path d="M60 16 v-8" stroke="#4f8a6b" strokeWidth="2" />
    </>
  ),
  // The Forbidden City, Beijing — red walls and golden upturned roofs.
  beijing: (
    <>
      <rect x="10" y="68" width="100" height="24" fill="#b3261e" />
      <rect x="52" y="76" width="16" height="16" rx="8" fill="#5a1410" />
      <path d="M4 68 Q16 62 22 54 H98 Q104 62 116 68 Z" fill="#e2a81c" />
      <rect x="28" y="42" width="64" height="12" fill="#b3261e" />
      <path d="M20 42 Q30 37 36 30 H84 Q90 37 100 42 Z" fill="#e2a81c" />
    </>
  ),
  // The Little Mermaid, Copenhagen — a small statue sitting on a rock by the sea.
  copenhagen: (
    <>
      <rect x="0" y="78" width="120" height="22" fill="#6fb7e6" />
      <ellipse cx="60" cy="80" rx="34" ry="13" fill="#8d8d8d" />
      <ellipse cx="50" cy="72" rx="16" ry="8" fill="#a3a3a3" />
      <circle cx="58" cy="30" r="6" fill="#5c8a72" />
      <path d="M56 36 Q50 50 54 60 L72 64 Q84 62 90 70 Q78 72 70 70 L52 68 Q44 58 52 38 Z" fill="#5c8a72" />
      <path d="M62 40 Q70 50 66 60" stroke="#5c8a72" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M88 66 l10 -6 l-3 10 l5 6 Z" fill="#5c8a72" />
    </>
  ),
  // The Royal Castle, Warsaw — a long brick-red palace with a clock tower.
  warsaw: (
    <>
      <rect x="0" y="88" width="120" height="12" fill="#cfcfcf" />
      <rect x="8" y="56" width="104" height="34" fill="#d9774a" stroke="#b55b33" />
      {[14, 26, 38, 76, 88, 100].map((x) => (
        <rect key={x} x={x} y="64" width="6" height="10" fill="#fbe9c8" />
      ))}
      <path d="M8 56 L60 46 L112 56 Z" fill="#9c4f2c" />
      <rect x="51" y="30" width="18" height="60" fill="#e08a5c" stroke="#b55b33" />
      <circle cx="60" cy="44" r="5" fill="#fff" stroke="#3b3b3b" />
      <path d="M51 30 Q52 16 60 8 Q68 16 69 30 Z" fill="#3e8f6b" />
      <path d="M60 8 V1" stroke="#3e8f6b" strokeWidth="1.6" />
    </>
  ),
};

export function hasLandmarkArt(id: string): boolean {
  return id in ART;
}

/** A landmark illustration by id (see the keys above). */
export function LandmarkArt({ id, label }: { id: string; label?: string }) {
  const art = ART[id];
  if (!art) return null;
  return (
    <svg viewBox="0 0 120 100" role="img" aria-label={label} style={{ width: 'min(100%, 240px)', height: 'auto', borderRadius: 16 }}>
      <rect width="120" height="100" fill={SKY} />
      {art}
    </svg>
  );
}
