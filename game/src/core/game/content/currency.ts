/**
 * The money the shop game counts in — chosen by the parent (hryvnias unless
 * they say otherwise). Only whole units: coins for the small values, paper
 * notes for the big ones, as in the country's real money.
 */
import { language, type LangCode } from '@/core/language';
import TEXTS from '../../../locales/app/uk/content.json' with { type: 'json' };

const J = TEXTS.currency;

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
  UAH: { id: 'UAH', name: J.CURRENCIES.UAH.name, flag: '🇺🇦', sign: '₴', short: J.CURRENCIES.UAH.short, counted: [J.CURRENCIES.UAH.counted[0], J.CURRENCIES.UAH.counted[1], J.CURRENCIES.UAH.counted[2]], gender: 'f', minor: J.CURRENCIES.UAH.minor, coins: [1, 2, 5, 10], values: [100, 50, 20, 10, 5, 2, 1] },
  EUR: { id: 'EUR', name: J.CURRENCIES.EUR.name, flag: '🇪🇺', sign: '€', short: '€', counted: [J.CURRENCIES.EUR.counted[0], J.CURRENCIES.EUR.counted[1], J.CURRENCIES.EUR.counted[2]], gender: 'n', minor: J.CURRENCIES.EUR.minor, coins: [1, 2], values: [100, 50, 20, 10, 5, 2, 1] },
  USD: { id: 'USD', name: J.CURRENCIES.USD.name, flag: '🇺🇸', sign: '$', short: '$', counted: [J.CURRENCIES.USD.counted[0], J.CURRENCIES.USD.counted[1], J.CURRENCIES.USD.counted[2]], gender: 'm', minor: { short: '¢', many: J.CURRENCIES.USD.minor.many, rule: J.CURRENCIES.USD.minor.rule }, coins: [1], values: [100, 50, 20, 10, 5, 2, 1] },
  GBP: { id: 'GBP', name: J.CURRENCIES.GBP.name, flag: '🇬🇧', sign: '£', short: '£', counted: [J.CURRENCIES.GBP.counted[0], J.CURRENCIES.GBP.counted[1], J.CURRENCIES.GBP.counted[2]], gender: 'm', minor: J.CURRENCIES.GBP.minor, coins: [1, 2], values: [50, 20, 10, 5, 2, 1] },
  PLN: { id: 'PLN', name: J.CURRENCIES.PLN.name, flag: '🇵🇱', sign: 'zł', short: 'zł', counted: [J.CURRENCIES.PLN.counted[0], J.CURRENCIES.PLN.counted[1], J.CURRENCIES.PLN.counted[2]], gender: 'm', minor: J.CURRENCIES.PLN.minor, coins: [1, 2, 5], values: [100, 50, 20, 10, 5, 2, 1] },
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
