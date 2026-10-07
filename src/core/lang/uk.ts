/**
 * The Ukrainian phrase engine: builds a sentence around words that change —
 * by gender, number, case and tense — so a text with a variable in it reads
 * like one a person wrote («Коли достигають кавуни?», «Зібрано 6 цеглинок»).
 *
 * A word is data (`noun`, `verb`, `adj`): regular forms are worked out by
 * rule, anything irregular is given with the word. `phrase` fills a template:
 *
 *   {x}            a noun in the nominative (in its own number), or plain text
 *   {x:gen}        …in a case; `:pl` / `:sg` force the number, `:cap` capitalises
 *   {v@x}          verb `v` agreeing with `x` — `{v@x:past}`, `{v@we:future}`
 *   {a~x:gen}      adjective `a` agreeing with noun `x`
 *   {n#x}          a count with its noun: «1 склад», «3 склади», «5 складів»
 *
 * Deliberately free of React and of `@/` imports so it runs under `node --test`.
 */

export type Gender = 'm' | 'f' | 'n';
export type Num = 'sg' | 'pl';
export type Case = 'nom' | 'gen' | 'dat' | 'acc' | 'ins' | 'loc';
export type Tense = 'past' | 'present' | 'future';

type Forms = Partial<Record<Case, string>>;

export interface Noun {
  kind: 'noun';
  /** Dictionary form: nominative singular. A plural-only word («діти») brings its forms in `pl`. */
  nom: string;
  gender: Gender;
  /** The number the word is normally said in here («кавуни» достигають). Default: singular. */
  number: Num;
  /** Living beings: their accusative is the genitive («бачу кота»). */
  animate: boolean;
  /** Irregular forms, where the rules below would get it wrong. */
  sg: Forms;
  pl: Forms;
}

export interface Verb {
  kind: 'verb';
  inf: string;
  /** Present (or, for a perfective verb, simple future): he/she/it, they, we. */
  pres: [sg3: string, pl3: string, pl1?: string];
  /** Past, when not regular: he, she, it, they. */
  past?: [m: string, f: string, n: string, pl: string];
  /** A perfective verb («прилетіти») has no present: `pres` is its future. */
  perfective: boolean;
}

export interface Adj {
  kind: 'adj';
  /** Masculine nominative: «жовтий», «синій». */
  nom: string;
}

/** Who a verb agrees with: a noun, or «ми». */
export type Subject = Noun | 'we';

export function noun(nom: string, gender: Gender, extra: Partial<Pick<Noun, 'number' | 'animate' | 'sg' | 'pl'>> = {}): Noun {
  return { kind: 'noun', nom, gender, number: extra.number ?? 'sg', animate: extra.animate ?? false, sg: extra.sg ?? {}, pl: extra.pl ?? {} };
}

export function verb(inf: string, pres: Verb['pres'], extra: Partial<Pick<Verb, 'past' | 'perfective'>> = {}): Verb {
  return { kind: 'verb', inf, pres, past: extra.past, perfective: extra.perfective ?? false };
}

export const adj = (nom: string): Adj => ({ kind: 'adj', nom });

const HUSHING = 'жчшщ';
const VOWELS = 'аеиіоуяюєї';
const last = (s: string, n = 1) => s.slice(-n);
const cut = (s: string, n = 1) => s.slice(0, -n);
const hushing = (stem: string) => HUSHING.includes(last(stem));
const afterVowel = (stem: string) => VOWELS.includes(last(stem)) || last(stem) === '’';
/** к → ц, г → з, х → с before the -і of the dative / locative: рука → руці. */
const softened = (stem: string) => {
  const swap: Record<string, string> = { к: 'ц', г: 'з', х: 'с' };
  return swap[last(stem)] ? cut(stem) + swap[last(stem)] : stem;
};

/** Singular forms by rule; `nom` is the nominative singular. */
function singular(n: Noun, c: Case): string {
  const { nom } = n;
  if (c === 'nom') return nom;
  const end = last(nom);
  const stem = cut(nom);
  if (end === 'а') {
    const soft = hushing(stem);
    return { gen: stem + (soft ? 'і' : 'и'), dat: softened(stem) + 'і', acc: stem + 'у', ins: stem + (soft ? 'ею' : 'ою'), loc: softened(stem) + 'і' }[c];
  }
  if (end === 'я' && n.gender !== 'n') {
    const v = afterVowel(stem);
    return { gen: stem + (v ? 'ї' : 'і'), dat: stem + (v ? 'ї' : 'і'), acc: stem + 'ю', ins: stem + (v ? 'єю' : 'ею'), loc: stem + (v ? 'ї' : 'і') }[c];
  }
  if (end === 'я') {
    // завдання, листя
    return { gen: nom, dat: stem + 'ю', acc: nom, ins: nom + 'м', loc: stem + 'і' }[c];
  }
  if (end === 'о') {
    const gen = stem + 'а';
    return { gen, dat: stem + 'у', acc: n.animate ? gen : nom, ins: stem + 'ом', loc: softened(stem) + 'і' }[c];
  }
  if (end === 'е') {
    const hard = hushing(stem);
    return { gen: stem + (hard ? 'а' : 'я'), dat: stem + (hard ? 'у' : 'ю'), acc: nom, ins: nom + 'м', loc: stem + 'і' }[c];
  }
  if (n.gender === 'f') {
    // ніч, сіль, осінь — the irregular ones bring their own forms.
    const base = end === 'ь' ? stem : nom;
    return { gen: base + 'і', dat: base + 'і', acc: nom, ins: nom, loc: base + 'і' }[c];
  }
  if (end === 'ь' || end === 'й') {
    const gen = stem + 'я';
    return { gen, dat: stem + 'ю', acc: n.animate ? gen : nom, ins: stem + (end === 'й' ? 'єм' : 'ем'), loc: stem + (end === 'й' ? 'ї' : 'і') }[c];
  }
  const gen = nom + 'а';
  return { gen, dat: nom + 'у', acc: n.animate ? gen : nom, ins: nom + (hushing(nom) ? 'ем' : 'ом'), loc: softened(nom) + 'і' }[c];
}

function pluralNom(n: Noun): string {
  const { nom } = n;
  const end = last(nom);
  const stem = cut(nom);
  if (end === 'а') return stem + (hushing(stem) ? 'і' : 'и');
  if (end === 'я') return n.gender === 'n' ? nom : stem + (afterVowel(stem) ? 'ї' : 'і');
  if (end === 'о') return stem + 'а';
  if (end === 'е') return stem + (hushing(stem) ? 'а' : 'я');
  if (end === 'ь') return stem + 'і';
  if (end === 'й') return stem + 'ї';
  if (n.gender === 'f') return nom + 'і';
  return nom + (hushing(nom) ? 'і' : 'и');
}

function pluralGen(n: Noun): string {
  const { nom } = n;
  const end = last(nom);
  const stem = cut(nom);
  if (end === 'а') {
    // цеглинка → цеглинок: a vowel slips in before the final -к.
    if (last(stem) === 'к' && !VOWELS.includes(last(stem, 2)[0])) return cut(stem) + 'ок';
    return stem;
  }
  if (end === 'я') {
    if (n.gender === 'n') return last(stem, 2) === 'нн' ? cut(stem) + 'ь' : stem + 'ь';
    return afterVowel(stem) ? stem + 'й' : stem + 'ь';
  }
  if (end === 'о') return stem;
  if (end === 'е') return stem + 'ів';
  if (end === 'ь') return stem + 'ів';
  if (end === 'й') return stem + 'їв';
  if (n.gender === 'f') return nom + 'ей';
  return nom + 'ів';
}

/** The form of a noun in a case and number (its own number when none is asked). */
export function inflect(n: Noun, c: Case = 'nom', num: Num = n.number): string {
  if (num === 'sg') {
    if (n.sg[c]) return n.sg[c];
    // «бачу кота»: a living masculine takes its genitive, irregular or not.
    if (c === 'acc' && n.animate && !/[аяое]$/.test(n.nom)) return inflect(n, 'gen', 'sg');
    return singular(n, c);
  }
  if (n.pl[c]) return n.pl[c];
  const nom = n.pl.nom ?? pluralNom(n);
  if (c === 'nom') return nom;
  const gen = n.pl.gen ?? pluralGen(n);
  if (c === 'gen') return gen;
  if (c === 'acc') return n.animate ? gen : nom;
  const stem = cut(nom);
  const soft = 'іїя'.includes(last(nom)) && !hushing(stem);
  return stem + { dat: soft ? 'ям' : 'ам', ins: soft ? 'ями' : 'ами', loc: soft ? 'ях' : 'ах' }[c];
}

const HARD = {
  m: { nom: 'ий', gen: 'ого', dat: 'ому', ins: 'им', loc: 'ому' },
  f: { nom: 'а', gen: 'ої', dat: 'ій', acc: 'у', ins: 'ою', loc: 'ій' },
  n: { nom: 'е', gen: 'ого', dat: 'ому', acc: 'е', ins: 'им', loc: 'ому' },
  pl: { nom: 'і', gen: 'их', dat: 'им', ins: 'ими', loc: 'их' },
} as const;
const SOFT = {
  m: { nom: 'ій', gen: 'ього', dat: 'ьому', ins: 'ім', loc: 'ьому' },
  f: { nom: 'я', gen: 'ьої', dat: 'ій', acc: 'ю', ins: 'ьою', loc: 'ій' },
  n: { nom: 'є', gen: 'ього', dat: 'ьому', acc: 'є', ins: 'ім', loc: 'ьому' },
  pl: { nom: 'і', gen: 'іх', dat: 'ім', ins: 'іми', loc: 'іх' },
} as const;

/** An adjective in the form its noun asks for. */
export function agree(a: Adj, n: Noun, c: Case = 'nom', num: Num = n.number): string {
  const table = last(a.nom, 2) === 'ій' ? SOFT : HARD;
  const stem = cut(a.nom, 2);
  const row: Forms = table[num === 'pl' ? 'pl' : n.gender];
  // Masculine and plural accusative follow the noun: живе → as genitive.
  const ending = row[c] ?? (n.animate ? row.gen : row.nom);
  return stem + ending;
}

/** A verb in a tense, agreeing with its subject. */
export function conjugate(v: Verb, tense: Tense, subject: Subject): string {
  const we = subject === 'we';
  const plural = we || subject.number === 'pl';
  const reflexive = /с[яь]$/.test(v.inf);
  const base = reflexive ? cut(v.inf, 2) : v.inf;

  if (tense === 'past') {
    const stem = cut(base, 2);
    const [m, f, n, pl] = v.past ?? [stem + 'в', stem + 'ла', stem + 'ло', stem + 'ли'].map((form) => (reflexive ? form + 'ся' : form));
    if (plural) return pl;
    return { m, f, n }[subject.gender];
  }
  if (tense === 'future' && !v.perfective) {
    if (we) return base + 'мемо' + (reflexive ? 'ся' : '');
    return plural ? base + 'муть' + (reflexive ? 'ся' : '') : base + 'ме' + (reflexive ? 'ться' : '');
  }
  const [sg3, pl3, pl1] = v.pres;
  if (!we) return plural ? pl3 : sg3;
  if (pl1) return pl1;
  // ліпить → ліпимо, купається → купаємося, росте → ростемо
  const body = reflexive ? sg3.replace(/ться$/, '') : sg3;
  const us = /[иї]ть$/.test(body) ? cut(body, 2) + 'мо' : body + 'мо';
  return reflexive ? us + 'ся' : us;
}

/** Which of the three count forms a number takes: 1 склад, 3 склади, 5 складів. */
export function countForm(n: number): 0 | 1 | 2 {
  const abs = Math.abs(Math.trunc(n));
  const tens = abs % 100;
  const ones = abs % 10;
  if (tens >= 11 && tens <= 14) return 2;
  if (ones === 1) return 0;
  return ones >= 2 && ones <= 4 ? 1 : 2;
}

/** A noun, or its three count forms given outright: [одна, дві–чотири, п’ять і більше]. */
export type Countable = Noun | readonly [one: string, few: string, many: string];

const isNoun = (x: unknown): x is Noun => typeof x === 'object' && x !== null && (x as Noun).kind === 'noun';

/** The word alone, in the form the count asks for: counted-less «цеглинок». */
export function countWord(n: number, what: Countable): string {
  const form = countForm(n);
  if (!isNoun(what)) return what[form];
  return form === 0 ? inflect(what, 'nom', 'sg') : form === 1 ? inflect(what, 'nom', 'pl') : inflect(what, 'gen', 'pl');
}

/** «6 цеглинок», «1 склад», «3 літери». */
export const counted = (n: number, what: Countable): string => `${n} ${countWord(n, what)}`;

/** «полуниці, малина та черешня». */
export function list(items: readonly string[], and = 'та'): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} ${and} ${items[items.length - 1]}`;
}

/**
 * A lifeless thing named by a few words, in the accusative: «зубна щітка» →
 * «зубну щітку», «Ейфелева вежа» → «Ейфелеву вежу». Only feminine words
 * change, and only up to the first preposition («кришечку від пляшки»);
 * masculine, neuter and plural ones stay as they are.
 */
export function accusative(thing: string): string {
  const words = thing.split(' ');
  // «опале листя», «картопляне лушпиння»: a neuter thing stays as it is.
  if (/[еє]$/.test(words[0]) || /(нн|тт|лл|сс)я$/.test(words[0])) return thing;
  const stop = words.findIndex((w, i) => (i > 0 && /^(від|для|з|із|до|на|у|в)$/.test(w)) || /[иії]$/.test(w));
  return words.map((w, i) => (stop !== -1 && i >= stop ? w : w.replace(/а$/, 'у').replace(/я$/, 'ю'))).join(' ');
}

/** The first letter small — for a name that goes inside a sentence. */
export const lowerFirst = (text: string): string => text.charAt(0).toLocaleLowerCase('uk') + text.slice(1);

/** «з грудня», but «із січня»: the preposition before a hissing sound. */
export const from = (word: string): string => `${/^[зсцчшщж]/i.test(word) ? 'із' : 'з'} ${word}`;

export const capitalise = (text: string): string => text.charAt(0).toLocaleUpperCase('uk') + text.slice(1);

export type PhraseValue = Noun | Verb | Adj | 'we' | string | number;

const CASES: readonly string[] = ['nom', 'gen', 'dat', 'acc', 'ins', 'loc'];
const TENSES: readonly string[] = ['past', 'present', 'future'];

/** Fill a template with words in the right forms — the syntax is at the top of this file. */
export function phrase(template: string, vars: Record<string, PhraseValue>, tense: Tense = 'present'): string {
  const get = (name: string): PhraseValue => {
    if (!(name in vars)) throw new Error(`phrase: no value for {${name}} in «${template}»`);
    return vars[name];
  };
  return template.replace(/\{([^}]+)\}/g, (_, token: string) => {
    const [head, ...mods] = token.split(':');
    const c = (mods.find((m) => CASES.includes(m)) ?? 'nom') as Case;
    const num = mods.find((m) => m === 'sg' || m === 'pl') as Num | undefined;
    const when = (mods.find((m) => TENSES.includes(m)) ?? tense) as Tense;
    let out: string;

    if (head.includes('@')) {
      const [v, who] = head.split('@');
      const subject = who === 'we' ? 'we' : (get(who) as Subject);
      out = conjugate(get(v) as Verb, when, subject);
    } else if (head.includes('~')) {
      const [a, n] = head.split('~');
      const of = get(n) as Noun;
      out = agree(get(a) as Adj, of, c, num ?? of.number);
    } else if (head.includes('#')) {
      const [n, what] = head.split('#');
      out = counted(Number(get(n)), get(what) as Noun);
    } else {
      const value = get(head);
      out = isNoun(value) ? inflect(value, c, num ?? value.number) : String(typeof value === 'object' ? ('nom' in value ? value.nom : value.inf) : value);
    }
    return mods.includes('cap') ? capitalise(out) : out;
  });
}

/**
 * A simple clause — who does what: «достигають кавуни», «діти йдуть до школи»,
 * «ми ліпимо сніговика». Kept as data so one clause can be asked about, stated
 * and retold in another tense.
 */
export interface Clause {
  /** The subject; leave out for «ми» (the verb then says it: «ліпимо»). */
  who?: Noun;
  does: Verb;
  /** Subject before the verb («діти йдуть») rather than after («достигають кавуни»). */
  subjectFirst?: boolean;
  /** Words before the verb («часто») and after the pair («до школи»). */
  lead?: string;
  tail?: string;
}

/** The clause as text, lower-case and without a full stop. `we` spells «ми» out. */
export function clause(cl: Clause, tense: Tense = 'present', opts: { we?: boolean } = {}): string {
  const action = conjugate(cl.does, tense, cl.who ?? 'we');
  const who = cl.who ? inflect(cl.who) : opts.we ? 'ми' : '';
  const pair = cl.who && !cl.subjectFirst ? [action, who] : [who, action];
  return [cl.lead, ...pair, cl.tail].filter(Boolean).join(' ');
}
