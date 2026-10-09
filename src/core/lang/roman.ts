/** Roman numerals, as kings and centuries are numbered: «III» → 3. Anything that is not one gives 0. */
const ROMAN = /^(?=[IVXLC])(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;
const VALUE: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100 };

export function roman(text: string): number {
  if (!ROMAN.test(text)) return 0;
  let total = 0;
  for (let i = 0; i < text.length; i += 1) {
    const here = VALUE[text[i]];
    total += here < (VALUE[text[i + 1]] ?? 0) ? -here : here;
  }
  return total;
}
