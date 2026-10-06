/**
 * A deliberately simple, stylised world map for UI_MAP_PUZZLE: chunky shapes a
 * small finger can hit, not cartography. Coordinates live on a 200×100 canvas.
 */
export interface MapRegion {
  id: string;
  name: string;
  /** SVG polygon points (continents) … */
  points?: string;
  /** … or one or more rounded rects (oceans). */
  rects?: { x: number; y: number; w: number; h: number }[];
  /** Where to draw the label / landed marker. */
  cx: number;
  cy: number;
}

export const CONTINENTS: MapRegion[] = [
  { id: 'north_america', name: 'Північна Америка', points: '12,14 30,8 52,10 60,18 50,26 46,34 40,42 34,46 30,42 26,34 16,28', cx: 36, cy: 22 },
  { id: 'south_america', name: 'Південна Америка', points: '44,50 54,49 62,58 58,70 52,84 48,86 46,74 42,60', cx: 52, cy: 64 },
  { id: 'europe', name: 'Європа', points: '92,14 104,10 116,14 114,24 106,28 98,30 90,26', cx: 103, cy: 20 },
  { id: 'africa', name: 'Африка', points: '90,34 104,32 116,38 120,50 112,64 106,78 100,78 96,62 88,48', cx: 104, cy: 52 },
  { id: 'asia', name: 'Азія', points: '120,10 150,6 178,12 184,24 172,34 160,44 146,48 136,40 124,36 118,26', cx: 150, cy: 24 },
  { id: 'australia', name: 'Австралія', points: '160,62 176,58 184,66 180,76 166,78 158,70', cx: 171, cy: 68 },
  { id: 'antarctica', name: 'Антарктида', points: '30,93 70,91 110,93 150,91 180,93 180,99 30,99', cx: 105, cy: 96 },
];

export const OCEANS: MapRegion[] = [
  { id: 'pacific', name: 'Тихий океан', rects: [{ x: 1, y: 48, w: 38, h: 34 }, { x: 187, y: 26, w: 12, h: 56 }], cx: 18, cy: 66 },
  { id: 'atlantic', name: 'Атлантичний океан', rects: [{ x: 64, y: 22, w: 22, h: 60 }], cx: 75, cy: 50 },
  { id: 'indian', name: 'Індійський океан', rects: [{ x: 122, y: 52, w: 34, h: 30 }], cx: 139, cy: 68 },
  { id: 'arctic', name: 'Північний Льодовитий океан', rects: [{ x: 44, y: 0, w: 126, h: 6 }], cx: 107, cy: 3 },
  { id: 'southern', name: 'Південний океан', rects: [{ x: 20, y: 84, w: 166, h: 6 }], cx: 103, cy: 87 },
];

export function regionsOf(layer: 'continents' | 'oceans'): MapRegion[] {
  return layer === 'continents' ? CONTINENTS : OCEANS;
}

export function regionName(id: string): string {
  return [...CONTINENTS, ...OCEANS].find((r) => r.id === id)?.name ?? id;
}
