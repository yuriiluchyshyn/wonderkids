import type { Paint } from '@/core/game/templates/types';

/** `name` — the colour as a paint; `paint` — «… фарба», for hints. */
export const PAINTS = {
  red: { id: 'red', name: 'Червоний', color: '#ef4444', paint: 'червону' },
  yellow: { id: 'yellow', name: 'Жовтий', color: '#facc15', paint: 'жовту' },
  blue: { id: 'blue', name: 'Синій', color: '#2563eb', paint: 'синю' },
  white: { id: 'white', name: 'Білий', color: '#ffffff', paint: 'білу' },
  black: { id: 'black', name: 'Чорний', color: '#111827', paint: 'чорну' },
  green: { id: 'green', name: 'Зелений', color: '#22c55e', paint: 'зелену' },
  orange: { id: 'orange', name: 'Помаранчевий', color: '#f97316', paint: 'помаранчеву' },
} satisfies Record<string, Paint & { paint: string }>;
export type PaintId = keyof typeof PAINTS;

/** What two paints give together. */
export const MIXES = {
  green: { name: 'Зелений', color: '#22c55e', recipe: ['yellow', 'blue'] },
  orange: { name: 'Помаранчевий', color: '#f97316', recipe: ['red', 'yellow'] },
  purple: { name: 'Фіолетовий', color: '#8b5cf6', recipe: ['red', 'blue'] },
  pink: { name: 'Рожевий', color: '#f9a8d4', recipe: ['red', 'white'] },
  grey: { name: 'Сірий', color: '#9ca3af', recipe: ['black', 'white'] },
  sky: { name: 'Блакитний', color: '#7dd3fc', recipe: ['blue', 'white'] },
  navy: { name: 'Темно-синій', color: '#1e3a8a', recipe: ['blue', 'black'] },
  peach: { name: 'Персиковий', color: '#fdba74', recipe: ['orange', 'white'] },
  brown: { name: 'Коричневий', color: '#92400e', recipe: ['red', 'green'] },
  lime: { name: 'Салатовий', color: '#a3e635', recipe: ['yellow', 'green'] },
  forest: { name: 'Темно-зелений', color: '#166534', recipe: ['green', 'black'] },
} satisfies Record<string, { name: string; color: string; recipe: [PaintId, PaintId] }>;
export type MixId = keyof typeof MIXES;

export const PRIMARY: PaintId[] = ['red', 'yellow', 'blue'];
export const WITH_WHITE: PaintId[] = [...PRIMARY, 'white'];
export const SHADES: PaintId[] = [...PRIMARY, 'white', 'black'];
export const PEACH: PaintId[] = ['red', 'yellow', 'white', 'orange', 'blue'];
export const RICH: PaintId[] = ['red', 'yellow', 'blue', 'green', 'black'];

/**
 * One path step: the tubes on the table and the things to paint —
 * [picture, name, «… має стати …», colour]. Steps 1–3 the basic mixes,
 * 4–7 tints with white and black, 8–10 mixes with a ready-mixed colour.
 */
export const STEPS: { tubes: PaintId[]; things: [emoji: string, name: string, need: string, mix: MixId][] }[] = [
  { tubes: PRIMARY, things: [['🐸', 'Жабка', 'Жабка має стати зеленою', 'green'], ['🍊', 'Апельсин', 'Апельсин має стати помаранчевим', 'orange'], ['🍃', 'Листок', 'Листок має стати зеленим', 'green'], ['🥕', 'Морквина', 'Морквина має стати помаранчевою', 'orange']] },
  { tubes: PRIMARY, things: [['🍇', 'Виноград', 'Виноград має стати фіолетовим', 'purple'], ['🍆', 'Баклажан', 'Баклажан має стати фіолетовим', 'purple'], ['🐊', 'Крокодил', 'Крокодил має стати зеленим', 'green'], ['🎃', 'Гарбуз', 'Гарбуз має стати помаранчевим', 'orange']] },
  { tubes: WITH_WHITE, things: [['🥒', 'Огірок', 'Огірок має стати зеленим', 'green'], ['🦊', 'Лисичка', 'Лисичка має стати помаранчевою', 'orange'], ['☂️', 'Парасолька', 'Парасолька має стати фіолетовою', 'purple']] },
  { tubes: SHADES, things: [['🐷', 'Свинка', 'Свинка має стати рожевою', 'pink'], ['🐘', 'Слон', 'Слон має стати сірим', 'grey'], ['🌸', 'Квітка', 'Квітка має стати рожевою', 'pink']] },
  { tubes: SHADES, things: [['🐭', 'Мишка', 'Мишка має стати сірою', 'grey'], ['🐳', 'Кит', 'Кит має стати блакитним', 'sky'], ['🦩', 'Фламінго', 'Фламінго має стати рожевим', 'pink']] },
  { tubes: SHADES, things: [['🫐', 'Лохина', 'Лохина має стати темно-синьою', 'navy'], ['👖', 'Джинси', 'Джинси мають стати темно-синіми', 'navy'], ['🐺', 'Вовк', 'Вовк має стати сірим', 'grey']] },
  { tubes: PEACH, things: [['🍑', 'Персик', 'Персик має стати персиковим', 'peach'], ['🦋', 'Метелик', 'Метелик має стати блакитним', 'sky'], ['🎀', 'Бантик', 'Бантик має стати рожевим', 'pink']] },
  { tubes: RICH, things: [['🐻', 'Ведмідь', 'Ведмідь має стати коричневим', 'brown'], ['🌰', 'Каштан', 'Каштан має стати коричневим', 'brown'], ['🍫', 'Шоколад', 'Шоколад має стати коричневим', 'brown']] },
  { tubes: RICH, things: [['🍏', 'Яблуко', 'Яблуко має стати салатовим', 'lime'], ['🍐', 'Груша', 'Груша має стати салатовою', 'lime'], ['🥬', 'Салат', 'Салат має стати салатовим', 'lime']] },
  { tubes: RICH, things: [['🌲', 'Ялинка', 'Ялинка має стати темно-зеленою', 'forest'], ['🥦', 'Броколі', 'Броколі має стати темно-зеленою', 'forest'], ['🥔', 'Картопля', 'Картопля має стати коричневою', 'brown']] },
];

export const COLOR_FACTS = [
  'Червоний, жовтий і синій — основні кольори: з них можна змішати майже всі інші.',
  'Біла фарба робить будь-який колір світлішим і ніжнішим.',
  'Чорна фарба робить колір темнішим — її треба додавати по крапельці.',
  'У веселці сім кольорів: червоний, помаранчевий, жовтий, зелений, блакитний, синій, фіолетовий.',
  'Якщо змішати всі фарби одразу, вийде брудно-коричневий колір.',
  'Червоний, помаранчевий і жовтий називають теплими кольорами — вони нагадують сонце й вогонь.',
  'Синій, блакитний і зелений — холодні кольори: як вода, лід і тінь.',
  'Художники змішують фарби на дощечці, яка зветься палітра.',
  'Давні художники робили фарби з глини, вугілля, ягід і каміння.',
  'Хамелеон уміє змінювати колір своєї шкіри.',
  'Бджоли бачать кольори не так, як люди: червоного вони не розрізняють.',
];
