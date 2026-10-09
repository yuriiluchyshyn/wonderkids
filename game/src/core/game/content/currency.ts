/**
 * The money the shop game counts in — chosen by the parent (hryvnias unless
 * they say otherwise). Only whole units: coins for the small values, paper
 * notes for the big ones, as in the country's real money.
 */
import { language, type LangCode } from '@/core/lang';

export enum Currency {
  UAH = 'UAH',
  EUR = 'EUR',
  USD = 'USD',
  GBP = 'GBP',
  PLN = 'PLN',
}
export type CurrencyId = `${Currency}`;

export interface CurrencyDef {
  id: CurrencyId;
  /** As the parent's settings name it. */
  name: string;
  flag: string;
  /** Printed on coins and notes: «₴». */
  sign: string;
  /** Printed on a price tag: «грн». */
  short: string;
  /** «1 гривня», «2 гривні», «5 гривень». */
  counted: readonly [one: string, few: string, many: string];
  gender: 'm' | 'f' | 'n';
  /** The small change: «коп», «копійок», and the rule the helper reminds of — «В одній гривні — сто копійок.» */
  minor: { short: string; many: string; rule: string };
  /** Values that are coins; every other value of `values` is a paper note. */
  coins: readonly number[];
  /** Coins and notes a wallet may hold, biggest first. */
  values: readonly number[];
}

export const CURRENCIES: Record<CurrencyId, CurrencyDef> = {
  UAH: { id: 'UAH', name: 'Гривня', flag: '🇺🇦', sign: '₴', short: 'грн', counted: ['гривня', 'гривні', 'гривень'], gender: 'f', minor: { short: 'коп', many: 'копійок', rule: 'В одній гривні — сто копійок.' }, coins: [1, 2, 5, 10], values: [100, 50, 20, 10, 5, 2, 1] },
  EUR: { id: 'EUR', name: 'Євро', flag: '🇪🇺', sign: '€', short: '€', counted: ['євро', 'євро', 'євро'], gender: 'n', minor: { short: 'ц', many: 'центів', rule: 'В одному євро — сто центів.' }, coins: [1, 2], values: [100, 50, 20, 10, 5, 2, 1] },
  USD: { id: 'USD', name: 'Долар', flag: '🇺🇸', sign: '$', short: '$', counted: ['долар', 'долари', 'доларів'], gender: 'm', minor: { short: '¢', many: 'центів', rule: 'В одному доларі — сто центів.' }, coins: [1], values: [100, 50, 20, 10, 5, 2, 1] },
  GBP: { id: 'GBP', name: 'Фунт', flag: '🇬🇧', sign: '£', short: '£', counted: ['фунт', 'фунти', 'фунтів'], gender: 'm', minor: { short: 'п', many: 'пенсів', rule: 'В одному фунті — сто пенсів.' }, coins: [1, 2], values: [50, 20, 10, 5, 2, 1] },
  PLN: { id: 'PLN', name: 'Злотий', flag: '🇵🇱', sign: 'zł', short: 'zł', counted: ['злотий', 'злоті', 'злотих'], gender: 'm', minor: { short: 'гр', many: 'грошів', rule: 'В одному злотому — сто грошів.' }, coins: [1, 2, 5], values: [100, 50, 20, 10, 5, 2, 1] },
};

export const DEFAULT_CURRENCY: CurrencyId = Currency.UAH;

export const isCurrency = (value: unknown): value is CurrencyId => typeof value === 'string' && value in CURRENCIES;
/**
 * The money of a child's game: what the parent chose — or, while they have
 * chosen nothing, the money at home with the language of the game (hryvnias in
 * Ukrainian, dollars in English, złotys in Polish). Once chosen it stays,
 * whatever the language is changed to.
 */
export function effectiveCurrency(settings: { currency: CurrencyId; currencyChosen: boolean }, lang: LangCode): CurrencyId {
  if (settings.currencyChosen) return settings.currency;
  const own = language(lang).currency;
  return isCurrency(own) ? own : DEFAULT_CURRENCY;
}

export const currencyOf = (id: unknown): CurrencyDef => CURRENCIES[isCurrency(id) ? id : DEFAULT_CURRENCY];
