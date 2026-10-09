/** The names of the Ukrainian letters, as they are called aloud. */

const LETTER_NAMES: Record<string, string> = {
  а: 'а', б: 'бе', в: 'ве', г: 'ге', ґ: 'ґе', д: 'де', е: 'е', є: 'є', ж: 'же', з: 'зе', и: 'и', і: 'і', ї: 'ї', й: 'йот', к: 'ка', л: 'ел', м: 'ем',
  н: 'ен', о: 'о', п: 'пе', р: 'ер', с: 'ес', т: 'те', у: 'у', ф: 'еф', х: 'ха', ц: 'це', ч: 'че', ш: 'ша', щ: 'ща', ь: 'м’який знак', ю: 'ю', я: 'я',
};

/**
 * How a Ukrainian letter is called aloud: «бе», «же», «м’який знак». A lone
 * letter handed to a speech engine is read unpredictably (or not at all).
 */
export const letterName = (letter: string): string => LETTER_NAMES[letter.toLocaleLowerCase('uk')] ?? letter;
