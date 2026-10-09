/** The signs of arithmetic and a fraction, as Ukrainian says them. */
const SIGNS: Record<string, string> = { '+': 'плюс', '−': 'мінус', '-': 'мінус', '×': 'помножити на', '÷': 'поділити на', '=': 'дорівнює', '?': 'скільки' };

export const sign = (s: string): string => SIGNS[s] ?? s;
/** «3 з 4» — the voice turns the digits into words in the right case (`voice.ts`). */
export const fraction = (n: number, d: number): string => `${n} з ${d}`;
