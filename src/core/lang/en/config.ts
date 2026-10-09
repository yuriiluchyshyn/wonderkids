import type { LanguageConfig } from '../types.ts';

export const config: LanguageConfig = {
  code: 'en',
  name: 'English',
  short: 'Eng',
  flag: '🇬🇧',
  // American reading — it matches the cloud voice (`api/_lib/tts.js`):
  // «one hundred twenty», «two thousand five», «zee».
  locale: 'en-US',
  // The language offered wherever no other one is at home.
  currency: 'USD',
  countries: [],
};
