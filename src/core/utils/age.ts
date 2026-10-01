/**
 * Computes a child's age in whole years from their birth month/year.
 * Month is 1–12. Uses the real current date.
 */
export function computeAge(birthYear: number, birthMonth: number, now: Date = new Date()): number {
  let age = now.getFullYear() - birthYear;
  const currentMonth = now.getMonth() + 1; // 1–12
  if (currentMonth < birthMonth) age -= 1;
  return Math.max(0, age);
}
