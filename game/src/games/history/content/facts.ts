import TEXTS from '@/locales/app/uk/games/history.json';

const J = TEXTS.content.facts;

/**
 * Pools of facts for the History games: each task tells its own story plus
 * these, so it has at least ten to choose from.
 */

export const DIET_FACTS: Record<'meat' | 'plants', string[]> = J.DIET_FACTS;

/** Nine per epoch; an epoch task adds its own story on top. */
export const EPOCH_FACTS: Record<'stone' | 'ancient' | 'medieval' | 'modern', string[]> = J.EPOCH_FACTS;

/** What a famous person was: decides which pool of stories follows their own. */
export type Calling = 'science' | 'art' | 'explore' | 'music' | 'writing' | 'leading' | 'inventing';

export const CALLING_OF: Record<string, Calling> = {
  // world
  einstein: 'science', newton: 'science', galileo: 'science', curie: 'science', darwin: 'science', archimedes: 'science',
  copernicus: 'science', pythagoras: 'science', goodall: 'science', tesla: 'inventing',
  davinci: 'art', picasso: 'art', vangogh: 'art', michelangelo: 'art', chaplin: 'art',
  columbus: 'explore', armstrong: 'explore', magellan: 'explore', marcopolo: 'explore', cousteau: 'explore',
  mozart: 'music', beethoven: 'music', shakespeare: 'writing', andersen: 'writing',
  cleopatra: 'leading', joan: 'leading', alexander: 'leading', nightingale: 'leading',
  gutenberg: 'inventing', edison: 'inventing', wright: 'inventing', jobs: 'inventing',
  // Ukraine
  shevchenko: 'writing', lesia: 'writing', franko: 'writing', skovoroda: 'writing', leontovych: 'music',
  prymachenko: 'art', yaroslav: 'leading', olha: 'leading', khmelnytsky: 'leading',
  korolov: 'inventing', sikorsky: 'inventing', kadeniuk: 'explore', amosov: 'science',
};

/** Nine stories per calling; a person's own fact makes the tenth. */
export const CALLING_FACTS: Record<Calling, string[]> = J.CALLING_FACTS;

/** Nine stories about inventing; an invention's own fact makes the tenth. */
export const INVENTION_FACTS = J.INVENTION_FACTS;

export const UA_INVENTION_FACTS = J.UA_INVENTION_FACTS;

/** For «put in order» and «how long ago» tasks of «Часова Машина». */
export const TIME_FACTS = J.TIME_FACTS;

/** For «which came first» tasks of «Часова Машина». */
export const FIRST_FACTS = J.FIRST_FACTS;
