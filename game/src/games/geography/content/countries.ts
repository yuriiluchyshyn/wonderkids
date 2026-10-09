import TEXTS from '@/locales/app/uk/games/geography.json';

const J = TEXTS.content.countries;

/**
 * Every country shown in the flag games, ordered by how familiar its flag is
 * to a Ukrainian child — the most recognisable first. The ORDER is the
 * "familiarity weight": early path steps draw from the top of the list, later
 * steps reach further down, and every level also revisits flags met before.
 *
 * `continent`: E Europe · A Asia · F Africa · N North America · S South
 * America · O Australia & Oceania.
 */
type ContinentCode = 'E' | 'A' | 'F' | 'N' | 'S' | 'O';

// prettier-ignore
const RANKED: [code: string, name: string, continent: ContinentCode][] = [
  ['UA', J.RANKED[0][1], 'E'], ['US', J.RANKED[1][1], 'N'], ['GB', J.RANKED[2][1], 'E'], ['FR', J.RANKED[3][1], 'E'], ['DE', J.RANKED[4][1], 'E'], ['IT', J.RANKED[5][1], 'E'],
  ['PL', J.RANKED[6][1], 'E'], ['JP', J.RANKED[7][1], 'A'], ['CA', J.RANKED[8][1], 'N'], ['ES', J.RANKED[9][1], 'E'], ['CN', J.RANKED[10][1], 'A'], ['BR', J.RANKED[11][1], 'S'],
  ['TR', J.RANKED[12][1], 'A'], ['GR', J.RANKED[13][1], 'E'], ['EG', J.RANKED[14][1], 'F'], ['IN', J.RANKED[15][1], 'A'], ['AU', J.RANKED[16][1], 'O'], ['MX', J.RANKED[17][1], 'N'],
  ['AR', J.RANKED[18][1], 'S'], ['CH', J.RANKED[19][1], 'E'], ['SE', J.RANKED[20][1], 'E'], ['NO', J.RANKED[21][1], 'E'], ['NL', J.RANKED[22][1], 'E'], ['PT', J.RANKED[23][1], 'E'],
  ['KR', J.RANKED[24][1], 'A'], ['IL', J.RANKED[25][1], 'A'], ['AT', J.RANKED[26][1], 'E'], ['CZ', J.RANKED[27][1], 'E'], ['BE', J.RANKED[28][1], 'E'], ['DK', J.RANKED[29][1], 'E'],
  ['FI', J.RANKED[30][1], 'E'], ['IE', J.RANKED[31][1], 'E'], ['HU', J.RANKED[32][1], 'E'], ['RO', J.RANKED[33][1], 'E'], ['BG', J.RANKED[34][1], 'E'], ['HR', J.RANKED[35][1], 'E'],
  ['SK', J.RANKED[36][1], 'E'], ['LT', J.RANKED[37][1], 'E'], ['LV', J.RANKED[38][1], 'E'], ['EE', J.RANKED[39][1], 'E'], ['MD', J.RANKED[40][1], 'E'], ['GE', J.RANKED[41][1], 'A'],
  ['SA', J.RANKED[42][1], 'A'], ['AE', J.RANKED[43][1], 'A'], ['TH', J.RANKED[44][1], 'A'], ['VN', J.RANKED[45][1], 'A'], ['ZA', J.RANKED[46][1], 'F'], ['NZ', J.RANKED[47][1], 'O'],
  ['CU', J.RANKED[48][1], 'N'], ['JM', J.RANKED[49][1], 'N'], ['CL', J.RANKED[50][1], 'S'], ['CO', J.RANKED[51][1], 'S'], ['PE', J.RANKED[52][1], 'S'], ['IS', J.RANKED[53][1], 'E'],
  ['RS', J.RANKED[54][1], 'E'], ['SI', J.RANKED[55][1], 'E'], ['CY', J.RANKED[56][1], 'A'], ['MT', J.RANKED[57][1], 'E'], ['LU', J.RANKED[58][1], 'E'], ['MC', J.RANKED[59][1], 'E'],
  ['KZ', J.RANKED[60][1], 'A'], ['AM', J.RANKED[61][1], 'A'], ['AZ', J.RANKED[62][1], 'A'], ['UZ', J.RANKED[63][1], 'A'], ['MN', J.RANKED[64][1], 'A'], ['PK', J.RANKED[65][1], 'A'],
  ['ID', J.RANKED[66][1], 'A'], ['PH', J.RANKED[67][1], 'A'], ['MY', J.RANKED[68][1], 'A'], ['SG', J.RANKED[69][1], 'A'], ['NP', J.RANKED[70][1], 'A'], ['IR', J.RANKED[71][1], 'A'],
  ['IQ', J.RANKED[72][1], 'A'], ['QA', J.RANKED[73][1], 'A'], ['JO', J.RANKED[74][1], 'A'], ['LB', J.RANKED[75][1], 'A'], ['MA', J.RANKED[76][1], 'F'], ['TN', J.RANKED[77][1], 'F'],
  ['DZ', J.RANKED[78][1], 'F'], ['KE', J.RANKED[79][1], 'F'], ['NG', J.RANKED[80][1], 'F'], ['ET', J.RANKED[81][1], 'F'], ['GH', J.RANKED[82][1], 'F'], ['TZ', J.RANKED[83][1], 'F'],
  ['VE', J.RANKED[84][1], 'S'], ['UY', J.RANKED[85][1], 'S'], ['PY', J.RANKED[86][1], 'S'], ['BO', J.RANKED[87][1], 'S'], ['EC', J.RANKED[88][1], 'S'], ['CR', J.RANKED[89][1], 'N'],
  ['PA', J.RANKED[90][1], 'N'], ['DO', J.RANKED[91][1], 'N'], ['HT', J.RANKED[92][1], 'N'], ['BS', J.RANKED[93][1], 'N'], ['GT', J.RANKED[94][1], 'N'], ['HN', J.RANKED[95][1], 'N'],
  ['ME', J.RANKED[96][1], 'E'], ['MK', J.RANKED[97][1], 'E'], ['AL', J.RANKED[98][1], 'E'], ['BA', J.RANKED[99][1], 'E'], ['AD', J.RANKED[100][1], 'E'], ['LI', J.RANKED[101][1], 'E'],
  ['SM', J.RANKED[102][1], 'E'], ['VA', J.RANKED[103][1], 'E'], ['KP', J.RANKED[104][1], 'A'], ['AF', J.RANKED[105][1], 'A'], ['BD', J.RANKED[106][1], 'A'], ['LK', J.RANKED[107][1], 'A'],
  ['MM', J.RANKED[108][1], 'A'], ['KH', J.RANKED[109][1], 'A'], ['LA', J.RANKED[110][1], 'A'], ['BT', J.RANKED[111][1], 'A'], ['MV', J.RANKED[112][1], 'A'], ['KW', J.RANKED[113][1], 'A'],
  ['BH', J.RANKED[114][1], 'A'], ['OM', J.RANKED[115][1], 'A'], ['YE', J.RANKED[116][1], 'A'], ['SY', J.RANKED[117][1], 'A'], ['TJ', J.RANKED[118][1], 'A'], ['TM', J.RANKED[119][1], 'A'],
  ['KG', J.RANKED[120][1], 'A'], ['BN', J.RANKED[121][1], 'A'], ['TL', J.RANKED[122][1], 'A'], ['LY', J.RANKED[123][1], 'F'], ['SD', J.RANKED[124][1], 'F'], ['SS', J.RANKED[125][1], 'F'],
  ['SN', J.RANKED[126][1], 'F'], ['CI', J.RANKED[127][1], 'F'], ['CM', J.RANKED[128][1], 'F'], ['UG', J.RANKED[129][1], 'F'], ['RW', J.RANKED[130][1], 'F'], ['ZW', J.RANKED[131][1], 'F'],
  ['ZM', J.RANKED[132][1], 'F'], ['AO', J.RANKED[133][1], 'F'], ['MZ', J.RANKED[134][1], 'F'], ['MG', J.RANKED[135][1], 'F'], ['NA', J.RANKED[136][1], 'F'], ['BW', J.RANKED[137][1], 'F'],
  ['ML', J.RANKED[138][1], 'F'], ['NE', J.RANKED[139][1], 'F'], ['TD', J.RANKED[140][1], 'F'], ['BF', J.RANKED[141][1], 'F'], ['GN', J.RANKED[142][1], 'F'], ['SL', J.RANKED[143][1], 'F'],
  ['LR', J.RANKED[144][1], 'F'], ['TG', J.RANKED[145][1], 'F'], ['BJ', J.RANKED[146][1], 'F'], ['GA', J.RANKED[147][1], 'F'], ['CG', J.RANKED[148][1], 'F'], ['CD', J.RANKED[149][1], 'F'],
  ['CF', J.RANKED[150][1], 'F'], ['GQ', J.RANKED[151][1], 'F'], ['ER', J.RANKED[152][1], 'F'], ['DJ', J.RANKED[153][1], 'F'], ['SO', J.RANKED[154][1], 'F'], ['BI', J.RANKED[155][1], 'F'],
  ['MW', J.RANKED[156][1], 'F'], ['LS', J.RANKED[157][1], 'F'], ['SZ', J.RANKED[158][1], 'F'], ['MR', J.RANKED[159][1], 'F'], ['GM', J.RANKED[160][1], 'F'], ['GW', J.RANKED[161][1], 'F'],
  ['CV', J.RANKED[162][1], 'F'], ['ST', J.RANKED[163][1], 'F'], ['KM', J.RANKED[164][1], 'F'], ['SC', J.RANKED[165][1], 'F'], ['MU', J.RANKED[166][1], 'F'], ['NI', J.RANKED[167][1], 'N'],
  ['SV', J.RANKED[168][1], 'N'], ['BZ', J.RANKED[169][1], 'N'], ['GY', J.RANKED[170][1], 'S'], ['SR', J.RANKED[171][1], 'S'], ['TT', J.RANKED[172][1], 'N'], ['BB', J.RANKED[173][1], 'N'],
  ['LC', J.RANKED[174][1], 'N'], ['VC', J.RANKED[175][1], 'N'], ['GD', J.RANKED[176][1], 'N'], ['AG', J.RANKED[177][1], 'N'], ['DM', J.RANKED[178][1], 'N'], ['KN', J.RANKED[179][1], 'N'],
  ['FJ', J.RANKED[180][1], 'O'], ['PG', J.RANKED[181][1], 'O'], ['WS', J.RANKED[182][1], 'O'], ['TO', J.RANKED[183][1], 'O'], ['VU', J.RANKED[184][1], 'O'], ['SB', J.RANKED[185][1], 'O'],
  ['KI', J.RANKED[186][1], 'O'], ['TV', J.RANKED[187][1], 'O'], ['NR', J.RANKED[188][1], 'O'], ['PW', J.RANKED[189][1], 'O'], ['FM', J.RANKED[190][1], 'O'], ['MH', J.RANKED[191][1], 'O'],
];

const CONTINENTS: Record<ContinentCode, { id: string; name: string }> = {
  E: { id: 'europe', name: J.CONTINENTS.E.name },
  A: { id: 'asia', name: J.CONTINENTS.A.name },
  F: { id: 'africa', name: J.CONTINENTS.F.name },
  N: { id: 'north_america', name: J.CONTINENTS.N.name },
  S: { id: 'south_america', name: J.CONTINENTS.S.name },
  O: { id: 'australia', name: J.CONTINENTS.O.name },
};

/** What a few of the best-known flags look like, in a child's words. */
const LOOKS: Record<string, string> = J.LOOKS;

export interface Country {
  id: string;
  name: string;
  /** The name in the genitive: «прапор України», «столиця Японії». */
  of: string;
  flag: string;
  /** Region id on the world map. */
  continent: string;
  /** "в Європі", "в Азії"… for hints. */
  continentName: string;
  /** Spoken description of the flag, where we have one. */
  look?: string;
}

/** A two-letter country code as its flag emoji (regional indicator letters). */
function flagOf(code: string): string {
  return [...code].map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65)).join('');
}

/** Genitives the rules of `genitive` below would get wrong. */
// prettier-ignore
const OF: Record<string, string> = J.OF;

/** One word of a country's name in the genitive: Україна → України, Китай → Китаю, Перу → Перу. */
function wordOf(word: string): string {
  if (word === word.toLocaleUpperCase('uk')) return word;
  if (/ія$/.test(word)) return word.slice(0, -1) + J.wordOf[1];
  if (/[еє]я$/.test(word)) return word.slice(0, -1) + J.wordOf[2];
  if (/[жчшщ]а$/.test(word)) return word.slice(0, -1) + J.wordOf[3];
  if (/а$/.test(word)) return word.slice(0, -1) + J.wordOf[4];
  if (/я$/.test(word)) return word.slice(0, -1) + J.wordOf[5];
  if (/[йь]$/.test(word)) return word.slice(0, -1) + J.wordOf[6];
  // Марокко, Перу, Чилі, Зімбабве do not change.
  if (/[оуіеєюиї]$/.test(word)) return word;
  return word + J.wordOf[7];
}

/** «Велика Британія» → «Великої Британії»; the odd ones are listed in `OF`. */
function genitive(name: string): string {
  if (OF[name]) return OF[name];
  const words = name.split(' ');
  return words
    .map((word, i) => {
      if (i < words.length - 1 && /а$/.test(word)) return word.slice(0, -1) + J.genitive[1];
      if (i < words.length - 1 && /ий$/.test(word)) return word.slice(0, -2) + J.genitive[2];
      return wordOf(word);
    })
    .join(' ');
}

/** All countries, most familiar flag first. */
export const COUNTRIES: Country[] = RANKED.map(([code, name, continent]) => ({
  id: code.toLowerCase(),
  name,
  of: genitive(name),
  flag: flagOf(code),
  continent: CONTINENTS[continent].id,
  continentName: CONTINENTS[continent].name,
  look: LOOKS[code],
}));

/**
 * Countries whose continent a child can place without an argument: those
 * spanning two continents and the small Pacific islands (no "Australia"
 * region fits them) are left out of the map game.
 */
const HARD_TO_PLACE = new Set(['tr', 'kz', 'ge', 'am', 'az', 'cy', 'eg']);
export const MAP_COUNTRIES: Country[] = COUNTRIES.filter(
  (c) => !HARD_TO_PLACE.has(c.id) && (c.continent !== 'australia' || c.id === 'au'),
);
