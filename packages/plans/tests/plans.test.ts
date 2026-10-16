import assert from 'node:assert/strict';
import { test } from 'node:test';
import { firstView, formatPrice, totalOf, yearAgainstMonths, type Catalog } from '../src/index.ts';

const catalog: Catalog = {
  country: 'UA',
  region: 'UA',
  regions: [{ id: 'UA', currency: 'UAH', countries: ['UA'], fallback: false, langs: ['uk'] }],
  plans: [
    { id: 'basic', kind: 'free', name: { uk: 'Базовий' }, tagline: {}, badge: {}, features: {}, facts: { dailyMinutes: 15 }, prices: [], extraChild: [] },
    {
      id: 'family', kind: 'paid', name: { uk: 'Family' }, tagline: {}, badge: {}, features: {}, facts: { trialDays: 7, childrenIncluded: 2 },
      prices: [{ region: 'UA', period: 'month', amount: 7900, currency: 'UAH' }, { region: 'UA', period: 'year', amount: 59900, currency: 'UAH' }],
      extraChild: [{ region: 'UA', period: 'month', amount: 1900, currency: 'UAH' }, { region: 'UA', period: 'year', amount: 13900, currency: 'UAH' }],
    },
  ],
};

test('a choice of period and children costs the plan and every child beyond those included', () => {
  const view = firstView(catalog, 'uk')!;
  assert.deepEqual(view, { region: 'UA', period: 'year', children: 2 });
  assert.equal(totalOf(catalog, view)?.amount, 59900);
  assert.equal(totalOf(catalog, { ...view, children: 4 })?.amount, 59900 + 2 * 13900);
  assert.deepEqual(yearAgainstMonths(catalog, view), { full: 7900 * 12, saving: 37 });
  assert.equal(formatPrice(7900, 'UAH', 'uk'), '79 ₴');
  assert.equal(formatPrice(899, 'CAD', 'en'), 'CA$8.99');
});
